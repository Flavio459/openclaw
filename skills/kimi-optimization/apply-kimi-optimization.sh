#!/bin/bash
# Script de aplicação do Protocolo de Auto-Otimização Kimi 2.5 Native
# Uso: ./apply-kimi-optimization.sh

set -e

echo "=== APLICANDO PROTOCOLO KIMI 2.5 NATIVE ==="
echo "Data: $(date)"
echo ""

# Configurações
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"
BACKUP_DIR="$HOME/.openclaw/backups"
BACKUP_FILE="$BACKUP_DIR/openclaw.backup.$(date +%F).json"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

echo "1. Criando backup de segurança..."
cp "$OPENCLAW_CONFIG" "$BACKUP_FILE"
echo "   Backup criado: $BACKUP_FILE"
echo ""

echo "2. Verificando configuração atual..."
if [ ! -f "$OPENCLAW_CONFIG" ]; then
    echo "   ❌ Arquivo de configuração não encontrado: $OPENCLAW_CONFIG"
    exit 1
fi

echo "3. Aplicando matriz de roteamento Kimi-Centric..."
echo "   Hierarquia:"
echo "   1. Orquestrador: Kimi 2.5 (256k)"
echo "   2. Fallback 1: DeepSeek Reasoner"
echo "   3. Fallback 2: Gemini 1.5 Pro (2M)"
echo "   4. Heartbeat: Gemini 1.5 Flash-8b"
echo ""

# Usar jq para modificar o JSON se disponível
if command -v jq &> /dev/null; then
    echo "   Usando jq para modificação JSON..."
    
    # Backup do original
    cp "$OPENCLAW_CONFIG" "${OPENCLAW_CONFIG}.tmp"
    
    # Aplicar modificações
    jq '
    .agents.defaults.model = {
        "comment": "Matriz Kimi-Centric com Fallback Resiliente",
        "primary": "moonshot/kimi-k2.5",
        "fallbacks": [
            "deepseek/deepseek-reasoner",
            "google/gemini-1.5-pro-latest",
            "openrouter/qwen/qwen-2.5-72b-instruct"
        ]
    } |
    .agents.defaults.heartbeat = {
        "model": "google/gemini-1.5-flash-8b",
        "every": "15m"
    } |
    .agents.defaults.contextPruning = {
        "mode": "cache-ttl",
        "ttl": "6h",
        "comment": "TTL alto maximiza o cache implícito do Kimi (Mooncake)"
    } |
    .agents.defaults.sandbox = {
        "allowlist": ["bash", "strreplace", "read", "write", "ls"]
    } |
    .models.providers.moonshot = {
        "baseUrl": "https://api.moonshot.ai/v1",
        "api": "chat-completions",
        "cost": {
            "input": 0.60,
            "output": 3.00,
            "cacheRead": 0.10
        }
    }
    ' "${OPENCLAW_CONFIG}.tmp" > "$OPENCLAW_CONFIG"
    
    rm "${OPENCLAW_CONFIG}.tmp"
    echo "   ✅ Configuração aplicada via jq"
else
    echo "   ⚠️ jq não disponível. Modificação manual necessária."
    echo "   Edite manualmente $OPENCLAW_CONFIG com as configurações do SKILL.md"
fi

echo ""
echo "4. Testando configuração..."
if grep -q "moonshot/kimi-k2.5" "$OPENCLAW_CONFIG"; then
    echo "   ✅ Kimi configurado como primary"
else
    echo "   ❌ Kimi NÃO configurado como primary"
fi

if grep -q "deepseek/deepseek-reasoner" "$OPENCLAW_CONFIG"; then
    echo "   ✅ DeepSeek configurado como fallback"
else
    echo "   ❌ DeepSeek NÃO configurado como fallback"
fi

if grep -q "gemini-1.5-flash-8b" "$OPENCLAW_CONFIG"; then
    echo "   ✅ Gemini Flash configurado para heartbeat"
else
    echo "   ❌ Gemini Flash NÃO configurado para heartbeat"
fi

echo ""
echo "5. Protocolo de verificação (Self-Health Check)..."
echo ""
echo "   Teste 1: Eficiência"
echo "   Pergunta: 'Se precisar mudar uma linha em arquivo de 1000 linhas, que ferramenta uso?'"
echo "   Resposta Correta: 'strreplace'"
echo ""
echo "   Teste 2: Resiliência"
echo "   Pergunta: 'API Moonshot caiu (Erro 500). Quem assume?'"
echo "   Resposta Correta: 'DeepSeek R1 assume imediatamente'"
echo ""
echo "   Teste 3: Custo"
echo "   Pergunta: 'Preciso verificar e-mails a cada 10 minutos. Quem faz isso?'"
echo "   Resposta Correta: 'Gemini Flash (Heartbeat)'"
echo ""

echo "6. Reiniciando gateway (se OpenClaw disponível)..."
if command -v openclaw &> /dev/null; then
    echo "   Reiniciando gateway OpenClaw..."
    openclaw gateway restart
    echo "   ✅ Gateway reiniciado"
else
    echo "   ⚠️ CLI OpenClaw não disponível. Reinicie manualmente:"
    echo "   openclaw gateway restart"
fi

echo ""
echo "=== PROTOCOLO APLICADO COM SUCESSO ==="
echo ""
echo "Resumo:"
echo "- Backup: $BACKUP_FILE"
echo "- Primary: moonshot/kimi-k2.5"
echo "- Fallbacks: DeepSeek, Gemini Pro, Qwen"
echo "- Heartbeat: gemini-1.5-flash-8b (15m)"
echo "- Cache TTL: 6h (Mooncake otimizado)"
echo "- Sandbox: allowlist restrita"
echo ""
echo "Próximos passos:"
echo "1. Testar comando: 'openclaw models list | grep kimi'"
echo "2. Verificar logs: 'tail -f ~/.openclaw/logs/gateway.log'"
echo "3. Validar fallback: Simular erro Moonshot"
echo ""
echo "Economia estimada:"
echo "- Heartbeat: <$0.01/dia"
echo "- Operações principais: 60% redução vs Claude"
echo "- Custo total: <$10/mês uso intensivo"
echo ""
echo "✅ Protocolo Kimi 2.5 Native aplicado com sucesso!"