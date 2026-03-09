# Modelo de Eventos Collegium

Este documento formaliza os eventos e transições mínimas do domínio central do `Collegium Cortex`.

## Princípio

A telemetria do runtime complementa a leitura do sistema. Ela não define sozinha:

- produção;
- deliberação;
- rede;
- estado operacional de piloto ou passageiro.

O domínio central precisa de seus próprios eventos e consequências.

## Evento Primário: MobilityEvent

`MobilityEvent` representa a unidade operacional mínima da mobilidade.

Estados:

- `requested`
- `matched`
- `in_progress`
- `completed`
- `canceled`
- `contested`

### Consequências por estado

#### `requested`

- demanda registrada;
- ainda sem produção econômica;
- ainda sem vínculo operacional concluído.

#### `matched`

- piloto e passageiro vinculados;
- capacidade da rede comprometida;
- ainda sem produção validada.

#### `in_progress`

- execução ativa;
- pode alimentar supervisão operacional;
- não gera ledger validado por si só.

#### `completed`

- permite geração de `ProductionUnitLedgerEntry`;
- exige evidência vinculada;
- pode alimentar projeções executivas.

#### `canceled`

- encerra a movimentação sem produção validada;
- pode gerar trilha de risco ou qualidade.

#### `contested`

- eleva risco institucional;
- pode gerar deliberação;
- mantém necessidade de evidência e arbitragem.

## Produção Econômica

O valor econômico do sistema deriva de mobilidade concluída.

Regra:

- `ProductionUnitLedgerEntry` só existe quando há:
  - `mobilityEventId`
  - `pilotId`
  - `validatedAt`
  - `evidenceRefs`

Consequência:

- não há produção inventada por dashboard;
- não há ledger solto sem evento;
- não há remuneração protocolar abstraída de evidência.

## Evento Institucional: DeliberationCase

`DeliberationCase` modela o trabalho do `The Forum`.

Estados:

- `draft`
- `under_review`
- `pending_chairman`
- `resolved`

### Critérios

- todo caso precisa de resumo, risco e evidência;
- todo caso deve apontar para entidades reais do domínio;
- casos com `chairmanActionRequired = true` sobem para a trilha de autoridade.

## Relação Entre Domínio e Runtime

### Runtime

Exemplos:

- `execApprovalQueue`
- `eventLog`
- `presence`
- `cron`

Papel:

- mostrar operação do motor;
- registrar autoridade operacional;
- apoiar observabilidade do cockpit.

### Domínio

Exemplos:

- `MobilityEvent`
- `ProductionUnitLedgerEntry`
- `EconomicNetworkNode`
- `DeliberationCase`

Papel:

- representar a realidade institucional e econômica do Collegium;
- alimentar `Cortex Command` e `The Forum`.

## Projeções de Superfície

Nesta etapa:

- `Cortex Command` recebe KPIs agregados do snapshot;
- `The Forum` recebe fila de deliberação e highlights estratégicos;
- ambos declaram `provenance: "fixture_projection"`.

Isso mantém a honestidade arquitetural:

- domínio já existe;
- backend definitivo ainda não.
