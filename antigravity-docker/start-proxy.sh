#!/bin/bash
#
# Script de inicialização do Proxy Antigravity
# Uso: ./start-proxy.sh [start|stop|restart|status|logs]
#

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="antigravity-proxy"
CONTAINER_NAME="antigravity-proxy"
HEALTH_URL="http://localhost:8080/health"
TIMEOUT=60

# Funções auxiliares
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está instalado
check_docker() {
    log_info "Verificando instalação do Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        echo "Instale o Docker seguindo: https://docs.docker.com/engine/install/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        echo "Instale o Docker Compose seguindo: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Verificar se Docker daemon está rodando
    if ! docker info &> /dev/null; then
        log_error "Docker daemon não está rodando!"
        echo "Inicie o Docker: sudo systemctl start docker"
        exit 1
    fi
    
    log_success "Docker e Docker Compose estão instalados e rodando"
}

# Detectar comando do compose
detect_compose() {
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
}

# Build da imagem
build_image() {
    log_info "Build da imagem Docker..."
    $COMPOSE_CMD -f $COMPOSE_FILE build --no-cache
    log_success "Build concluído"
}

# Iniciar serviço
start_service() {
    log_info "Iniciando serviço Antigravity Proxy..."
    $COMPOSE_CMD -f $COMPOSE_FILE up -d
    
    log_info "Aguardando container inicializar..."
    sleep 5
    
    # Aguardar healthcheck
    local attempts=0
    while [ $attempts -lt $TIMEOUT ]; do
        if docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null | grep -q "healthy"; then
            log_success "Serviço está saudável!"
            break
        fi
        
        if ! docker ps | grep -q $CONTAINER_NAME; then
            log_error "Container não está rodando!"
            show_logs
            exit 1
        fi
        
        echo -n "."
        sleep 2
        ((attempts++))
    done
    
    if [ $attempts -eq $TIMEOUT ]; then
        log_error "Timeout aguardando healthcheck"
        show_logs
        exit 1
    fi
}

# Testar conexão
test_connection() {
    log_info "Testando conexão..."
    
    if command -v curl &> /dev/null; then
        if curl -s -f $HEALTH_URL &> /dev/null; then
            log_success "Proxy respondendo em $HEALTH_URL"
        else
            log_warn "Proxy pode não estar respondendo ainda"
        fi
    else
        log_warn "curl não instalado, pulando teste de conexão"
    fi
    
    # Mostrar status
    show_status
}

# Mostrar status
show_status() {
    log_info "Status do serviço:"
    $COMPOSE_CMD -f $COMPOSE_FILE ps
    
    echo ""
    log_info "Container info:"
    docker inspect --format='Status: {{.State.Status}} | Health: {{.State.Health.Status}} | Uptime: {{.State.StartedAt}}' $CONTAINER_NAME 2>/dev/null || echo "Container não encontrado"
}

# Mostrar logs
show_logs() {
    log_info "Logs do serviço:"
    $COMPOSE_CMD -f $COMPOSE_FILE logs --tail=100 -f
}

# Parar serviço
stop_service() {
    log_info "Parando serviço..."
    $COMPOSE_CMD -f $COMPOSE_FILE down
    log_success "Serviço parado"
}

# Reiniciar serviço
restart_service() {
    stop_service
    sleep 2
    start_service
    test_connection
}

# Comando principal
case "${1:-start}" in
    start)
        check_docker
        detect_compose
        build_image
        start_service
        test_connection
        log_success "Proxy Antigravity iniciado com sucesso na porta 8080!"
        echo ""
        echo "Comandos úteis:"
        echo "  ./start-proxy.sh status  - Ver status"
        echo "  ./start-proxy.sh logs    - Ver logs"
        echo "  ./start-proxy.sh stop    - Parar serviço"
        echo "  ./start-proxy.sh restart - Reiniciar serviço"
        ;;
    stop)
        detect_compose
        stop_service
        ;;
    restart)
        check_docker
        detect_compose
        restart_service
        ;;
    status)
        detect_compose
        show_status
        ;;
    logs)
        detect_compose
        show_logs
        ;;
    build)
        check_docker
        detect_compose
        build_image
        ;;
    *)
        echo "Uso: $0 [start|stop|restart|status|logs|build]"
        exit 1
        ;;
esac