#!/bin/bash
# Setup GitHub para Ambiente Flavius
# Execute após criar repositório e gerar token

set -e

WORKSPACE="/home/node/.openclaw/workspace"
REPO_NAME="flavius9ia-OPF"
GITHUB_USER="flavius9ia"
GITHUB_EMAIL="flavius9ia@gmail.com"

echo "🚀 Configurando GitHub para Ambiente Flavius"
echo "============================================="

# Verificar parâmetros
if [ $# -lt 1 ]; then
    echo "❌ Uso: $0 <GITHUB_PERSONAL_ACCESS_TOKEN>"
    echo ""
    echo "📋 Pré-requisitos:"
    echo "1. Repositório criado: https://github.com/flavius9ia/flavius9ia-OPF"
    echo "2. Token gerado: https://github.com/settings/tokens"
    echo ""
    echo "🔒 O token será usado apenas para configurar o remote"
    exit 1
fi

GITHUB_TOKEN="$1"

# Configurar Git para Flavius
echo ""
echo "📝 Configurando Git para Flavius..."
git config --global user.name "Flavius Magnus Magnificus"
git config --global user.email "$GITHUB_EMAIL"
echo "✅ Git configurado"

# Navegar para workspace
cd "$WORKSPACE"

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "🌿 Branch atual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "flavius-environment" ]; then
    echo "🔄 Alternando para branch flavius-environment..."
    git checkout flavius-environment 2>/dev/null || {
        echo "❌ Branch flavius-environment não encontrado"
        exit 1
    }
fi

# Configurar remote com token
echo ""
echo "🔗 Configurando remote GitHub..."
GITHUB_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Remover remote existente se houver
git remote remove flavius 2>/dev/null || true

# Adicionar novo remote
git remote add flavius "$GITHUB_URL"

# Verificar remote
REMOTE_URL=$(git remote get-url flavius)
echo "✅ Remote configurado: ${REMOTE_URL//$GITHUB_TOKEN/***}"

# Fazer primeiro push
echo ""
echo "📤 Fazendo primeiro push para GitHub..."
if git push -u flavius flavius-environment; then
    echo "✅ Push realizado com sucesso!"
else
    echo "❌ Falha no push. Verifique:"
    echo "   - Token tem permissões 'repo'"
    echo "   - Repositório existe: https://github.com/flavius9ia/flavius9ia-OPF"
    echo "   - Token não expirou"
    exit 1
fi

# Configurar tracking
echo ""
echo "🎯 Configurando tracking branch..."
git branch --set-upstream-to=flavius/flavius-environment flavius-environment
echo "✅ Tracking configurado"

# Verificar status
echo ""
echo "📊 Status final:"
echo "================="
echo "Repositório: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo "Branch: $(git branch --show-current)"
echo "Remote: flavius"
echo "Último commit: $(git log --oneline -1)"

# Criar arquivo de configuração segura (sem token)
echo ""
echo "🔐 Criando configuração segura..."
cat > "$WORKSPACE/.github-flavius-config" << EOF
# Configuração GitHub Ambiente Flavius
# NÃO inclui token por segurança

GITHUB_USER="$GITHUB_USER"
GITHUB_EMAIL="$GITHUB_EMAIL"
REPO_NAME="$REPO_NAME"
REPO_URL="https://github.com/\${GITHUB_USER}/\${REPO_NAME}"
BRANCH="flavius-environment"
REMOTE_NAME="flavius"

# Para atualizar token:
# git remote set-url flavius https://\${GITHUB_USER}:\${NEW_TOKEN}@github.com/\${GITHUB_USER}/\${REPO_NAME}.git

EOF
chmod 600 "$WORKSPACE/.github-flavius-config"
echo "✅ Configuração salva em: $WORKSPACE/.github-flavius-config"

# Instruções para uso futuro
echo ""
echo "🎯 Comandos para uso futuro:"
echo "============================="
echo "git status                     # Verificar status"
echo "git add <arquivos>             # Adicionar alterações"
echo "git commit -m \"mensagem\"      # Criar commit"
echo "git push                       # Enviar para GitHub"
echo "git pull                       # Atualizar do GitHub"
echo ""
echo "git remote -v                  # Verificar remotes"
echo "git log --oneline -10          # Ver últimos commits"

echo ""
echo "🌐 Acesse seu repositório:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"

echo ""
echo "✅ Configuração GitHub do Ambiente Flavius concluída!"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Guarde o token em local seguro"
echo "   - Token expira em 90 dias (padrão)"
echo "   - Renove token quando necessário"
echo "   - Não compartilhe o token"

# Limpar token da memória (parcial)
unset GITHUB_TOKEN