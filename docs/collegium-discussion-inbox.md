# Collegium Discussion Inbox

## Purpose

- Hold doubts, improvements, objections, and observations outside the source-code execution flow.
- Let the Chairman work in parallel while the AI and agents continue execution.
- Prevent raw discussion from polluting the execution chat or mutating the backlog too early.

## Surface

- Default surface: `Cortex Praetorium`
- Escalate to `The Forum` only when the subject becomes strategic, comparative, or approval-sensitive.

## Professional Workflow

1. Open a new discussion thread in the local inbox.
2. Discuss the subject in-thread without changing source code.
3. Triage the thread with `type`, `surface`, `status`, `destination`, and `impact`.
4. Promote only when the material is mature enough for analysis.
5. Generate a review packet for `analise_lider`, `forum`, or `arquivo`.

## Parallel Codex chats

A second Codex chat in the same workspace is allowed when the subject is still a `pré-DEC`,
`IDEA`, or deliberative review.

Rules:

- the chat stays `read-only`
- the chat does not edit repo-tracked files
- the chat produces analysis, stress test, or a delta for DEC
- the chat does not become a hidden implementation lane

Canonical policy:

- [collegium-parallel-predec-fronts.md](collegium-parallel-predec-fronts.md)

## Status Model

- `novo`
- `em_triagem`
- `promovido`
- `arquivado`

## Destinations

- `triagem_local`
- `analise_lider`
- `forum`
- `arquivo`

## Local Storage

- State file: `local/collegium-discussions/state.json`
- Review packets: `local/collegium-discussions/review-packets/`

These paths are intentionally ignored by git so the inbox remains outside the source-code flow.

## Commands

- Start server: `pnpm collegium:discussions`
- Open in browser: `pnpm collegium:discussions:open`
- Rebuild status panel link: `pnpm collegium:status`

## Design Rule

- Discussion threads do not mutate source code directly.
- Promotion creates a packet for the lead developer and agentic team to analyze in a separate environment.
