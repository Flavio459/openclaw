# Runtime Adoption Checklist

Checklist curto para operar o modelo:

- `local-first` para código
- `VPS lab-first` para runtime
- `VPS prod-only` para release

Referência de política: [runtime-topology-policy.md](runtime-topology-policy.md)

## 1. Início de demanda

Antes de abrir trabalho técnico:

- rodar `scripts/pema/list-open-ideas.ps1`
- confirmar se a demanda já existe como `IDEA`, `SPEC` ou `DEC`
- se não existir, registrar `IDEA`
- promover com `scripts/pema/promote-idea.ps1`
- confirmar `Track` correto:
  - `application`
  - `motor`
  - `hybrid`

Regra:

- nada nasce direto em branch
- se a demanda ainda for `pré-DEC`, usar `Trilho Aplicação` e manter qualquer chat paralelo em
  modo `read-only`

## 2. Gate local

Antes de dizer que algo está pronto para `lab`:

- implementar em branch/worktree local
- rodar parse/teste/build aplicáveis
- revisar diff
- gerar ou atualizar evidência do fluxo

Checklist mínimo:

- `pnpm test`
- `pnpm build`
- `scripts/pema/dispatch-open-cli-specs.ps1 -Mode preview`
- `pnpm collegium:agentic:eval`
- `pnpm collegium:verify`
- `pnpm collegium:smoke:local`
  - recompila a UI atual antes do Playwright e grava artefatos em `output/playwright/collegium-local-smoke`

Se o trabalho for documental/fluxo:

- `pnpm collegium:status`

Se o trabalho tocar `SPEC`:

- `scripts/pema/new-specialist-response-template.ps1 -SpecId <SPEC-ID>`

## 3. Gate VPS lab

Obrigatório quando houver impacto de runtime, engine, infra, sessões, auth, pairing, cron ou integração.

Checklist mínimo em `lab`:

- rodar `pnpm collegium:lab:preflight`
- deploy da versão candidata
- `openclaw health --json`
- verificar `Control UI`
- verificar pairing ou sessão mínima
- rodar smoke do fluxo alterado
- registrar evidência em `REV`, checkpoint ou status

Checklist de leitura:

- `health` ok
- agente/sessão visível
- auth funcional
- sem erro estrutural novo no log

Regra:

- se falhar em `lab`, não sobe para `prod`
- `lab` e `prod` devem usar checkout remoto separado quando coexistirem na mesma VPS
- o preflight de `lab` deve permanecer `read-only`; ele valida reachability, `health`, túnel e `Control UI`, mas não promove nada sozinho

## 4. Gate VPS prod

Só entra em `prod` o que já passou por `lab`.

Checklist mínimo:

- aprovar a promoção
- `pnpm collegium:prod:preflight -- -AsJson`
- executar deploy controlado
- rodar smoke pós-release
- verificar observabilidade mínima
- registrar resultado

Checklist de leitura:

- `health` ok
- rota principal acessível
- fluxo crítico sem regressão
- erro novo ausente ou entendido

Regra:

- `prod` não é ambiente de diagnóstico exploratório

## 5. O que fica em cada lugar

### Local

- código
- branch
- worktree
- testes rápidos
- refactor
- revisão
- vault

### VPS lab

- runtime real de validação
- integração
- pairing
- auth
- agentes
- cron
- smoke de runtime

### VPS prod

- release estável
- observabilidade
- operação

## 6. Proibições

- não corrigir só na VPS e esquecer o repo
- não manter runtime autoritativo concorrente no local
- não validar feature de runtime só localmente
- não usar `prod` para experimentar
- não deixar `IDEA`, `SPEC` e branch perderem vínculo

## 7. Exceção de hotfix

Se for hotfix crítico:

- corrigir o incidente
- estabilizar o ambiente
- voltar a correção para o repo
- registrar observação ou incidente
- recolocar a frente na trilha normal

## 8. Regra de bolso

Use esta pergunta antes de agir:

> estou mexendo em código ou em verdade operacional?

Se for código:

- local

Se for verdade operacional:

- `VPS lab` primeiro

Se for release:

- `VPS prod`

## 9. Higiene recorrente

Regra:

- `run-motor-agentico-cron.ps1` roda em modo `read-only` por padrão
- despacho automático de `SPEC` CLI exige opt-in explícito com `-LaunchOpenCliSpecs`
- monitoramento recorrente nunca substitui julgamento humano

## 10. Governança agentica

Quando a mudança tocar `The Forum`, `Cortex Command`, governança agentica ou decisão de C-level:

- garantir `DecisionTrace` para qualquer recomendação sensível
- nunca aprovar sem `evidenceIds`
- nunca sintetizar `cross_mandate_conflict` em consenso implícito
- tratar `economia`, `compliance`, `narrativa pública`, `reputação` e `mudança estrutural` como temas de `HITL`
- estacionar bloqueio humano real em `docs/collegium-discussion-inbox.md`

## 11. Outro chat no mesmo workspace

Se for necessário abrir outro chat do Codex no mesmo workspace:

- usar só para `IDEA`, `pré-DEC` ou deliberação
- classificar como `Trilho Aplicação`
- manter `read-only`
- produzir análise, delta ou review packet
- não editar o repo nem competir com a frente principal de motor

Referências:

- [parallel-workflow.md](parallel-workflow.md)
- [collegium-parallel-predec-fronts.md](collegium-parallel-predec-fronts.md)
