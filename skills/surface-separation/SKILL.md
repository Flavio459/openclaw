---
name: surface-separation
description: Separate Collegium Cortex surfaces before acting. Use when a request may refer to the product, the strategy room, the development cockpit, the engine, the application, the runtime, the dashboard, The Forum, Cortex Command, or Cortex Praetorium.
---

# Surface Separation

Classify the target surface before you design, edit, or route work.

## Official surfaces

- `Cortex Command` = product surface and company interface
- `The Forum` = strategic deliberation surface inside the product
- `Cortex Praetorium` = development cockpit and backstage supervision
- `OpenClaw Runtime` = engine and technical execution layer

## Routing rule

Use this mapping:

- operator, company workflow, business interface -> `Cortex Command`
- strategy, debate, decisions, risks, board discussion -> `The Forum`
- development visibility, handoffs, blockers, active work, evidence -> `Cortex Praetorium`
- sessions, agents runtime, orchestration, gateway, infra -> `OpenClaw Runtime`

## If ambiguity exists

State the assumed surface explicitly before acting.

Use a short classification block:

- `surface:`
- `reason:`
- `not this:`

If the user intent remains ambiguous after that, ask one concise clarification question.
