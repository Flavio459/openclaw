#!/bin/bash
###############################################################################
# Script de Limpeza de Sessões Stuck - OpenClaw
# Uso: ./cleanup-stuck-sessions.sh [--dry-run]
###############################################################################

set -euo pipefail

# Configurações
OPENCLAW_DIR="${OPENCLAW_DIR:-/home/node/.openclaw}"
SESSIONS_DIR="$OPENCLAW_DIR/agents/main/sessions"
ARCHIVE_DIR="$OPENCLAW_DIR/agents/main/sessions/archive"
LOCK_TIMEOUT_MINUTES=30
DRY_RUN=false

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de log
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            log_error "Argumento desconhecido: $1"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    log_warn "Modo DRY-RUN ativado - nenhuma alteração será feita"
fi

# Verificar diretório de sessões
if [ ! -d "$SESSIONS_DIR" ]; then
    log_error "Diretório de sessões não encontrado: $SESSIONS_DIR"
    exit 1
fi

# Criar diretório de arquivo se não existir
if [ "$DRY_RUN" = false ] && [ ! -d "$ARCHIVE_DIR" ]; then
    mkdir -p "$ARCHIVE_DIR"
    log_info "Diretório de arquivo criado: $ARCHIVE_DIR"
fi

# Contadores
LOCKS_REMOVED=0
SESSIONS_ARCHIVED=0
ERRORS=0

log_info "Iniciando limpeza de sessões stuck..."
log_info "Timeout configurado: ${LOCK_TIMEOUT_MINUTES} minutos"

# Encontrar e processar locks antigos
while IFS= read -r lockfile; do
    [ -z "$lockfile" ] && continue
    
    session_file="${lockfile%.lock}"
    session_name=$(basename "$session_file")
    
    log_warn "Lock antigo detectado: $session_name"
    
    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY-RUN] Seria removido: $lockfile"
        if [ -f "$session_file" ]; then
            echo "  [DRY-RUN] Seria arquivado: $session_file"
        fi
        continue
    fi
    
    # Remover lock
    if rm -f "$lockfile" 2>/dev/null; then
        log_info "  ✓ Lock removido: $lockfile"
        ((LOCKS_REMOVED++))
    else
        log_error "  ✗ Falha ao remover lock: $lockfile"
        ((ERRORS++))
        continue
    fi
    
    # Arquivar sessão se existir
    if [ -f "$session_file" ]; then
        archive_name="${session_name%.jsonl}.archived.$(date +%Y%m%d-%H%M%S).jsonl"
        if mv "$session_file" "$ARCHIVE_DIR/$archive_name" 2>/dev/null; then
            log_info "  ✓ Sessão arquivada: $archive_name"
            ((SESSIONS_ARCHIVED++))
        else
            log_error "  ✗ Falha ao arquivar sessão: $session_file"
            ((ERRORS++))
        fi
    fi
    
done < <(find "$SESSIONS_DIR" -maxdepth 1 -name "*.lock" -mmin +$LOCK_TIMEOUT_MINUTES -type f 2>/dev/null)

# Resumo
echo ""
log_info "========== RESUMO =========="
log_info "Locks removidos: $LOCKS_REMOVED"
log_info "Sessões arquivadas: $SESSIONS_ARCHIVED"
log_info "Erros: $ERRORS"

if [ "$DRY_RUN" = true ]; then
    log_warn "Modo DRY-RUN - nenhuma alteração foi feita"
fi

# Verificar locks restantes
echo ""
log_info "Locks atualmente ativos:"
find "$SESSIONS_DIR" -maxdepth 1 -name "*.lock" -type f -exec ls -la {} \; 2>/dev/null || echo "  (nenhum)"

exit $ERRORS
