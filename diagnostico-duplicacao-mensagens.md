# Diagnóstico: Problema de Duplicação de Mensagens - OpenClaw

## 📊 RESUMO EXECUTIVO

**Status:** Análise concluída  
**Severidade:** Média-Alta  
**Impacto:** UX degradada, consumo desnecessário de tokens  
**Sessão Afetada:** `agent:main:cron:33a63659-55a1-4b04-8a81-927310019786`

---

## 🔍 ANÁLISE DA CAUSA RAIZ

### 1. **Configuração de Canais Incompleta**
- **Problema identificado:** Configuração `channels` em `openclaw.json` possui apenas `whatsapp`
- **Canal webchat ausente:** Não há configuração de debounce para webchat
- **Efeito:** Ausência de mecanismo de deduplicação para mensagens webchat

```json
// Configuração atual (incompleta)
"channels": {
  "whatsapp": {
    "dmPolicy": "allowlist",
    "allowFrom": ["+5519996071531"],
    "groupPolicy": "allowlist",
    "mediaMaxMb": 50,
    "debounceMs": 0
  }
  // ❌ webchat não configurado
}
```

### 2. **Múltiplas Sessões Ativas Simultâneas**
- **Lock files detectados:** 4 sessões com locks ativos
- **Sessões concorrentes:**
  - `7eba59a7-5f2f-4b9a-b831-fbbbe3ef5057.jsonl` (atual - subagent)
  - `8d9acf8d-0b60-4b2f-a654-17ceb201f0e6.jsonl` (cron: ciclo-longo)
  - `f0f0b7cb-4cd9-45fe-a991-63c2bb024467.jsonl` (main session)
  - `smoke-1771099574.jsonl` (smoke test)
- **Risco:** Condição de corrida no processamento de mensagens

### 3. **Ausência de Debounce para WebChat**
- **Campo crítico ausente:** `debounceMs` não definido para webchat
- **Comportamento padrão:** Possível processamento duplo em reconexões WebSocket
- **Cenário problemático:** 
  1. Cliente envia mensagem
  2. WebSocket reconecta (timeout/keepalive)
  3. Mensagem reenviada automaticamente pelo cliente
  4. Gateway processa como mensagens distintas

### 4. **Cron Jobs Ativos Potencialmente Conflitantes**
- **heartbeat:ciclo-longo** - `enabled: true` - executando em 12:00 UTC
- **connectivity-check** - `enabled: true` - executando em 12:00 UTC
- **Sobreposição:** Múltiplos cron jobs disparando simultaneamente podem causar carga no gateway

---

## 🎯 SOLUÇÕES PROPOSTAS

### **SOLUÇÃO 1: Configurar Debounce para WebChat (RECOMENDADA - Imediata)**

**Complexidade:** Baixa  
**Impacto:** Alto  
**Tempo:** 2 minutos

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+5519996071531"],
      "groupPolicy": "allowlist",
      "mediaMaxMb": 50,
      "debounceMs": 0
    },
    "webchat": {
      "debounceMs": 500,
      "deduplicateWindowMs": 5000
    }
  }
}
```

**Por que funciona:** 
- `debounceMs: 500` - Aglomera mensagens idênticas enviadas em <500ms
- `deduplicateWindowMs: 5000` - Janela de 5s para detecção de duplicatas por conteúdo

---

### **SOLUÇÃO 2: Script de Limpeza de Sessões Stuck (RECOMENDADA)**

**Complexidade:** Média  
**Impacto:** Médio  
**Tempo:** 10 minutos

```bash
#!/bin/bash
# cleanup-stuck-sessions.sh
# Executar no host Windows via WSL ou Git Bash

OPENCLAW_DIR="/home/node/.openclaw"
SESSIONS_DIR="$OPENCLAW_DIR/agents/main/sessions"

# Identificar locks antigos (>30 minutos)
find "$SESSIONS_DIR" -name "*.lock" -mmin +30 -type f | while read lockfile; do
    session_file="${lockfile%.lock}"
    echo "Removendo lock antigo: $lockfile"
    rm -f "$lockfile"
    
    # Opcional: arquivar sessão antiga
    if [ -f "$session_file" ]; then
        mv "$session_file" "$session_file.archived.$(date +%s)"
    fi
done

echo "Limpeza concluída."
```

---

### **SOLUÇÃO 3: Modificar Agendamento dos Cron Jobs**

**Complexidade:** Baixa  
**Impacto:** Baixo  
**Tempo:** 5 minutos

Editar `/home/node/.openclaw/cron/jobs.json`:

```json
{
  "id": "6523cfcb-e4ea-4d1e-bc6e-b32734e9916d",
  "schedule": {
    "kind": "cron",
    "expr": "0 */4 * * *",
    "tz": "UTC"
  },
  "delivery": {
    "mode": "none"  // Garantir que não envie para canais
  }
}
```

**Atenção:** Verificar se `delivery.mode: "none"` está configurado para evitar envios duplicados.

---

### **SOLUÇÃO 4: Implementar Middleware de Deduplicação (Avançada)**

**Complexidade:** Alta  
**Impacto:** Muito Alto  
**Tempo:** 2-4 horas

Criar arquivo `/home/node/.openclaw/webchat-dedup.js`:

```javascript
/**
 * Middleware de deduplicação para webchat
 * Registra hashes de mensagens recentes
 */
class WebChatDeduplicator {
  constructor(windowMs = 5000) {
    this.seenMessages = new Map();
    this.windowMs = windowMs;
    
    // Limpar entradas antigas a cada janela
    setInterval(() => this.cleanup(), windowMs);
  }

  generateHash(content, userId) {
    const crypto = require('crypto');
    return crypto
      .createHash('md5')
      .update(`${userId}:${content}`)
      .digest('hex');
  }

  isDuplicate(content, userId) {
    const hash = this.generateHash(content, userId);
    const now = Date.now();
    
    if (this.seenMessages.has(hash)) {
      const timestamp = this.seenMessages.get(hash);
      if (now - timestamp < this.windowMs) {
        return true;
      }
    }
    
    this.seenMessages.set(hash, now);
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [hash, timestamp] of this.seenMessages.entries()) {
      if (now - timestamp > this.windowMs) {
        this.seenMessages.delete(hash);
      }
    }
  }
}

module.exports = WebChatDeduplicator;
```

---

### **SOLUÇÃO 5: Reinício Controlado do Gateway (Se possível)**

**Complexidade:** Baixa  
**Impacto:** Alto  
**Tempo:** 1 minuto

Como o restart está bloqueado via API (`commands.restart=false`), alternativas:

**Opção A - Reinício manual no host Windows:**
```powershell
# No host Windows (PowerShell Admin)
docker restart openclaw-gateway
# ou
docker-compose restart gateway
```

**Opção B - Sinal HUP para reload de config:**
```bash
# No container (se suportado)
kill -HUP $(pgrep openclaw-gateway)
```

---

## 📋 PLANO DE AÇÃO RECOMENDADO

### **Fase 1: Imediata (Agora)**
1. ☐ Aplicar **Solução 1** (configurar debounce webchat)
2. ☐ Executar **Solução 2** (limpar sessões stuck)
3. ☐ Verificar se duplicação persiste

### **Fase 2: Curto Prazo (Hoje)**
1. ☐ Verificar configuração `delivery.mode` em todos os cron jobs
2. ☐ Monitorar logs por 1 hora após mudanças
3. ☐ Documentar resultado em `memory/2026-02-17.md`

### **Fase 3: Médio Prazo (Esta semana)**
1. ☐ Implementar **Solução 4** (middleware de deduplicação)
2. ☐ Criar testes automatizados para duplicação
3. ☐ Configurar alerta para detecção de duplicatas

---

## 🔧 COMANDOS PARA VERIFICAÇÃO

```bash
# Verificar sessões ativas
ls -la /home/node/.openclaw/agents/main/sessions/*.lock

# Verificar processos do openclaw
ps aux | grep openclaw

# Verificar logs recentes
tail -f /home/node/.openclaw/logs/*.log

# Verificar configuração atual
cat /home/node/.openclaw/openclaw.json | jq '.channels'
```

---

## 📊 MÉTRICAS DE SUCESSO

- **Taxa de duplicação:** <1% (atualmente aparentemente ~100%)
- **Tempo de resposta:** <2s (sem degradação)
- **Sessões stuck:** 0
- **Locks ativos:** ≤2 (main + 1 cron)

---

## ⚠️ LIMITAÇÕES IDENTIFICADAS

1. ❌ Sem acesso a restart de gateway via API
2. ❌ Container sandboxed (sem acesso ao host Windows)
3. ❌ Não é possível modificar código-fonte do gateway diretamente
4. ❌ Soluções limitadas a configuração e scripts externos

---

*Diagnóstico gerado em: 2026-02-17 12:00 UTC*  
*Analisado por: Flavius Magnus Magnificus (Subagent)*
