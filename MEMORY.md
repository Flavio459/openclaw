# MEMORY.md - Memória de Longo Prazo do Flavius

*Ativado em: 2026-02-13 23:44 UTC*

---

## Identidade Central

**Nome:** Flavius Magnus Magnificus (Flavius)  
**Arquétipo:** Orquestrador de Sistemas / Operador de Elite  
**Missão:** Execução técnica de alta precisão com zero desperdício de tokens ou tempo de processamento  
**Natureza:** Sistema Operacional de Inteligência  
**Protocolos:** Ação > Conversa, Tool First, Pensamento em inglês, Entrega em PT-BR  

**Versão:** Thinking Core v8.4 (atualizado em 2026-02-13)  

---

## Usuário

**Nome:** Flávio Souza Barros  
**Chamá-lo:** Flávio  
**Contato principal:** WhatsApp (+5519996071531)  
**Email:** flavius9ia@gmail.com  
**Relacionamento:** Informal, como amigos  

**Perfil técnico:** Construtor de Sistemas | Acelerador de Inovação | Developer Full-Stack  
**GitHub:** https://github.com/Flavio459 (29 repositórios, 4 produtos em produção)  
**Filosofia:** Velocidade > Perfeição, Simplicidade > Complexidade, Resultado > Processo  

---

## Configuração do Sistema

### Provedores de Modelo Ativos
1. **DeepSeek** (api.deepseek.com)
   - Modelos: `deepseek-chat` (128K), `deepseek-reasoner` (128K)
   - Status: Configurado e funcional

2. **Moonshot/Kimi K2.5** (api.moonshot.ai/v1)
   - Modelo: `kimi-k2.5` (256K contexto)
   - Status: Configurado e funcional
   - Chave API: presente

3. **Google Antigravity** (em configuração)
   - Plugin: `google-antigravity-auth` habilitado
   - Modelo alvo: `google-antigravity/claude-opus-4-6-thinking`
   - Status: **Aguardando autenticação OAuth**
   - Proxy alternativo: `antigravity-claude-proxy` rodando em localhost:8080

### Canais
- **WhatsApp:** Configurado (apenas +5519996071531 permitido)
- **WebChat:** Ativo (sessão atual)

### Workspace
- **Localização:** `/home/node/.openclaw/workspace`
- **Git:** Inicializado (commit inicial: `5b9961d`)
- **Remote:** `https://github.com/Flavio459/openclaw.git` (push falha por autenticação)

---

## Cron Jobs Ativos

| Nome | Schedule | Descrição |
|------|----------|-----------|
| `daily-git-commit` | 01:00 UTC diário | Commit automático + push para GitHub |
| `system-heartbeat` | 09:00 UTC diário | Verificação de saúde do sistema |
| `connectivity-check` | A cada 12h | Teste de conectividade internet |
| `weekly-cleanup` | Domingo 00:00 UTC | Limpeza de arquivos temporários |
| `healthcheck:security-audit` | 09:00 UTC diário | Auditoria de segurança |
| `healthcheck:update-status` | Segunda 10:00 UTC | Verificação de updates |

---

## Projetos / Tarefas em Andamento

### 1. Integração Antigravity
**Status:** Aguardando autenticação OAuth manual  
**Progresso:**
- Plugin `google-antigravity-auth` habilitado no OpenClaw
- Proxy da comunidade `antigravity-claude-proxy` configurado
- URL de autorização OAuth gerada (client_id: 1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com)
- **Ação necessária:** Usuário precisa abrir URL, autorizar conta Google, e fornecer código de redirecionamento

**URL de autorização (abrir no navegador):**
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A51121%2Foauth-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcclog+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fexperimentsandconfigs&access_type=offline&prompt=consent&code_challenge=WlcSDQ_zjOby9xyKjiJKSM0jqCos4Yt211QTkV2d-PU&code_challenge_method=S256&state=296827e4f7b74281b5e979d2c152428f
```

### 2. Configuração GitHub
**Status:** Remote configurado, autenticação faltando  
**Ação necessária:** Token pessoal ou SSH key

### 3. Matriz Neural de Modelos
**Configuração atual:**
- Primário: DeepSeek Chat
- Fallbacks: DeepSeek Reasoner → Kimi K2.5 → Antigravity Claude → Gemini Flash

---

## Eventos Recentes (2026-02-13)

### 00:00 UTC - Cron Job Connectivity-Check
- **Erro:** Falha de entrega WhatsApp (configuração de destinatário faltando)
- **Correção:** Alterado para `delivery.mode: "none"` e método de verificação para `curl`
- **Status:** Corrigido, próxima execução 12h UTC

### 23:46 UTC - Gateway Restarts (2x)
- **Causa:** Atualizações de configuração (`config.patch`)
- **Alterações:** 
  1. Habilitação plugin `google-antigravity-auth`
  2. Adição de modelo `google-antigravity/claude-opus-4-6-thinking` aos fallbacks
- **Status:** Gateway operacional após reinícios

### 00:01 UTC - Autenticação Antigravity
- **Status:** URL de autorização OAuth gerada
- **Próxima ação:** Autenticação manual do usuário

---

## Lições Aprendidas / Padrões

1. **Tool First Protocol:** Sempre usar `ls`, `grep`, `cat`, `exec` antes de perguntar
2. **Configuração OpenClaw:** Provedores customizados via `models.providers` no `openclaw.json`
3. **Cron Jobs:** Usar `sessionTarget: "isolated"` para tarefas periódicas
4. **Memória:** Registrar decisões importantes aqui para continuidade entre sessões

---

## Decisões Técnicas

### 2026-02-13
- **Escolha de modelo principal:** Kimi K2.5 (256K contexto) para tarefas de planejamento
- **Estratégia Antigravity:** Plugin oficial > Proxy da comunidade
- **Cron jobs:** Agendados para manutenção automática do sistema
- **Workspace Git:** Inicializado para versionamento e backup

---

## Preferências / Configurações

### Comunicação
- **Idioma:** PT-BR natural, técnico, sem sotaques de tradução
- **Formato:** Preferir tabelas, blocos de código e listas para escaneabilidade
- **Humor:** Minimalista e estéril (quando apropriado)

### Execução
- **Autonomia:** Tentar descobrir sozinho antes de perguntar
- **Segurança:** Perguntar antes de ações externas (emails, tweets, etc.)
- **Documentação:** Atualizar arquivos de configuração após mudanças

---

*Esta memória será atualizada regularmente com eventos significativos, lições aprendidas e decisões importantes.*