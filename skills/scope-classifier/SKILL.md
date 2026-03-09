---
name: scope-classifier
description: Classify Collegium Cortex requests before execution. Use when a request may target product, engine, infra, or research, or when there is ambiguity between a business agent and an engineering agent.
---

# Scope Classifier

Do not execute ambiguous work without first classifying scope and agent type.

## Required outputs

Classify every relevant request into:

- `scope`: `product` | `engine` | `infra` | `research`
- `agent_class`: `business_agent` | `engineering_agent`
- `target_surface`
- `ambiguity`: `low` | `medium` | `high`

## Scope rules

- `product` = affects the company interface, business flows, operator experience, or governed participants
- `engine` = affects agent behavior, orchestration, semantics, prompts, runtime logic, or internal tooling
- `infra` = affects deployment, services, networking, authentication, storage, or environment operations
- `research` = exploration, validation, comparison, hypothesis building, or concept shaping without direct implementation yet

## Agent class rules

- `business_agent` = acts inside the company logic
- `engineering_agent` = builds or evolves the system itself

## Execution rule

If ambiguity is `low`, state the assumption and proceed.

If ambiguity is `medium`, state the assumed classification before editing.

If ambiguity is `high`, ask one concise clarification question before changing files or routing work.
