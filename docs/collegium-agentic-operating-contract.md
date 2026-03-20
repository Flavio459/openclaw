# Collegium Agentic Operating Contract

## Purpose

This contract formalizes how agentic C-levels participate in Collegium Cortex without replacing
human sovereignty, mandate boundaries, or auditability.

It does not create a second governance stack. It compresses the operating rules already implied by:

- the Chairman rail
- the mandate matrix in the vault
- the Chairman API, `HMAC + TTL`, and `cluster_write_guard`
- the local -> lab -> prod runtime topology

## Canonical truths

- `Cortex Command` is the executive read for the Chairman.
- `The Forum` is the deliberative room.
- `Cortex Praetorium` is the technical cockpit and evidence surface.
- `The Cockpit` is the future pilot-facing mobility product, not a synonym for Praetorium.
- The Motor Agentico can classify, route, and prepare review, but it cannot silently replace a
  Responsible or Accountable human/agent mandate.
- Sensitive decisions require traceability and, when applicable, human-in-the-loop escalation.

## Live agent set

The runtime currently exposes these agentic roles in LAB:

- `main`
- `ceo`
- `cfo`
- `legal`
- `ped`

`cto` and `cmo` are contractual roles in this phase. They only become live-eval targets after
they are exposed in runtime.

Readiness principle for `cto` and `cmo`:

- mandate must be explicit
- dedicated evals must exist
- behavior must remain coherent with the active governance policy
- validation must happen in `lab`
- deliberative review must remain explicit before any future live activation

## Mandatory decision trace

No sensitive recommendation is valid without a `DecisionTrace` carrying:

- `traceId`
- `agentRole`
- `mandate`
- `summary`
- `rationale`
- `evidenceIds`
- `consulted`
- `hitlRequired`
- `escalate`
- `escalationReasons`
- `status`
- `nextResponsible`
- `observedAt`

Rules:

- `evidenceIds` cannot be empty for sensitive recommendations.
- `cross_mandate_conflict` cannot be synthesized into a silent approval.
- `insufficient_evidence` must end in `defer` or `escalate`, never `approve`.
- `economics`, `compliance`, `narrative`, and `chairman` mandates imply `HITL`.
- `status` must stay explicit enough for the room to understand whether the case is still under
  review or already deferred, escalated, or approved.
- `nextResponsible` must stay explicit enough for the room to know who acts next without inference.

## Mandate policy

Default owner/accountability by mandate:

- `strategy` -> owner/accountable `ceo`
- `architecture` -> owner/accountable `cto`
- `economics` -> owner/accountable `cfo`
- `compliance` -> owner/accountable `legal`
- `narrative` -> owner/accountable `cmo`
- `operations` -> owner `main`, accountable `cto`
- `chairman` -> owner/accountable `chairman`

Default consultation:

- `strategy` -> `cfo`
- `architecture` -> `main`, `ped`
- `economics` -> `ceo`, `legal`
- `compliance` -> `ceo`
- `narrative` -> `ceo`, `legal`, `cfo`
- `operations` -> `ped`
- `chairman` -> `ceo`

## Operational security floor

- Keep `local`, `lab`, and `prod` separated.
- Keep `lab` and `prod` preflights in `read-only` mode.
- Persist preflight evidence in `scripts/pema/.logs`.
- Treat decisions touching economics, remuneration, compliance, public narrative, or sensitive
  automation as HITL-gated by default.

## Reliability floor

### OpenClaw Runtime

- Local `/health` <= `1000 ms`
- Tunneled `lab` and `prod` `/health` <= `1500 ms`
- `RTO 15 min`
- `RPO 15 min`

### Collegium surfaces

- `Cortex Command`, `The Forum`, `Cortex Praetorium` must render without runtime errors in desktop
  `1440px` and mobile `390px`
- `RTO 30 min`
- `RPO 60 min`

### The Cockpit

- No production SLO in this phase
- Current requirement: contract complete, internal UX pass, and explicit `CFO`/`Legal` gate before
  any economic logic becomes executable

## Deterministic evals

The baseline CI-safe eval set must cover:

- CEO expansion proposal vs CFO sustainability objection
- CTO sensitive automation with compliance impact
- CMO public narrative proposal without enough evidence
- degraded runtime with pending approvals

These evals must remain deterministic, local, and network-free.

## Commands

- `pnpm collegium:agentic:eval`
- `pnpm collegium:verify`
- `pnpm collegium:lab:preflight -- -AsJson`
- `pnpm collegium:prod:preflight -- -AsJson`

## Non-goals

- No runtime upgrade in this phase
- No reimplementation of Chairman API or trust rails
- No direct economic or pilot telemetry invention
- No new heavy documentary cycle for local UI refinement
