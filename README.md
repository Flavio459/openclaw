# OpenClaw Personal Flavius (OPF)

**Repositório privado** do ambiente operacional do agente AI **Flavius Magnus Magnificus**.

## 🏷️ Identificação

- **Agente:** Flavius Magnus Magnificus (Flavius)
- **Email do agente:** flavius9ia@gmail.com
- **Usuário GitHub:** flavius9ia
- **Proprietário humano:** Flávio Souza Barros (eng.flavio.barros@gmail.com)
- **Tipo:** Ambiente operacional autônomo de AI Agent

## 📁 Estrutura do Workspace

```
workspace/
├── AGENTS.md              # Protocolos do agente
├── SOUL.md                # Identidade e personalidade
├── USER.md                # Informações do usuário humano
├── IDENTITY.md            # Identidade técnica
├── MEMORY.md              # Memória de longo prazo
├── TOOLS.md               # Ferramentas locais
├── HEARTBEAT.md           # Checklist de monitoramento
├── BOOTSTRAP.md           # Script de inicialização (apagar após uso)
├── .gitignore            # Segurança: arquivos sensíveis ignorados
├── memory/               # Logs diários de operação
│   ├── 2026-02-13.md
│   ├── 2026-02-14.md
│   └── 2026-02-15.md
├── skills/               # Habilidades do agente
└── [outros arquivos]     # Configurações não sensíveis
```

## 🔒 Segurança

**Arquivos NÃO commitados (no .gitignore):**
- `antigravity-config.json` - Tokens OAuth Google
- `openclaw.json` - Configuração OpenClaw (contém chaves API)
- Qualquer arquivo com credenciais, tokens ou senhas
- Logs de sessão e arquivos temporários

**Arquivos commitados (seguros):**
- Documentação do agente (sem dados sensíveis)
- Logs diários (sem tokens)
- Habilidades (skills) customizadas
- Configurações não sensíveis

## 🔄 Fluxo de Operação

### 1. Versionamento Automático
- **Cron job:** `daily-git-commit` (01:00 UTC diário)
- **Branch:** `flavius-environment`
- **Autenticação:** Token pessoal da conta `flavius9ia`

### 2. Monitoramento
- **System heartbeat:** 09:00 UTC diário
- **Health checks:** Verificação de recursos e conectividade
- **Security audit:** Auditoria diária de segurança

### 3. Integrações
- **Antigravity:** Claude Opus 4.6 + Gemini 3 Pro (OAuth)
- **DeepSeek:** Modelo primário
- **Moonshot/Kimi:** Fallback de alta capacidade
- **Google Gemini:** Fallback rápido

## 🛠️ Configuração Técnica

### Agente
- **Nome:** Flavius Magnus Magnificus
- **Arquétipo:** Orquestrador de Sistemas / Operador de Elite
- **Protocolos:** Ação > Conversa, Tool First, PT-BR natural
- **Workspace:** `/home/node/.openclaw/workspace`

### Modelos de IA
- **Primário:** `deepseek/deepseek-reasoner` (🧠 DeepSeek Raciocinador)
- **Fallbacks:** 
  1. `moonshot/kimi-k2.5` (📚 Kimi 256K)
  2. `google/gemini-3-flash-preview` (⚡ Gemini Rápido)
  3. `antigravity/claude-3-5-sonnet-20241022` (🎯 Claude Premium)

### Canais
- **WhatsApp:** +5519996071531 (apenas)
- **WebChat:** Interface web

## 📋 Cron Jobs Ativos

| Nome | Schedule | Descrição |
|------|----------|-----------|
| `daily-git-commit` | 01:00 UTC diário | Commit automático + push |
| `system-heartbeat` | 09:00 UTC diário | Verificação de saúde |
| `connectivity-check` | A cada 12h | Teste de conectividade |
| `weekly-cleanup` | Domingo 00:00 UTC | Limpeza de temporários |
| `healthcheck:security-audit` | 09:00 UTC diário | Auditoria de segurança |
| `healthcheck:update-status` | Segunda 10:00 UTC | Verificação de updates |

## 👥 Colaboração

### Contas GitHub
1. **flavius9ia** (`flavius9ia@gmail.com`)
   - Agente AI (commits automáticos)
   - Token: `ghp_...` (acesso ao repositório)

2. **Flavio459** (`eng.flavio.barros@gmail.com`)
   - Proprietário humano
   - Acesso admin ao repositório

### Permissões
- **flavius9ia:** Push para `flavius-environment`
- **Flavio459:** Admin completo

## ⚠️ Importante

1. **Tokens expiram:** Renovar token GitHub a cada 90 dias
2. **Segurança:** Nunca commitar arquivos sensíveis
3. **Backup:** Este repositório é backup do workspace
4. **Privacidade:** Repositório privado - não compartilhar

## 🔗 Links

- **OpenClaw Docs:** https://docs.openclaw.ai
- **OpenClaw GitHub:** https://github.com/openclaw/openclaw
- **Community:** https://discord.com/invite/clawd
- **Skills Hub:** https://clawhub.com

---

*Última atualização: 2026-02-15*  
*Agente: Flavius Magnus Magnificus*  
*Status: Operacional ✅*