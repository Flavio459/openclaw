---
summary: "Canonical phase-1 fallback policy for OpenClaw: Kimi primary, OpenRouter free in the main recovery path, DeepSeek last, Qwen local under evaluation, Nemotron gated by hardware review."
---

# Model Policy

This directory is the canonical source of truth for the current OpenClaw model policy rollout.

Phase 1 is intentionally reliability-first:

1. `moonshot/kimi-k2.5`
2. `openrouter/meta-llama/llama-3.3-70b-instruct:free`
3. `openrouter/google/gemini-2.0-flash-vision:free` for multimodal coverage
4. `openrouter/deepseek/deepseek-r1:free`
5. `google-antigravity/gemini-3-pro-high`
6. `deepseek/deepseek-chat`

## Why this policy exists

- DeepSeek is preserved in the standard chain, but moved to the end while direct billing is unavailable.
- OpenRouter free models are treated as operational capacity, not just break-glass recovery.
- Kimi is the default quality route for phase 1.
- Qwen local is explicitly a parallel evaluation track, not an automatic global fallback yet.
- Nemotron is excluded from the active chain until hardware viability is proven on real hosts.

## Required aliases

- `main` → `moonshot/kimi-k2.5`
- `router-free-1` → `openrouter/meta-llama/llama-3.3-70b-instruct:free`
- `router-free-2` → `openrouter/deepseek/deepseek-r1:free`
- `emergency` → `google-antigravity/gemini-3-pro-high`
- `deepseek-last` → `deepseek/deepseek-chat`
- `local-fast` → best validated local Qwen model via Ollama
- `nemotron-candidate` → reserved alias for evaluation only

## Runtime observability contract

Every surface that returns or streams model output must expose:

- the configured model chain
- the effective model that produced the answer
- whether fallback happened
- the fallback reason when known
- the attempted model list when known

The Web Chat runtime now carries this metadata in chat final/error events and assistant message payloads. The OpenAI-compatible and OpenResponses HTTP surfaces also emit the effective model in their response model field and attach debug headers:

- `x-openclaw-effective-model`
- `x-openclaw-fallback-reason`
- `x-openclaw-attempted-models`

## Rollout order

1. Local sandbox
2. Lab
3. Prod

Lab remains the authoritative runtime validation stage for any fallback or auth-routing change.

## Contents

- [Local rollout notes](/model-policy/local)
- [Lab rollout notes](/model-policy/lab)
- [Prod rollout notes](/model-policy/prod)
- [Provider roles and selection rules](/model-policy/providers)
- [Nemotron evaluation gate](/model-policy/nemotron-evaluation)
- Patch artifacts:
  - [local phase 1 patch](/model-policy/patches/local-phase-1.patch.jsonc)
  - [lab phase 1 patch](/model-policy/patches/lab-phase-1.patch.jsonc)
  - [prod phase 1 patch](/model-policy/patches/prod-phase-1.patch.jsonc)
