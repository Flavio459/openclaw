#!/bin/bash
# Gerenciador Git para Ambiente Flavius
# flavius9ia@gmail.com - Ambiente Operacional Autônomo

set -e

WORKSPACE="/home/node/.openclaw/workspace"
REPO_NAME="flavius9ia-OPF"  # OpenClaw Personal Flavius
GIT_USER="Flavius Magnus Magnificus"
GIT_EMAIL="flavius9ia@gmail.com"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}   Git Manager - Ambiente Flavius       ${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo -e "Repositório: ${YELLOW}$REPO_NAME${NC}"
    echo -e "Usuário: ${GREEN}$GIT_USER${NC}"
    echo -e "Email: ${GREEN}$GIT_EMAIL${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

check_git_config() {
    print_info "Verificando configuração Git..."
    
    CURRENT_USER=$(git config --global user.name 2>/dev/null || echo "Não configurado")
    CURRENT_EMAIL=$(git config --global user.email 2>/dev/null || echo "Não configurado")
    
    if [[ "$CURRENT_USER" != "$GIT_USER" ]] || [[ "$CURRENT_EMAIL" != "$GIT_EMAIL" ]]; then
        print_info "Configurando Git para ambiente Flavius..."
        git config --global user.name "$GIT_USER"
        git config --global user.email "$GIT_EMAIL"
        print_success "Git configurado: $GIT_USER <$GIT_EMAIL>"
    else
        print_success "Git já configurado corretamente"
    fi
}

init_flavius_repo() {
    print_info "Inicializando repositório Flavius..."
    
    cd "$WORKSPACE"
    
    # Verificar se já é um repositório Git
    if [ -d ".git" ]; then
        print_info "Repositório Git já inicializado"
        
        # Verificar remote atual
        CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "Nenhum remote")
        print_info "Remote atual: $CURRENT_REMOTE"
        
        # Perguntar se quer mudar para repositório Flavius
        read -p "Deseja criar novo repositório para Flavius? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            # Criar novo branch para Flavius
            git checkout -b flavius-environment 2>/dev/null || git checkout flavius-environment
            print_success "Branch 'flavius-environment' criado/selecionado"
        fi
    else
        # Inicializar novo repositório
        git init
        print_success "Repositório Git inicializado"
    fi
}

add_oauth_files() {
    print_info "Adicionando arquivos de configuração OAuth..."
    
    # Arquivos específicos do ambiente Flavius
    FILES=(
        "flavius-oauth-config.md"
        "oauth_proxy.py"
        "simple_oauth_server.py"
        "debug_oauth.py"
        "test_oauth.py"
        "memory/2026-02-14.md"
    )
    
    for file in "${FILES[@]}"; do
        if [ -f "$WORKSPACE/$file" ]; then
            git add "$file"
            echo -e "  📄 $file"
        fi
    done
    
    # Adicionar skills se existirem
    if [ -d "$WORKSPACE/skills" ]; then
        git add skills/
        echo -e "  📁 skills/"
    fi
    
    print_success "Arquivos adicionados ao staging"
}

create_commit() {
    local message="$1"
    
    if [ -z "$message" ]; then
        message="Configuração OAuth Ambiente Flavius - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_info "Criando commit..."
    git commit -m "$message"
    
    if [ $? -eq 0 ]; then
        print_success "Commit criado: $message"
    else
        print_error "Falha ao criar commit"
        return 1
    fi
}

show_status() {
    print_info "Status do repositório:"
    echo ""
    git status --short
    echo ""
    
    print_info "Últimos commits:"
    echo ""
    git log --oneline -5 2>/dev/null || echo "Nenhum commit ainda"
    echo ""
}

setup_github_repo() {
    print_info "Configuração do repositório GitHub..."
    
    # URL do repositório GitHub para Flavius
    GITHUB_URL="https://github.com/flavius9ia/$REPO_NAME.git"
    
    echo -e "Repositório GitHub: ${YELLOW}$GITHUB_URL${NC}"
    echo ""
    echo "Para configurar:"
    echo "1. Crie o repositório '$REPO_NAME' em github.com/flavius9ia"
    echo "2. Adicione o remote: git remote add flavius $GITHUB_URL"
    echo "3. Faça push: git push -u flavius main"
    echo ""
    
    read -p "Deseja configurar remote agora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git remote add flavius "$GITHUB_URL" 2>/dev/null || print_info "Remote 'flavius' já existe"
        print_success "Remote 'flavius' configurado"
        print_info "Execute: git push -u flavius main"
    fi
}

main() {
    print_header
    
    # Navegar para workspace
    cd "$WORKSPACE" || {
        print_error "Workspace não encontrado: $WORKSPACE"
        exit 1
    }
    
    case "${1:-}" in
        "init")
            check_git_config
            init_flavius_repo
            ;;
        "add")
            add_oauth_files
            ;;
        "commit")
            add_oauth_files
            create_commit "$2"
            ;;
        "status")
            show_status
            ;;
        "github")
            setup_github_repo
            ;;
        "all")
            check_git_config
            init_flavius_repo
            add_oauth_files
            create_commit "Configuração completa Ambiente Flavius"
            show_status
            ;;
        *)
            echo -e "${YELLOW}Uso: $0 [comando]${NC}"
            echo ""
            echo "Comandos disponíveis:"
            echo "  init     - Inicializar repositório Flavius"
            echo "  add      - Adicionar arquivos OAuth"
            echo "  commit   - Fazer commit (opcional: mensagem)"
            echo "  status   - Mostrar status do repositório"
            echo "  github   - Configurar repositório GitHub"
            echo "  all      - Executar fluxo completo"
            echo ""
            echo "Exemplos:"
            echo "  $0 init"
            echo "  $0 commit \"Configuração OAuth\""
            echo "  $0 all"
            ;;
    esac
}

main "$@"