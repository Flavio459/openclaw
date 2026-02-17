#!/bin/bash
###############################################################################
# Script de Aplicação de Configuração WebChat - OpenClaw
# Aplica patch de debounce para resolver duplicação de mensagens
###############################################################################

set -euo pipefail

OPENCLAW_DIR="${OPENCLAW_DIR:-/home/node/.openclaw}"
CONFIG_FILE="$OPENCLAW_DIR/openclaw.json"
PATCH_FILE="$OPENCLAW_DIR/workspace/openclaw-webchat-patch.json"
BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d-%H%M%S)"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se jq está disponível
if ! command -v jq &> /dev/null; then
    log_error "jq não está instalado. Instale com: apt-get install jq"
    exit 1
fi

# Verificar arquivos
if [ ! -f "$CONFIG_FILE" ]; then
    log_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

log_info "Aplicando patch de configuração webchat..."

# Criar backup
cp "$CONFIG_FILE" "$BACKUP_FILE"
log_info "Backup criado: $BACKUP_FILE"

# Aplicar mudanças usando jq
# 1. Adicionar configuração webchat
# 2. Atualizar mensagens globais

jq --argfile patch "$PATCH_FILE" '
  # Adicionar/atualizar channels.webchat
  .channels.webchat = $patch.channels.webchat |
  
  # Atualizar messages com deduplication
  .messages.deduplicationEnabled = $patch.messages.deduplicationEnabled |
  .messages.deduplicationWindowMs = $patch.messages.deduplicationWindowMs
' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"

# Verificar se a operação foi bem-sucedida
if [ $? -eq 0 ] && [ -s "$CONFIG_FILE.tmp" ]; then
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    log_info "✓ Configuração aplicada com sucesso"
else
    log_error "✗ Falha ao aplicar configuração"
    rm -f "$CONFIG_FILE.tmp"
    exit 1
fi

# Verificar resultado
echo ""
log_info "Configuração atual de channels:"
jq '.channels' "$CONFIG_FILE"

echo ""
log_info "Configuração atual de messages:"
jq '.messages' "$CONFIG_FILE"

echo ""
log_warn "IMPORTANTE: Reinicie o gateway para aplicar as mudanças:"
echo "  docker restart openclaw-gateway"
echo "  ou"
echo "  docker-compose restart gateway"
