# Collegium Pre-DEC Delta Prompt

Use this prompt when opening another Codex chat in the same workspace to review a non-binding
pre-DEC without turning that chat into an implementation front.

```text
Treat the text below as a non-binding pre-DEC for Collegium Cortex.

Main rule:
- this is not an implementation order
- this does not authorize structural change
- this does not authorize runtime, concurrency, spawn policy, workspaceAccess, or sensitive gate changes
- this must be treated as a delta for DEC, compared against the already-implemented baseline

Your job:
1. compare the pre-DEC against the active baseline
2. separate clearly:
   - what is already aligned
   - what is a new proposal
   - what requires formal DEC
   - what should not enter now
3. identify conflicts, gaps, risks, and impacts
4. return a rigorous architectural recommendation
5. implement nothing

Mandatory baseline:
- docs/collegium-agentic-operating-contract.md
- ui/src/ui/collegium/agentic-governance.contract.ts
- ui/src/ui/collegium/agentic-governance.ts
- src/gateway/collegium-agentic-scenarios.ts
- docs/parallel-workflow.md
- WORKFLOW.md
- docs/collegium-discussion-inbox.md
- docs/collegium-parallel-predec-fronts.md

Expected answer format:
1. Executive summary
2. Compatibility with the current baseline
3. New proposed changes
4. What requires formal DEC
5. Risks of accepting too early
6. Final recommendation
7. Proposed delta for a future DEC
```

## Notes

- The other chat is a controlled reviewer, not an implementer.
- If the result later becomes implementation, it must move to a dedicated `Trilho Motor` front
  with branch/worktree isolation.
