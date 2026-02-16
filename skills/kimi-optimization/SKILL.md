# SKILL: Protocolo de Auto-Otimização Kimi 2.5 Native

**Objetivo:** Reconfigurar a "mente" do agente (arquivos de configuração e comportamento) para operar com eficiência máxima usando a arquitetura Moonshot AI.

**Ativação:** Quando o usuário solicitar "Otimizar para Kimi", "Aplicar plano de contingência Kimi", ou "Auto-configurar matriz de fallback".

---

## 1. Diretrizes de Comportamento (O "Cérebro" Kimi)

### A. Modo de Pensamento (Thinking Mode)
**Quando usar:** Para qualquer tarefa que envolva:
- Planejamento de múltiplos passos
- Refatoração de código complexo
- Análise de logs de erro
- Diagnóstico de problemas arquiteturais

**Como usar:** O Kimi 2.5 ativa o raciocínio automaticamente. Não suprima o output de pensamento. Use-o para validar caminhos antes de executar comandos bash destrutivos.

### B. Economia via strreplace (Lei da Menor Edição)
**Contexto:** O Kimi 2.5 tem custo de saída ($3.00/M) maior que entrada. Reescrever arquivos inteiros é desperdício.

**Regra:** NUNCA use `write_file` para alterar menos de 60% de um arquivo existente.

**Ação:** Use estritamente `strreplace` (ou equivalente de edição em bloco) para cirurgias precisas no código. Isso reduz consumo de tokens de saída em até 90%.

### C. Estratégia de Caching Implícito (Mooncake)
**Mecanismo:** O Kimi usa cache baseado em prefixo (Prefix Matching). Se início do prompt for igual, cache ativa ($0.10/M vs $0.60/M).

**Ação do Agente:** Ao editar `AGENTS.md` ou instruções de sistema:
1. MANTENHA cabeçalho estático
2. NÃO insira timestamps, datas ou variáveis dinâmicas no topo
3. Mova informações dinâmicas para o final do prompt

---

## 2. Instruções de Auto-Programação (Configuração)

### Passo 1: Backup de Segurança
```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.backup.$(date +%F).json
```

### Passo 2: Aplicação da Matriz de Roteamento (Escalonamento e Fallback)
Reescrever o bloco `agents` e `models` para refletir hierarquia de inteligência. **Não use modelos Claude.**

**Hierarquia de Decisão:**
1. **Orquestrador (Cérebro):** Kimi 2.5 (256k Context, Raciocínio Forte)
2. **Rede de Segurança (Fallback 1):** DeepSeek R1 ou V3 (Raciocínio comparável, API distinta)
3. **Memória Bruta (Fallback 2):** Gemini 1.5 Pro (2M Context - para quando contexto estourar 256k)
4. **Operário Barato (Heartbeat):** Gemini 1.5 Flash-8b (Custo irrisório para verificação de rotina)

### Passo 3: Injeção de JSON
Usar `strreplace` ou editar JSON para garantir estas chaves existam:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "comment": "Matriz Kimi-Centric com Fallback Resiliente",
        "primary": "moonshot/kimi-k2.5",
        "fallbacks": [
          "deepseek/deepseek-reasoner",
          "google/gemini-1.5-pro-latest",
          "openrouter/qwen/qwen-2.5-72b-instruct"
        ]
      },
      "heartbeat": {
        "model": "google/gemini-1.5-flash-8b",
        "every": "15m"
      },
      "contextPruning": {
        "mode": "cache-ttl",
        "ttl": "6h",
        "comment": "TTL alto maximiza o cache implícito do Kimi (Mooncake)"
      },
      "sandbox": {
        "allowlist": ["bash", "strreplace", "read", "write", "ls"]
      }
    }
  },
  "models": {
    "providers": {
      "moonshot": {
        "baseUrl": "https://api.moonshot.ai/v1",
        "api": "chat-completions",
        "cost": {
          "input": 0.60,
          "output": 3.00,
          "cacheRead": 0.10
        }
      }
    }
  }
}
```

---

## 3. Protocolo de Verificação (Self-Health Check)

Após aplicar configurações, executar teste mental:

### Teste 1: Eficiência
**Pergunta:** "Se eu precisar mudar uma linha em um arquivo de 1000 linhas, que ferramenta uso?"
**Resposta Correta:** `strreplace`
**Se resposta for `write`:** Corrigir prompt de sistema

### Teste 2: Resiliência
**Pergunta:** "A API da Moonshot caiu (Erro 500). Quem assume?"
**Resposta Correta:** DeepSeek R1 assume imediatamente. Usuário não deve perceber queda.

### Teste 3: Custo
**Pergunta:** "Preciso verificar se há novos e-mails a cada 10 minutos. Quem faz isso?"
**Resposta Correta:** Gemini Flash (Heartbeat). Nunca use Kimi 2.5 para polling repetitivo.

---

## 4. Comandos de Gatilho

**Ativar skill com:**
- "Otimizar para Kimi"
- "Aplicar plano de contingência Kimi"
- "Auto-configurar matriz de fallback"
- "Kimi optimization protocol"
- "Configure Kimi-native architecture"

---

## 5. O Que Esta Skill Faz Exatamente?

### Ensina o "Como" (How-To)
Em vez de configurar JSON manualmente, skill dá receita exata para editar `openclaw.json` com:
- Provider Moonshot configurado corretamente
- Preços corretos para orçamento funcionar
- TTL de cache otimizado

### Define o "Quando" (Roteamento)
Instrui explicitamente:
- Modelo caro (Kimi): Trabalho pesado, raciocínio complexo
- Modelo barato (Gemini Flash): Heartbeat, verificações de fundo
- **Economia:** ~95% nos custos de ociosidade

### Impõe Eficiência (StrReplace)
Kimi 2.5 é treinado para usar `strreplace`. Forçar isso via skill impede que agente "esqueça" e tente reescrever arquivos inteiros, consumindo tokens e dinheiro desnecessariamente.

### Ativa o Fallback
Garante que se Kimi falhar:
1. Cai para DeepSeek (raciocínio similar)
2. Depois para Gemini Pro (contexto grande)
3. Mantém inteligência do sistema sem recorrer ao Claude

---

## 6. Arquivos de Configuração Relacionados

**Primário:** `~/.openclaw/openclaw.json`
**Backup:** `~/.openclaw/openclaw.backup.YYYY-MM-DD.json`
**Referência:** `~/.openclaw/workspace/skills/kimi-optimization/SKILL.md`

**Dependências:**
- API key Moonshot configurada
- API key DeepSeek configurada
- API key Google Gemini configurada

---

## 7. Métricas de Sucesso

**Eficiência de Tokens:**
- Redução 90% em tokens de saída via `strreplace`
- Cache implícito ativado em 80%+ das interações

**Resiliência:**
- Fallback automático em <5 segundos
- Zero downtime percebido pelo usuário

**Custo:**
- Heartbeat: <$0.01/dia
- Operações principais: 60% redução vs Claude
- Custo total: <$10/mês para uso intensivo

---

**VERSÃO:** 1.0  
**DATA:** 2026-02-15  
**AUTOR:** Flavius Magnus Magnificus  
**STATUS:** Ativa e pronta para uso  
**MODELO ALVO:** moonshot/kimi-k2.5