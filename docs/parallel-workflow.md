# Parallel Workflow

Guia curto para operar o `Collegium Cortex` com dois trilhos sincronizados sem colidir contexto, branch, ambiente ou superfície.

## 1. Modelo

O fluxo se divide em três camadas:

- `Trilho Aplicação`
  - `scope`: `product + research`
  - `surface`: `Cortex Command` + `The Forum`
  - produz `IDEA`, `DEC`, `WS`, `SPEC funcional`, critérios de aceite e propostas de superfície
- `Trilho Motor`
  - `scope`: `engine + infra`
  - `surface`: `OpenClaw Runtime` + `Cortex Praetorium`
  - produz branch, worktree, patch, testes, `REV` e PR
- `Trilho de Sincronismo`
  - valida passagens entre aplicação e motor
  - força checkpoint com `Estado`, `Risco`, `Próxima ação dominante` e `Próximo responsável`

Regra central:

- nenhuma demanda nova vira branch diretamente
- toda demanda nova começa em `IDEA`

## 2. Intake `IDEA`

Formato mínimo:

- `ID`: `IDEA-YYYYMMDD-NN`
- `Estado`: `inbox | triaged | promoted | parked | rejected`
- `Track`: `application | motor | hybrid`
- `Surface alvo`
- `Descrição curta`
- `Impacta WS atual?`
- `Próxima ação dominante`

Fluxo:

1. registrar `IDEA`
2. classificar `Track` e `Surface`
3. decidir se a ideia vira `parked`, `DEC`, `WS` ou `SPEC funcional`
4. promover com `scripts/pema/promote-idea.ps1`

Scripts:

- `scripts/pema/list-open-ideas.ps1`
- `scripts/pema/promote-idea.ps1`

## 3. Trilho Aplicação

Use quando o trabalho for:

- hipótese de produto
- superfície
- fluxo de usuário
- análise conceitual
- pesquisa
- deliberação antes de implementação

Saídas válidas:

- `IDEA` refinada
- `DEC`
- `WS`
- `SPEC funcional`

Regra:

- o trilho aplicação não abre branch
- um segundo chat no mesmo workspace só pode existir aqui como frente deliberativa `read-only`
  para `IDEA` ou `pré-DEC`

Nomes recomendados de chat:

- `idea-<id>-research`
- `ws-<id>-product`
- `dec-<id>-forum`
- `predec-<id>-delta`

### Frentes paralelas de `pré-DEC`

Quando um assunto ainda não pode virar implementação, mas precisa de uma análise adicional em
paralelo:

- abrir outro chat do Codex no mesmo workspace é permitido
- esse chat continua no `Trilho Aplicação`
- a superfície padrão é `The Forum`
- o output deve ser `delta formal para DEC`
- a política de mutação é `read-only`

Esse chat não pode:

- editar arquivos do repo
- abrir branch ou worktree
- agir como segunda frente de motor
- tratar o material como baseline aprovada

Referência canônica:

- [collegium-parallel-predec-fronts.md](collegium-parallel-predec-fronts.md)

## 4. Trilho Motor

Use quando o trabalho for:

- codificação
- refatoração
- runtime
- scripts `pema`
- integração com VPS
- build/test/review
- worktree/branch/PR

Saídas válidas:

- branch
- worktree
- patch
- testes
- `REV`
- PR

Regra:

- nada entra no trilho motor sem `WS`, `SPEC` ou `DEC`
- exceção: hotfix operacional crítico de produção

Nomes recomendados de chat:

- `spec-<id>-build`
- `spec-<id>-review`
- `spec-<id>-infra`

## 5. Branches e worktrees

Convenções:

- branch: `feat/<ws-id>-<slug>`
- branch: `fix/<ws-id>-<slug>`
- branch: `infra/<ws-id>-<slug>`
- worktree: `openclaw-push/.worktrees/<branch>`
- PR: `[WS-xxxx][SPEC-xxxx] titulo`

Regra de isolamento:

- uma frente de motor = uma branch = uma worktree = um chat principal
- revisão roda em chat separado
- duas frentes não editam a mesma área sem checkpoint explícito
- frente deliberativa paralela não edita área nenhuma; ela produz análise e delta

## 6. Ambientes

Referência canônica: [docs/runtime-topology-policy.md](runtime-topology-policy.md)
Checklist operacional: [docs/runtime-adoption-checklist.md](runtime-adoption-checklist.md)

Decisão:

- `local-first` para código
- `VPS lab-first` para runtime e integração
- `VPS prod-only` para operação estável

### Local

Papel:

- coordenação
- vault
- branch e worktree
- implementação
- refactor
- testes rápidos
- build local

Regra:

- local é sandbox de desenvolvimento
- não é fonte canônica de estado durável

### VPS lab

Papel:

- builds pesados
- testes demorados
- sessões longas
- auth
- pairing
- agentes
- cron
- smoke real de integração

Regras:

- usar diretório, usuário, state e logs separados da produção
- usar checkout remoto separado de `prod` sempre que a VPS operar os dois ambientes em paralelo
- tratar `lab` como runtime canônico de validação
- exemplo: `/srv/openclaw-lab`

### Produção

Papel:

- runtime real
- smoke test final
- observabilidade

Proibido:

- pesquisa livre
- edição experimental
- swarm de agentes
- worktree de desenvolvimento no mesmo state da produção
- validação que deveria acontecer antes em `lab`

## 7. Concorrência

### Fase inicial

Máximo `3` frentes simultâneas:

- `1` frente de aplicação
- `1` frente principal de motor
- `1` frente de review/infra

Quarta frente:

- não executa
- vira `IDEA inbox` ou `SPEC queued`

### Configuração recomendada

Produção:

```yaml
agents:
  defaults:
    maxConcurrent: 1
    subagents:
      maxConcurrent: 1
```

Dev isolado:

```yaml
agents:
  defaults:
    maxConcurrent: 2
    subagents:
      maxConcurrent: 3
```

Não aumentar antes de duas iterações estáveis.

## 8. Substratos

- `gemini-cli`
  - preferir para pesquisa estruturada e throughput no trilho aplicação
- `codex-cli`
  - preferir para execução técnica delimitada no trilho motor
- `antigravity-cli`
  - fallback explícito, nunca padrão

Regra:

- CLI não substitui governança
- toda saída relevante volta por `Entrega` + `REV`

## 9. Scripts canônicos

- `scripts/pema/list-open-ideas.ps1`
- `scripts/pema/promote-idea.ps1`
- `scripts/pema/list-open-specialist-dispatches.ps1`
- `scripts/pema/dispatch-open-cli-specs.ps1`
- `scripts/pema/new-specialist-response-template.ps1`
- `scripts/pema/import-specialist-output.ps1`
- `scripts/pema/run-motor-agentico-checkpoint.ps1`
- `scripts/pema/run-motor-agentico-cron.ps1`

## 10. Critérios de promoção

Aplicação promove para motor somente quando houver:

- objetivo claro
- superfície clara
- critério de aceite
- ausência de ambiguidade estratégica dominante

Motor devolve para aplicação quando surgir:

- conflito de superfície
- impacto reputacional
- impacto de governança
- ambiguidade conceitual
- descoberta que muda a tese do fluxo

Promover para `DEC` quando tocar:

- regra estrutural
- semântica central
- autoridade
- reputação
- economia
- compliance
- narrativa sensível
