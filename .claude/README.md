# Collegium Claude Guardrails

Esta pasta define guardrails locais do projeto `openclaw-push`.

## Objetivo

Reduzir ambiguidade semântica no `Collegium Cortex` antes de responder ou editar arquivos sensíveis.

## Hooks ativos

- `UserPromptSubmit`
  - arquivo: `hooks/skill-activation-prompt.mjs`
  - função:
    - sugerir skills locais do Collegium antes da resposta
    - validar blocos explícitos de `guardrail ack`
    - gravar desbloqueios temporários por sessão

- `PreToolUse`
  - arquivo: `hooks/skill-verification-guard.mjs`
  - função:
    - bloquear edição de arquivos sensíveis quando faltar ack válido
    - exigir todas as skills guardrail que casarem com o arquivo
    - nunca auto-desbloquear a própria sessão

## Skills locais

- `collegium-context`
- `surface-separation`
- `scope-classifier`
- `protocol-defensability`
- `forum-deliberation`

## Guardrails atuais

- `surface-separation`
  - protege arquivos que definem fronteiras entre `Cortex Command`, `The Forum`, `Cortex Praetorium` e `OpenClaw Runtime`
  - ack obrigatório:
    - `surface`
    - `is`
    - `is_not`

- `scope-classifier`
  - protege arquivos ligados a agentes, runtime e controllers onde há risco de misturar `product`, `engine`, `infra` e `research`
  - ack obrigatório:
    - `scope`
    - `actor_class`

- `forum-deliberation`
  - protege arquivos de deliberação, aprovação e fluxo do `Chairman`
  - ack obrigatório:
    - `topic`
    - `context`
    - `participants`
    - `evidence`
    - `options`
    - `risks`
    - `recommended_path`
    - `chairman_action`

- `protocol-defensability`
  - protege documentos e fluxos que moldam a defensabilidade narrativa, regulatória e econômica do projeto
  - ack obrigatório:
    - `economic_activity`
    - `rule`
    - `evidence`
    - `review_path`
    - `risk`

## Formato de ack

Use um bloco explícito no prompt antes de editar o arquivo:

```text
[guardrail:protocol-defensability]
economic_activity: fleet mobility operations
rule: tie protocol claims to real dispatch activity
evidence: board packet
review_path: chairman -> legal -> ceo
risk: regulatory narrative drift
[/guardrail]
```

Regras:

- um bloco vale para uma skill
- múltiplos blocos podem coexistir no mesmo prompt
- o desbloqueio vale por skill, por sessão, com TTL de `10` minutos
- se faltar campo obrigatório, o ack é ignorado
- um bloqueio nunca desbloqueia a própria sessão

## Arquivos com múltiplos guardrails

Se um arquivo casar com mais de uma skill, todas precisam estar validadas.

Exemplos:

- `ui/src/ui/views/forum.ts`
  - `surface-separation`
  - `forum-deliberation`
- `scripts/pema/pema-chairman-dashboard.mcp.mjs`
  - `forum-deliberation`
  - `protocol-defensability`

## Bypass consciente

Formas explícitas de pular um guardrail quando isso for realmente necessário:

- adicionar `@skip-validation` no arquivo
- usar a variável de ambiente correspondente:
  - `SKIP_SURFACE_SEPARATION_GUARD`
  - `SKIP_SCOPE_CLASSIFIER_GUARD`
  - `SKIP_FORUM_DELIBERATION_GUARD`
  - `SKIP_PROTOCOL_DEFENSABILITY_GUARD`

## Estado de sessão

Os hooks gravam estado temporário em `hooks/state/`.

Em testes, é possível isolar isso com:

```text
OPENCLAW_GUARDRAIL_STATE_DIR=/tmp/openclaw-guardrails
```

Esse diretório não faz parte do código do projeto e deve permanecer ignorado pelo Git.
