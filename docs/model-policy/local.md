---
summary: "Local sandbox guidance for the phase-1 fallback rollout."
---

# Local

Local is a sandbox for schema validation, UX verification, and low-risk iteration.

## Goals

- validate the phase-1 fallback chain
- validate alias resolution
- verify Web Chat shows the effective model and fallback metadata
- prepare Qwen local for the next rollout phase

## What local is not

- not the authoritative runtime sign-off
- not a substitute for lab validation
- not the place to introduce environment-specific documentation drift

## Local checks

- `pnpm build`
- `pnpm test`
- `pnpm collegium:smoke:local`
- verify Web Chat shows fallback metadata after a forced provider failure

## Qwen local workstream

Keep Qwen local as a manual override until it clears its own evaluation:

- preferred candidates:
  - `ollama/qwen3.5-coder:14b`
  - `ollama/qwen3-coder:14b`
  - `ollama/qwen2.5-coder:14b`
  - `ollama/qwen2.5-coder:7b`
- if none are installed, `local-fast` must remain documented as unavailable

Use the local patch artifact as a starting point:

- [local-phase-1.patch.jsonc](/model-policy/patches/local-phase-1.patch.jsonc)
