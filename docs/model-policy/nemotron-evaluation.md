---
summary: "Hardware-gated evaluation checklist for NVIDIA Nemotron variants."
---

# Nemotron Evaluation

Nemotron is not approved for the active fallback chain in phase 1.

Promotion requires evidence on real hardware, not paper specs.

## Required matrix

For each candidate variant, record:

- exact variant name
- delivery mode:
  - `hosted API`
  - `self-hosted`
- required chip or GPU class
- required VRAM
- realistic context limit
- latency under representative prompts
- operating cost
- OpenClaw integration path
- comparative result against:
  - `moonshot/kimi-k2.5`
  - `openrouter/...:free`
  - `ollama/qwen...`

## Promotion gate

Nemotron cannot enter the fallback chain until all are true:

- hardware is available on real target hosts
- startup and steady-state operation are stable
- cost is acceptable
- routing is compatible with OpenClaw without one-off hacks
- benefit is materially better than the current chain
