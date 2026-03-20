---
summary: "Provider roles for the canonical phase-1 fallback rollout."
---

# Providers

## Moonshot / Kimi

- role: primary operational route
- default model: `moonshot/kimi-k2.5`
- used while direct DeepSeek billing is not reliable

## OpenRouter free

- role: normal recovery path
- must contain approved free models that are actually available in the target environment
- default phase-1 set:
  - `openrouter/meta-llama/llama-3.3-70b-instruct:free`
  - `openrouter/deepseek/deepseek-r1:free`
  - `openrouter/google/gemini-2.0-flash-vision:free` for multimodal coverage

## Google Antigravity

- role: strong late contingency
- default model: `google-antigravity/gemini-3-pro-high`
- should not be the common path when the intent is predictable free or low-cost routing

## DeepSeek

- role: retained but deprioritized
- default model: `deepseek/deepseek-chat`
- currently last in the chain while direct billing is unavailable

## Ollama / Qwen local

- role: local economic route under validation
- not part of the automatic global phase-1 fallback chain
- exposed through the `local-fast` alias when the host has a validated Qwen build installed

## Nemotron

- role: evaluation candidate only
- not part of the active runtime chain in phase 1
- requires hardware and chip review before activation
