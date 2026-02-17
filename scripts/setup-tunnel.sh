#!/bin/bash
#
# Script de Túnel SSH para Autenticação Antigravity
# Uso: ./setup-tunnel.sh [usuario@host]
#

set -e

TUNNEL_PORT=51121
REMOTE_HOST="${1:-node@localhost}"
LOG_FILE="/tmp/antigravity-tunnel.log"

echo "=========================================="
echo "  TÚNEL SSH - ANTIGRAVITY AUTH"
echo "=========================================="
echo ""

# Verificar se há servidor OAuth rodando no container
echo "[1/3] Verificando servidor OAuth no container..."
if curl -s http://localhost:${TUNNEL_PORT}/health > /dev/null 2>&1; then
    echo "      ✅ Servidor OAuth rodando na porta ${TUNNEL_PORT}"
else
    echo "      ⚠️  Servidor OAuth não encontrado na porta ${TUNNEL_PORT}"
    echo "      Iniciando servidor automaticamente..."
    cd /home/node/.openclaw/workspace
    node oauth-server.js > /tmp/oauth-server.log 2>&1 &
    sleep 3
    
    if curl -s http://localhost:${TUNNEL_PORT}/health > /dev/null 2>&1; then
        echo "      ✅ Servidor OAuth iniciado"
    else
        echo "      ❌ Falha ao iniciar servidor OAuth"
        exit 1
    fi
fi

echo ""
echo "[2/3] Configurando túnel SSH..."
echo "      Host remoto: ${REMOTE_HOST}"
echo "      Porta local: ${TUNNEL_PORT}"
echo ""

# Instruções para o usuário
echo "=========================================="
echo "  INSTRUÇÕES PARA HOST WINDOWS"
echo "=========================================="
echo ""
echo "Execute no PowerShell (como Admin):"
echo ""
echo "  ssh -N -R ${TUNNEL_PORT}:localhost:${TUNNEL_PORT} ${REMOTE_HOST}"
echo ""
echo "Ou para conexão persistente com auto-reconnect:"
echo ""
echo "  while (\$true) {"
echo "    ssh -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3 \"
echo "        -R ${TUNNEL_PORT}:localhost:${TUNNEL_PORT} ${REMOTE_HOST}"
echo "    Start-Sleep -Seconds 5"
echo "  }"
echo ""
echo "=========================================="
echo ""
echo "Após conectar o túnel, acesse no navegador:"
echo "  http://localhost:${TUNNEL_PORT}"
echo ""
echo "O servidor está aguardando conexão..."
echo ""

# Monitorar conexões
echo "[3/3] Monitorando conexões (Ctrl+C para sair)..."
echo ""

while true; do
    # Verificar se há conexões SSH ativas na porta
    CONNECTIONS=$(netstat -tn 2>/dev/null | grep ":${TUNNEL_PORT}" | grep ESTABLISHED | wc -l)
    
    if [ "$CONNECTIONS" -gt 0 ]; then
        echo "$(date '+%H:%M:%S') - ✅ Cliente conectado via túnel"
    else
        echo "$(date '+%H:%M:%S') - ⏳ Aguardando túnel SSH..."
    fi
    
    sleep 5
done
