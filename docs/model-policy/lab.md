---
summary: "Lab rollout guide for the canonical phase-1 fallback policy."
---

# Lab

Lab is the first authoritative runtime target for this policy.

## Required outcomes

- `moonshot/kimi-k2.5` is primary
- OpenRouter free models are in the main failover path
- `google-antigravity/gemini-3-pro-high` remains a late contingency
- `deepseek/deepseek-chat` remains configured but last
- Web Chat visibly reports the effective model and fallback state

## Validation sequence

1. Apply the lab patch with `config.patch`.
2. Run `pnpm collegium:lab:preflight`.
3. Run `openclaw health --json`.
4. Verify a normal Kimi response.
5. Force Kimi failure and confirm promotion into OpenRouter free.
6. Confirm the UI surfaces:
   - effective model
   - fallback indicator
   - fallback reason when known

## Promotion gate

Do not promote to prod unless lab has:

- clean schema validation
- successful smoke
- successful forced-fallback demonstration
- recorded evidence of the active chain

Use the lab patch artifact as the baseline:

- [lab-phase-1.patch.jsonc](/model-policy/patches/lab-phase-1.patch.jsonc)
