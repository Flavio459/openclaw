---
summary: "Production rollout guardrails for the canonical phase-1 fallback policy."
---

# Prod

Prod receives the phase-1 policy only after lab passes.

## Prod rules

- no discovery in prod
- no provider experiments in prod
- no Nemotron activation in prod during phase 1
- no automatic Qwen local promotion in prod during phase 1

## Preflight

- `pnpm collegium:prod:preflight -- -AsJson`
- confirm the exact patch to apply
- confirm the current `baseHash`
- confirm rollback path for `openclaw.json`

## Post-apply checks

- `openclaw health --json`
- Web Chat final/error events carry effective model telemetry
- OpenAI-compatible and OpenResponses endpoints return the effective model ref
- fallback to OpenRouter free succeeds when Kimi is unavailable

Use the prod patch artifact as the baseline:

- [prod-phase-1.patch.jsonc](/model-policy/patches/prod-phase-1.patch.jsonc)
