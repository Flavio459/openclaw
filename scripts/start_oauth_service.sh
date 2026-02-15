#!/bin/bash

# ============================================
# SCRIPT DE INICIALIZAÇÃO DO SERVIDOR OAUTH PROFISSIONAL
# Para Google Antigravity Authentication
# ============================================

set -e

# Configurações
OAUTH_PORT=51121
LOG_FILE="/tmp/oauth_server.log"
PID_FILE="/tmp/oauth_server.pid"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_JS="$SCRIPT_DIR/professional_oauth_server.js"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Por favor, instale Node.js v16+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    log_info "Node.js versão: $NODE_VERSION"
}

# Verificar se porta está disponível
check_port() {
    if lsof -Pi :$OAUTH_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -ti:$OAUTH_PORT)
        log_warning "Porta $OAUTH_PORT já em uso pelo PID: $PID"
        
        # Verificar se é nosso próprio processo
        if [ -f "$PID_FILE" ]; then
            STORED_PID=$(cat "$PID_FILE")
            if [ "$PID" == "$STORED_PID" ]; then
                log_info "Servidor OAuth já está rodando (PID: $PID)"
                return 1
            fi
        fi
        
        log_error "Porta $OAUTH_PORT ocupada por outro processo"
        return 2
    fi
    return 0
}

# Iniciar servidor
start_server() {
    log_info "Iniciando servidor OAuth profissional..."
    
    # Verificar se arquivo do servidor existe
    if [ ! -f "$SERVER_JS" ]; then
        log_error "Arquivo do servidor não encontrado: $SERVER_JS"
        exit 1
    fi
    
    # Iniciar servidor em background
    node "$SERVER_JS" > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    # Salvar PID
    echo $SERVER_PID > "$PID_FILE"
    
    log_info "Servidor iniciado com PID: $SERVER_PID"
    log_info "Logs: $LOG_FILE"
    
    # Aguardar servidor iniciar
    sleep 2
    
    # Verificar se servidor está respondendo
    if curl -s "http://localhost:$OAUTH_PORT/health" >/dev/null 2>&1; then
        log_success "Servidor OAuth rodando em http://localhost:$OAUTH_PORT"
        log_info "Health check: http://localhost:$OAUTH_PORT/health"
        log_info "Documentação: http://localhost:$OAUTH_PORT/"
    else
        log_warning "Servidor iniciado mas não responde ao health check"
        log_info "Verifique os logs: tail -f $LOG_FILE"
    fi
}

# Parar servidor
stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        
        if kill -0 $PID >/dev/null 2>&1; then
            log_info "Parando servidor OAuth (PID: $PID)..."
            kill $PID
            
            # Aguardar processo terminar
            for i in {1..10}; do
                if ! kill -0 $PID >/dev/null 2>&1; then
                    break
                fi
                sleep 1
            done
            
            if kill -0 $PID >/dev/null 2>&1; then
                log_warning "Servidor não respondeu ao SIGTERM, forçando término..."
                kill -9 $PID
            fi
            
            rm -f "$PID_FILE"
            log_success "Servidor OAuth parado"
        else
            log_warning "Processo $PID não está rodando"
            rm -f "$PID_FILE"
        fi
    else
        log_warning "Arquivo PID não encontrado: $PID_FILE"
        
        # Tentar encontrar processo pela porta
        PORT_PID=$(lsof -ti:$OAUTH_PORT 2>/dev/null || true)
        if [ -n "$PORT_PID" ]; then
            log_info "Encontrado processo na porta $OAUTH_PORT: $PORT_PID"
            read -p "Deseja parar este processo? (s/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                kill $PORT_PID
                log_success "Processo $PORT_PID parado"
            fi
        else
            log_info "Nenhum servidor OAuth encontrado rodando"
        fi
    fi
}

# Status do servidor
status_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        
        if kill -0 $PID >/dev/null 2>&1; then
            log_success "Servidor OAuth rodando (PID: $PID)"
            
            # Testar health check
            if curl -s "http://localhost:$OAUTH_PORT/health" >/dev/null 2>&1; then
                log_info "Health check: ✅ OK"
                log_info "URL: http://localhost:$OAUTH_PORT"
            else
                log_warning "Health check: ❌ FALHOU"
            fi
            
            # Mostrar últimas linhas do log
            if [ -f "$LOG_FILE" ]; then
                log_info "Últimas linhas do log:"
                tail -5 "$LOG_FILE" | sed 's/^/  /'
            fi
            
            return 0
        else
            log_warning "PID $PID existe mas processo não está rodando"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        # Verificar pela porta
        if lsof -Pi :$OAUTH_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            PID=$(lsof -ti:$OAUTH_PORT)
            log_warning "Servidor na porta $OAUTH_PORT (PID: $PID) mas não gerenciado por este script"
            return 2
        else
            log_info "Servidor OAuth não está rodando"
            return 3
        fi
    fi
}

# Mostrar logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        log_info "Mostrando logs do servidor OAuth:"
        tail -50 "$LOG_FILE"
    else
        log_warning "Arquivo de log não encontrado: $LOG_FILE"
    fi
}

# Testar servidor
test_server() {
    log_info "Testando servidor OAuth..."
    
    # Verificar se servidor está rodando
    if ! status_server >/dev/null 2>&1; then
        log_error "Servidor não está rodando. Inicie primeiro com: $0 start"
        return 1
    fi
    
    # Testar health check
    log_info "1. Testando health check..."
    if curl -s "http://localhost:$OAUTH_PORT/health" | grep -q '"status":"ok"'; then
        log_success "  ✅ Health check OK"
    else
        log_error "  ❌ Health check falhou"
        return 1
    fi
    
    # Testar endpoint de iniciação
    log_info "2. Testando endpoint /oauth-init..."
    RESPONSE=$(curl -s "http://localhost:$OAUTH_PORT/oauth-init")
    if echo "$RESPONSE" | grep -q '"auth_url"'; then
        log_success "  ✅ Endpoint /oauth-init funcionando"
        STATE=$(echo "$RESPONSE" | grep -o '"state":"[^"]*"' | cut -d'"' -f4)
        log_info "  State gerado: $STATE"
    else
        log_error "  ❌ Endpoint /oauth-init falhou"
        return 1
    fi
    
    # Testar página inicial
    log_info "3. Testando página inicial..."
    if curl -s "http://localhost:$OAUTH_PORT/" | grep -q "Professional OAuth Server"; then
        log_success "  ✅ Página inicial carregada"
    else
        log_warning "  ⚠️  Página inicial pode não estar carregando corretamente"
    fi
    
    log_success "Todos os testes passaram! 🎉"
    log_info "Servidor OAuth pronto para uso."
    log_info "Acesse: http://localhost:$OAUTH_PORT"
}

# Integrar com OpenClaw
integrate_openclaw() {
    log_info "Configurando integração com OpenClaw..."
    
    CONFIG_FILE="/home/node/.openclaw/openclaw.json"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Arquivo de configuração do OpenClaw não encontrado: $CONFIG_FILE"
        return 1
    fi
    
    # Verificar se plugin está habilitado
    if grep -q '"google-antigravity-auth"' "$CONFIG_FILE"; then
        log_warning "Plugin google-antigravity-auth está habilitado no OpenClaw"
        log_info "Recomendação: Desabilitar plugin oficial e usar nosso servidor profissional"
        
        read -p "Deseja desabilitar o plugin oficial? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            # Criar backup
            BACKUP_FILE="${CONFIG_FILE}.bak.$(date +%Y%m%d_%H%M%S)"
            cp "$CONFIG_FILE" "$BACKUP_FILE"
            log_info "Backup criado: $BACKUP_FILE"
            
            # Desabilitar plugin (simplificado - em produção usar jq)
            log_info "Atualizando configuração do OpenClaw..."
            # Nota: Em produção, usar jq para manipulação JSON segura
            log_warning "Atualização manual necessária: Edite $CONFIG_FILE"
            log_info "Altere: \"google-antigravity-auth\": { \"enabled\": true }"
            log_info "Para:   \"google-antigravity-auth\": { \"enabled\": false }"
        fi
    else
        log_info "Plugin google-antigravity-auth não encontrado na configuração"
    fi
    
    log_info "Para usar o servidor OAuth profissional com OpenClaw:"
    log_info "1. Mantenha servidor rodando: $0 start"
    log_info "2. Use a API REST para autenticação:"
    log_info "   - GET /oauth-init para iniciar fluxo"
    log_info "   - GET /get-token para obter tokens"
    log_info "3. Configure tokens manualmente no OpenClaw se necessário"
}

# Mostrar ajuda
show_help() {
    echo -e "${BLUE}=== SERVIDOR OAUTH PROFISSIONAL PARA ANTIGRAVITY ===${NC}"
    echo
    echo "Uso: $0 {start|stop|restart|status|test|logs|integrate|help}"
    echo
    echo "Comandos:"
    echo "  start     - Iniciar servidor OAuth"
    echo "  stop      - Parar servidor OAuth"
    echo "  restart   - Reiniciar servidor OAuth"
    echo "  status    - Verificar status do servidor"
    echo "  test      - Testar funcionalidade do servidor"
    echo "  logs      - Mostrar logs do servidor"
    echo "  integrate - Configurar integração com OpenClaw"
    echo "  help      - Mostrar esta ajuda"
    echo
    echo "Porta: $OAUTH_PORT"
    echo "Logs: $LOG_FILE"
    echo "PID: $PID_FILE"
    echo
    echo "Documentação: http://localhost:$OAUTH_PORT/ (quando rodando)"
}

# Main
case "$1" in
    start)
        check_node
        check_port
        if [ $? -eq 0 ]; then
            start_server
        elif [ $? -eq 1 ]; then
            log_info "Servidor já está rodando"
        else
            exit 1
        fi
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 2
        check_node
        check_port
        start_server
        ;;
    status)
        status_server
        ;;
    test)
        test_server
        ;;
    logs)
        show_logs
        ;;
    integrate)
        integrate_openclaw
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Comando inválido: $1"
        echo
        show_help
        exit 1
        ;;
esac

exit 0