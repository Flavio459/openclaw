# ADR: Postergar upgrade do OpenClaw para checkpoint limpo e mirar 2026.3.8

## Status

Accepted

## Data

2026-03-09

## Contexto

O ambiente local e a trilha atual do Collegium Cortex estao em consolidacao:

- o runtime local no repositorio ainda esta em `2026.2.6-3`;
- o worktree principal de `openclaw-push` esta sujo e carrega customizacoes locais;
- existe uma frente ativa de superfícies, guardrails e dominio inicial do Collegium;
- a janela atual ainda mistura dashboard, Chairman API, LAB, MCP e runtime de agentes.

Ao mesmo tempo, o upstream do OpenClaw publicou:

- `v2026.3.7` em `2026-03-08`;
- `v2026.3.8` em `2026-03-09`.

O release `2026.3.7` introduz mudancas com impacto direto em areas sensiveis do projeto, em especial:

- `gateway.auth.mode` passa a exigir explicitacao quando `token` e `password` coexistem;
- mudancas no `ContextEngine`, hooks, compaction e bootstrap;
- alteracoes em plugins, onboarding, control UI e runtime.

Esses pontos tocam exatamente a area onde o Collegium ja possui customizacao e risco operacional:

- auth e pairing;
- control UI;
- Chairman API / dashboard / MCP;
- fluxo de contexto e runtime no LAB.

## Decision Drivers

- isolar causalidade entre evolucao do Collegium e upgrade de runtime;
- evitar saltos de versao em worktree sujo;
- nao parar em `2026.3.7` quando `2026.3.8` ja existe com correcoes adicionais;
- proteger LAB e superficie de controle de regressao em auth/pairing;
- manter capacidade de rollback e teste controlado.

## Opcoes consideradas

### Opcao 1: Atualizar agora para 2026.3.7

**Pros**

- acesso imediato aos recursos novos da linha `2026.3.x`.

**Cons**

- alvo ja defasado por `2026.3.8`;
- alto risco de regressao em auth/pairing/control UI;
- mistura upgrade de runtime com consolidacao do Collegium;
- worktree principal nao esta em estado adequado para upgrade.

### Opcao 2: Atualizar agora para 2026.3.8

**Pros**

- evita parar numa versao intermediaria;
- incorpora correcoes adicionais do upstream.

**Cons**

- continua sendo o momento errado;
- mantem risco alto por falta de isolamento;
- repo principal segue sem checkpoint limpo.

### Opcao 3: Postergar e abrir trilha isolada de upgrade para 2026.3.8 apos checkpoint limpo

**Pros**

- isola risco;
- permite preflight especifico de auth e config;
- preserva diagnostico claro se algo falhar;
- alinha com pratica profissional de upgrade em janela limpa.

**Cons**

- adia acesso aos recursos novos;
- cria uma trilha adicional de manutencao a curto prazo.

## Decisao

Postergar o upgrade do OpenClaw no ambiente principal.

Quando a frente atual estiver mergeada e o repo principal estiver limpo, abrir uma trilha isolada de upgrade com alvo em `2026.3.8`, testando primeiro no `LAB`.

`2026.3.7` nao sera tratada como destino final de upgrade.

## Consequencias

### Positivas

- reduz risco de regressao em auth, pairing e control UI;
- impede contaminacao entre mudanca de runtime e mudanca de produto;
- melhora capacidade de diagnostico;
- estabelece alvo de upgrade mais racional (`2026.3.8`).

### Negativas

- adia a adocao de recursos novos do runtime;
- exige disciplina para executar o upgrade na janela correta.

## Janela de execucao escolhida

O upgrade so deve ser aberto quando estas condicoes forem verdadeiras ao mesmo tempo:

1. a PR atual do Collegium estiver mergeada;
2. o worktree principal estiver limpo;
3. o LAB estiver sem mudancas estruturais concorrentes;
4. existir branch ou worktree dedicado para o upgrade;
5. o preflight de auth/config tiver sido concluido.

## Preflight obrigatorio

Antes de qualquer teste de upgrade:

- auditar `gateway.auth.token`, `gateway.auth.password` e `gateway.auth.mode`;
- revisar pairing e Control UI;
- revisar Chairman API, dashboard MCP e tunel/portas do LAB;
- validar bootstrap do runtime e plugins usados pelo ambiente;
- preparar rollback simples para a versao atual.

## Resultado operacional

A decisao profissional vigente passa a ser:

- `agora`: nao atualizar;
- `proximo checkpoint limpo`: abrir trilha isolada de upgrade;
- `alvo`: `2026.3.8`;
- `ambiente inicial`: `LAB`.
