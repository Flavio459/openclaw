# Collegium Claude Guardrails

Esta pasta define guardrails locais do projeto `openclaw-push`.

## Objetivo

Reduzir ambiguidade semântica no `Collegium Cortex` antes de responder ou editar arquivos sensíveis.

## Hooks ativos

- `UserPromptSubmit`
  - arquivo: `hooks/skill-activation-prompt.mjs`
  - função: sugerir skills locais do Collegium antes da resposta

- `PreToolUse`
  - arquivo: `hooks/skill-verification-guard.mjs`
  - função: bloquear, uma vez por sessão, a edição de arquivos sensíveis até a skill correta ser lembrada

## Skills locais

- `collegium-context`
- `surface-separation`
- `scope-classifier`
- `protocol-defensability`
- `forum-deliberation`

## Guardrails atuais

- `surface-separation`
  - protege arquivos que definem fronteiras entre `Cortex Command`, `The Forum`, `Cortex Praetorium` e `OpenClaw Runtime`

- `scope-classifier`
  - protege arquivos ligados a agentes, runtime e controllers onde há risco de misturar `product`, `engine`, `infra` e `research`

- `forum-deliberation`
  - protege arquivos de deliberação, aprovação e fluxo do `Chairman`

- `protocol-defensability`
  - protege documentos e fluxos que moldam a defensabilidade narrativa, regulatória e econômica do projeto

## Bypass consciente

Formas de pular um guardrail quando isso for realmente necessário:

- adicionar `@skip-validation` no arquivo
- usar a variável de ambiente correspondente:
  - `SKIP_SURFACE_SEPARATION_GUARD`
  - `SKIP_SCOPE_CLASSIFIER_GUARD`
  - `SKIP_FORUM_DELIBERATION_GUARD`
  - `SKIP_PROTOCOL_DEFENSABILITY_GUARD`

## Estado de sessão

Os hooks gravam estado temporário em `hooks/state/`.

Esse diretório não faz parte do código do projeto e deve permanecer ignorado pelo Git.
