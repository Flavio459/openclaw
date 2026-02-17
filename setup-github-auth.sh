#!/bin/bash
# Script para configurar autenticação GitHub
# Uso: ./setup-github-auth.sh SEU_TOKEN_AQUI

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "❌ Erro: Token não fornecido"
    echo "Uso: ./setup-github-auth.sh ghp_xxxxxxxxxxxx"
    echo ""
    echo "Para gerar token:"
    echo "1. Acesse https://github.com/settings/tokens"
    echo "2. Clique em 'Generate new token (classic)'"
    echo "3. Selecione escopo 'repo' (full control)"
    echo "4. Copie o token gerado"
    exit 1
fi

cd /home/node/.openclaw/workspace

# Configurar URL com token
git remote set-url origin https://Flavio459:${TOKEN}@github.com/Flavio459/openclaw.git

# Testar autenticação
echo "🔄 Testando autenticação..."
git fetch origin

if [ $? -eq 0 ]; then
    echo "✅ Autenticação OK"
    echo "🔄 Fazendo push..."
    git push -u origin flavius-environment
    echo "✅ Push concluído"
else
    echo "❌ Falha na autenticação"
    exit 1
fi
