# Collegium Parallel Pre-DEC Fronts

## Purpose

This document defines when a second Codex chat may be opened inside the same workspace for a
Collegium Cortex subject without violating the current workflow, runtime topology, or branch
discipline.

The main use case is a **pre-DEC non-binding study** that needs a separate review lane without
turning that lane into an implementation front.

## Canonical decision

A second Codex chat in the same workspace is allowed only when all of these are true:

- the subject is still a `pre-DEC`, `IDEA`, or deliberative review package
- the front is classified as `Trilho Aplicação`
- the target surface is `The Forum`
- the output is analysis, delta, criticism, or a DEC proposal
- the chat remains `read-only` with respect to repo-tracked state

It is not allowed as:

- a second implementation front
- a parallel motor branch/worktree
- an approval authority
- a substitute for the Chairman rail

## Classification

Use this exact classification for the parallel front:

- `track`: `application`
- `surface`: `The Forum`
- `scope`: `governança agentica`
- `output`: `delta formal para DEC`
- `mutation_policy`: `read-only`
- `authority`: `consultiva`

## Baseline comparison set

The parallel chat must compare the incoming material only against the active baseline:

- [collegium-agentic-operating-contract.md](collegium-agentic-operating-contract.md)
- [parallel-workflow.md](parallel-workflow.md)
- [runtime-topology-policy.md](runtime-topology-policy.md)
- [runtime-adoption-checklist.md](runtime-adoption-checklist.md)
- [collegium-discussion-inbox.md](collegium-discussion-inbox.md)
- `WORKFLOW.md`
- `ui/src/ui/collegium/agentic-governance.contract.ts`
- `ui/src/ui/collegium/agentic-governance.ts`
- `src/gateway/collegium-agentic-scenarios.ts`

## Allowed outputs

The parallel front may produce only:

- compatibility map
- risks and conflicts
- delta proposal for a future `DEC`
- recommendation to keep the topic as study
- review packet for `The Forum`, `analise_lider`, or archive

The parallel front must not produce:

- code patches
- config mutations
- runtime changes
- new branch/worktree instructions for immediate execution
- implicit approval of the proposal under review

## Mandatory workflow

1. Treat the subject as `pré-DEC não vinculante`.
2. Confirm the baseline set above.
3. Produce a compatibility map with these classes:
   - `ja_implantado`
   - `implantado_parcialmente`
   - `proposta_nova_compatível`
   - `proposta_nova_sensível`
   - `exige_DEC`
   - `deve_permanecer_estudo`
4. Produce a formal delta for DEC.
5. Route the result to one of:
   - `triagem_local`
   - `analise_lider`
   - `forum`
   - `arquivo`

## Collision rules

While the pre-DEC is under parallel review:

- the review chat does not edit repo-tracked files
- the main development front keeps working only on already-authorized implementation
- no second chat edits `agentic-governance.*`, `forum.*`, or `collegium-agentic-scenarios.ts`
- if the delta is later approved for implementation, it must become a new `Trilho Motor` front
  with its own branch, worktree, and checkpoint

## Minimum analysis blocks

Any valid review must classify these blocks separately:

1. `orchestrator + specialists + reviewer`
2. `Plan -> Validate -> Execute`
3. `DecisionTrace` expansion
4. `GovernanceOutcome` expansion
5. `ForumViewModel` expansion
6. timeout and deliberative SLA policy
7. observability and metrics
8. `cto` and `cmo` readiness
9. spawn and allowlist policy
10. `workspaceAccess` policy
11. concurrency by environment
12. `LAB` simulations
13. `30-60-90` roadmap

## Canonical prompt

Use the official prompt in:

- [collegium-predec-delta-prompt.md](collegium-predec-delta-prompt.md)

## Acceptance criteria

This policy is being followed only when:

- the second chat is explicitly framed as `Trilho Aplicação`
- the work is `read-only`
- the output is a delta for `DEC`, not implementation
- the active baseline remains untouched
- the main execution front does not collide with the review front
