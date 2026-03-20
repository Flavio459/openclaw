# The Cockpit Architecture

## Purpose

`The Cockpit` is the future operational app for the pilot in the mobility product.

It is not:

- `Cortex Command`
- `The Forum`
- `Cortex Praetorium`

The surface exists to help the pilot understand activation, city readiness, network position, turn state, `UP`, rank, alerts, and compliance notices without inheriting the technical supervision language of the agentic stack.

## Boundary

### `The Cockpit`

- pilot identity and activation
- city readiness
- network position
- turn state
- `UP` state
- rank state
- pilot alerts
- compliance notices

### `Cortex Praetorium`

- technical supervision
- runtime proof
- blockers
- approvals
- handoffs
- backstage operational evidence

The same person may eventually look at both surfaces, but the surfaces do different jobs and cannot share vocabulary by accident.

## Phase Scope

This phase establishes:

- canonical naming
- domain boundary
- contract shape
- internal UX expectations
- internal preview surface for controlled review
- first operational binding for activation, city readiness, and honest turn state

This phase does not implement:

- passenger app
- complete map workflow
- chat
- live payout logic
- executable economic rules
- compensation mechanics

## Contract

The current contract is defined in [cockpit.contract.ts](../ui/src/ui/collegium/cockpit.contract.ts).

The baseline fixtures live in [cockpit.fixtures.ts](../ui/src/ui/collegium/cockpit.fixtures.ts).

## Guardrails

- `The Cockpit` must never be presented as a cockpit for technical supervision.
- `The Cockpit` must not reuse `Praetorium` naming as a shortcut.
- Economic execution remains out of scope until `CFO` and `Legal` explicitly validate the contract.
- City readiness must be explicit and evidence-based, never implied by marketing language.
- Turn state must remain honest about what is bound and what is still absent.

## Current Internal Preview

The internal review surface now exists in the Control UI as a dedicated preview route.

Its role is to validate:

- pilot-facing vocabulary
- activation-first information hierarchy
- dormant city handling
- compliance-hold framing
- explicit absence of economic execution

The current baseline card is now partially bound to real runtime signals:

- runtime continuity
- session continuity
- authority pressure

This binding remains intentionally narrow:

- no payout
- no demand inference
- no referral graph
- no rank engine
- no passenger workflow

## Next Architectural Move

The next acceptable step is a UX review that confirms:

- the pilot-facing vocabulary is distinct from the agentic stack
- the information hierarchy starts with activation and readiness
- `UP` and rank are visible without becoming speculative reward copy
- alerts and compliance notices remain legible and non-generic
