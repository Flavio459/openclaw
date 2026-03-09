# Estrategia de Skills para Collegium Cortex

Documento de curadoria para decidir onde skills ajudam de verdade no ecossistema `Collegium Cortex`, e onde elas apenas adicionam ruído.

## Diagnostico

### O que existe hoje

- O ambiente global do operador ja possui uma biblioteca enorme de skills em `~/.codex/skills`.
- Este repositorio nao possui uma estrutura local `.claude/` com `skill-rules.json` e hooks proprios para Claude Code.
- O repositiorio `openclaw-push` ja possui um ecossistema proprio de skills em `openclaw-push/skills`.
- O runtime tambem carrega skills vindas de extensoes, como `feishu-*`, `lobster` e `prose`.

### Leitura pratica

- O problema atual nao e falta de skills.
- O problema atual e falta de curadoria, fronteira semantica e skills especificas do dominio `Collegium Cortex`.
- Instalar mais pacotes genericos agora tende a aumentar sobreposicao e ruído.

## Auditoria de alto nivel

### Skills do repositorio com melhor sinal para este projeto

- `coding-agent`: util para execucao de desenvolvimento.
- `github`: util para fluxo de codigo e integracao com repositorio.
- `mcporter`: util para inspecao e teste de MCP.
- `notion`: util se a memoria operacional migrar para Notion.
- `session-logs`: util para recuperar contexto historico de sessoes.
- `skill-creator`: util para evoluir o proprio pacote de skills do projeto.
- `summarize`: util para consolidar evidencias e relatorios.
- `tmux`: util se o runtime local evoluir para orquestracao mais intensa.

### Skills do repositorio que sao situacionais

- `gemini`, `nano-banana-pro`, `openai-image-gen`, `openai-whisper`, `nano-pdf`
- `blogwatcher`, `healthcheck`, `voice-call`, `video-frames`

Essas podem ser uteis, mas nao devem guiar a arquitetura do Collegium.

### Skills com baixa relevancia para o core do Collegium

- integracoes pessoais e utilitarios de produtividade isolados
- skills de entretenimento, notas pessoais ou consumo
- conectores que nao participam do fluxo atual do produto nem do desenvolvimento

Nao sao "ruins"; apenas nao merecem prioridade sem caso de uso repetido.

## Decisao recomendada

### Nao fazer agora

- nao instalar mais skills genericas em massa
- nao expandir bibliotecas externas antes de provar necessidade recorrente
- nao depender de skill para compensar arquitetura ou documentacao fraca

### Fazer agora

- manter as skills genericas de processo como apoio
- criar um nucleo pequeno de skills proprietarias do `Collegium Cortex`
- usar essas skills para reduzir ambiguidade entre `produto`, `motor`, `protocolo` e `cockpit`
- ativar guardrails locais em `.claude/` apenas para arquivos com maior risco semantico

## Pacote inicial recomendado

As skills abaixo tem alto retorno imediato:

1. `collegium-context`
2. `surface-separation`
3. `scope-classifier`
4. `protocol-defensability`
5. `forum-deliberation`

## Papel de cada skill

### `collegium-context`

Usar quando a tarefa tocar identidade, tese, governanca, PEMA, The Pilots ou enquadramento do projeto.

Objetivo:

- impedir que o projeto seja tratado como app comum
- reforcar a leitura correta de infraestrutura de mobilidade governada por protocolo

### `surface-separation`

Usar quando existir risco de confundir:

- `Cortex Command`
- `The Forum`
- `Cortex Praetorium`
- `OpenClaw Runtime`

Objetivo:

- separar produto, deliberacao estrategica, cockpit de desenvolvimento e engine

### `scope-classifier`

Usar quando houver risco de interpretar mal uma solicitacao.

Objetivo:

- classificar pedidos em `product`, `engine`, `infra` ou `research`
- separar `business_agent` de `engineering_agent`

### `protocol-defensability`

Usar quando a tarefa tocar:

- economia
- reputacao
- compliance
- narrativa publica
- risco regulatorio
- percepcao de investidor

Objetivo:

- manter aderencia a mobilidade real, auditabilidade e governanca humana

### `forum-deliberation`

Usar quando a tarefa tocar:

- `The Forum`
- estrategia
- problemas
- riscos
- incidentes
- opcoes concorrentes
- decisao do `Chairman`

Objetivo:

- estruturar a sala de deliberacao como fluxo decisorio
- evitar que discussao estrategica vire apenas chat solto
- consolidar contexto, evidencias, opcoes e acao final

## Separacao entre desenvolvimento e aplicacao

### Skills ajudam muito em desenvolvimento

- padronizam pensamento
- reduzem ambiguidade
- melhoram consistencia de implementacao
- impõem guardrails narrativos e arquiteturais

### Skills ajudam indiretamente na aplicacao

- ajudam a definir agentes, fronteiras e semantica
- ajudam a manter coerencia de produto
- nao substituem runtime, estado, API, UI nem governanca real

## Regra operacional

Adotar a seguinte regra antes de instalar qualquer skill nova:

1. o problema apareceu pelo menos 3 vezes?
2. a skill reduz erro recorrente?
3. a skill introduz um comportamento claro, nao apenas texto generico?
4. a skill evita ambiguidade relevante no Collegium?

Se a resposta for `nao` para a maioria, nao instalar.

## Proximo passo recomendado

1. usar o pacote inicial criado neste repositorio
2. observar por alguns ciclos se ele realmente reduz ambiguidade
3. so depois decidir se vale:
   - portar esse pacote para o ambiente global de Claude/Codex
   - criar `.claude/` local com ativacao mais forte
   - instalar skills externas adicionais

## Endurecimento local atual

No estado atual do repositorio:

- `UserPromptSubmit` sugere skills do Collegium antes da resposta
- `PreToolUse` bloqueia uma vez por sessao em arquivos sensiveis de superfícies e deliberacao
- `PreToolUse` tambem bloqueia uma vez por sessao em documentos e fluxos sensiveis de defensabilidade protocolar
- `PreToolUse` tambem bloqueia uma vez por sessao em arquivos de agentes e runtime para forcar classificacao de escopo

Arquivos com guardrails mais fortes:

- `ui/src/ui/views/command.ts`
- `ui/src/ui/views/forum.ts`
- `ui/src/ui/views/praetorium.ts`
- `ui/src/ui/navigation.ts`
- `ui/src/ui/collegium.ts`
- `scripts/pema/README.stitch-mcp-dashboard.md`
- `scripts/pema/pema-chairman-dashboard.mcp.mjs`
- arquivos de `exec-approval*`

Arquivos com guardrail de `scope-classifier`:

- `ui/src/ui/controllers/agent-*.ts`
- `ui/src/ui/controllers/agents.ts`
- `ui/src/ui/controllers/skills.ts`
- `ui/src/ui/controllers/sessions.ts`
- `ui/src/ui/controllers/presence.ts`
- `ui/src/ui/controllers/devices.ts`
- `ui/src/ui/app-gateway.ts`
- `ui/src/ui/app-settings.ts`

Arquivos com guardrail de `protocol-defensability`:

- `scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md`
- `scripts/pema/ORIGEM_PEMA_CURADA.md`
- `scripts/pema/MEMORIA_OPERACIONAL_PEMA.md`
- `scripts/pema/README.stitch-mcp-dashboard.md`
- `scripts/pema/SKILLS_COLLEGIUM_ESTRATEGIA.md`
- `scripts/pema/pema-chairman-dashboard.mcp.mjs`
