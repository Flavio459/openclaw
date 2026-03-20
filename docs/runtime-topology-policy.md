# Runtime Topology Policy

Política operacional para evitar drift entre código, estado, ambiente e promoção no `openclaw-push`.

Checklist operacional: [runtime-adoption-checklist.md](runtime-adoption-checklist.md)

## 1. Decisão

O modelo oficial é **híbrido assimétrico**:

- `local-first` para código
- `VPS lab-first` para runtime e validação integradora
- `VPS prod-only` para operação estável

Não operar com dois runtimes autoritativos em paralelo.

## 2. Objetivo

Evitar estes erros:

- desenvolver um conceito no local e outro na VPS
- corrigir algo manualmente no servidor e não voltar para o repo
- tratar ambiente local como se fosse o runtime real
- usar produção como laboratório

## 3. Papéis por ambiente

### Local

Papel:

- branch
- worktree
- implementação
- refactor
- testes rápidos
- build local
- revisão
- vault e coordenação

Regra:

- o local é sandbox de desenvolvimento
- pode executar gateway direto para feedback rápido
- não é fonte canônica de estado durável

### VPS lab

Papel:

- runtime canônico de integração
- sessões longas
- auth
- pairing
- cron
- agentes
- validação real de fluxo
- smoke de integração

Regra:

- toda mudança do `Trilho Motor` que afete runtime deve passar aqui antes de `prod`
- `lab` é a referência real para validar comportamento operacional
- `lab` não deve compartilhar checkout remoto ativo com `prod` quando ambos coexistirem na mesma VPS

Exemplo atual:

- `prod` em `/home/deploy/openclaw-prod`
- `lab` em `/home/deploy/openclaw-lab`

### VPS prod

Papel:

- operação estável
- release aprovada
- observabilidade
- smoke final

Regra:

- `prod` não é ambiente de descoberta
- `prod` não recebe experimento, pesquisa livre ou worktree de desenvolvimento

## 4. Fonte de verdade

Separar explicitamente:

- `repo` = fonte de verdade do código
- `vault` = fonte de verdade de decisão, contexto e rastreabilidade
- `VPS lab/prod` = fonte de verdade do estado operacional real
- `local` = ambiente de construção e validação rápida

## 5. Regra de promoção

Toda mudança segue a mesma trilha:

1. `local`
2. `VPS lab`
3. `VPS prod`

Não pular `lab` quando a mudança tocar:

- gateway
- auth
- pairing
- sessões
- agentes
- cron
- deploy
- integrações
- scripts `pema` que impactem runtime

## 6. Relação com os dois trilhos

### Trilho Aplicação

Pode nascer e amadurecer localmente.

Produz:

- `IDEA`
- `DEC`
- `WS`
- `SPEC funcional`

Não promove sozinho mudança operacional de runtime.

### Trilho Motor

Pode implementar localmente, mas fecha o ciclo apenas após validação em `VPS lab` quando houver impacto de runtime ou infraestrutura.

Produz:

- branch
- worktree
- patch
- testes
- `REV`
- PR

## 7. Gates obrigatórios

### Gate A. Local

Exigir:

- parse
- teste aplicável
- build aplicável
- diff compreensível

### Gate B. VPS lab

Exigir quando houver impacto de runtime:

- `health`
- auth básica
- pairing básico
- leitura de sessão/agente
- smoke operacional do fluxo alterado

### Gate C. VPS prod

Exigir:

- deploy controlado
- smoke pós-release
- observabilidade mínima

## 8. Proibições

- não manter estado autoritativo local que concorra com `lab` ou `prod`
- não editar manualmente a VPS como caminho normal de desenvolvimento
- não usar a mesma montagem/state para `local`, `lab` e `prod`
- não usar o mesmo checkout remoto como base operacional simultânea de `lab` e `prod`
- não abrir duas versões conceituais da mesma frente em ambientes diferentes
- não usar `prod` para testes exploratórios

## 9. Exceções

Exceção válida:

- hotfix operacional crítico

Mesmo nesse caso:

- registrar incidente ou observação
- corrigir no repo
- devolver o estado para a trilha normal

## 10. Regra prática para esta fase

A decisão recomendada para o `openclaw-push` nesta fase é:

- continuar desenvolvendo no local
- tratar `VPS lab` como runtime canônico
- preservar `prod` apenas para operação estável

Em uma frase:

> código nasce no local; verdade operacional vive na VPS.

## 11. Governança agentica nesta topologia

As mesmas fronteiras valem para os C-levels agenticos:

- `local` para contratos, evals deterministicas, adapters e renderizacao
- `VPS lab` para verdade operacional de sessoes, auth, pairing, agentes e integracao
- `VPS prod` apenas para operacao estavel e gates finais de promocao

Decisoes tocando economia, compliance, narrativa publica, reputacao ou mudanca estrutural nao
podem ser tratadas como automacao livre. Elas continuam exigindo `DecisionTrace`, `HITL` e/ou
escalonamento conforme a matriz canonica.

Outro chat no mesmo workspace nao muda essa regra:

- se o assunto ainda for `pré-DEC`, ele fica no `Trilho Aplicação`
- se o chat paralelo existir, ele deve operar em `read-only`
- implementacao continua exigindo frente propria no `Trilho Motor`
