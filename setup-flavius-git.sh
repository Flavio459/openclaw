#!/bin/bash
# Setup não-interativo do Git para Ambiente Flavius

set -e

WORKSPACE="/home/node/.openclaw/workspace"
GIT_USER="Flavius Magnus Magnificus"
GIT_EMAIL="flavius9ia@gmail.com"

echo "🚀 Configurando Git para Ambiente Flavius"
echo "=========================================="

# Configurar Git
echo "📝 Configurando usuário Git..."
git config --global user.name "$GIT_USER"
git config --global user.email "$GIT_EMAIL"
echo "✅ Git configurado: $GIT_USER <$GIT_EMAIL>"

# Navegar para workspace
cd "$WORKSPACE"

# Verificar status atual
echo ""
echo "📊 Status atual do repositório:"
git status --short

# Criar branch para ambiente Flavius (se não existir)
echo ""
echo "🌿 Criando branch para ambiente Flavius..."
git checkout -b flavius-environment 2>/dev/null || {
    echo "ℹ️  Branch 'flavius-environment' já existe, alternando..."
    git checkout flavius-environment
}
echo "✅ Branch 'flavius-environment' ativo"

# Adicionar arquivos específicos do Flavius
echo ""
echo "📁 Adicionando arquivos do ambiente Flavius..."

FILES=(
    "flavius-oauth-config.md"
    "oauth_proxy.py"
    "simple_oauth_server.py"
    "debug_oauth.py"
    "test_oauth.py"
    "flavius-git-manager.sh"
    "setup-flavius-git.sh"
    "memory/2026-02-14.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        git add "$file" 2>/dev/null && echo "  ✅ $file" || echo "  ⚠️  $file (não adicionado)"
    fi
done

# Adicionar skills se existirem
if [ -d "skills" ]; then
    git add skills/ 2>/dev/null && echo "  ✅ skills/" || echo "  ⚠️  skills/ (não adicionado)"
fi

# Criar commit
echo ""
echo "💾 Criando commit..."
COMMIT_MSG="Configuração Ambiente Flavius - OAuth e Autonomia Operacional"
git commit -m "$COMMIT_MSG" || {
    echo "⚠️  Nenhuma alteração para commitar"
}

# Mostrar status final
echo ""
echo "📈 Status final:"
echo "================="
git status --short

echo ""
echo "🌐 Informações do repositório:"
echo "   Branch: $(git branch --show-current)"
echo "   Remote: $(git remote get-url origin 2>/dev/null || echo 'Nenhum')"
echo "   Commits: $(git log --oneline | wc -l 2>/dev/null || echo '0')"

echo ""
echo "🎯 Próximos passos para repositório GitHub:"
echo "1. Crie repositório em: https://github.com/flavius9ia/flavius9ia-OPF"
echo "2. Adicione remote: git remote add flavius https://github.com/flavius9ia/flavius9ia-OPF.git"
echo "3. Faça push: git push -u flavius flavius-environment"
echo ""
echo "✅ Configuração Git do Ambiente Flavius concluída!"