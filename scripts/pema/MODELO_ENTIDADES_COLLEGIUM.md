# Modelo de Entidades Collegium

Primeira camada explícita do domínio central do `Collegium Cortex`.

Este documento não descreve runtime, gateway ou cockpit. Ele descreve o núcleo operacional que
passa a existir como contrato implementável na aplicação.

## Objetivo

- dar forma tipada ao domínio institucional e operacional;
- separar o ecossistema do `Collegium` da telemetria do `OpenClaw`;
- permitir projeções honestas para `Cortex Command` e `The Forum`;
- preservar auditabilidade sem fingir backend definitivo.

## Entidades Centrais

### Pilot

Representa um operador governado pela infraestrutura de mobilidade.

Campos relevantes:

- `id`
- `displayName`
- `status`
- `reputationScore`
- `productionUnitsValidated`
- `networkNodeId`
- `activeMobilityEvents`
- `flags`

Estados:

- `candidate`
- `active`
- `restricted`
- `suspended`

Invariantes:

- o piloto pertence a um `EconomicNetworkNode`;
- produção validada não nasce por inferência de runtime;
- restrições e flags fazem parte da governança protocolar.

### Passenger

Participante governado do sistema, não mero cliente passivo.

Campos relevantes:

- `id`
- `displayName`
- `status`
- `reputationScore`
- `trustFlags`
- `completedTrips`

Estados:

- `active`
- `flagged`
- `restricted`

### MobilityEvent

Evento primário de geração de valor operacional.

Campos relevantes:

- `id`
- `pilotId`
- `passengerId`
- `status`
- `startedAt`
- `completedAt`
- `productionUnitsGenerated`
- `routeLabel`
- `riskSignals`
- `evidenceRefs`

Estados:

- `requested`
- `matched`
- `in_progress`
- `completed`
- `canceled`
- `contested`

Invariantes:

- todo evento pertence a um piloto e um passageiro;
- sinais de risco ficam anexados ao próprio evento;
- `productionUnitsGenerated` descreve a produção do evento, mas a validação econômica formal ocorre no ledger.

### ProductionUnitLedgerEntry

Registro validado da produção econômica.

Campos relevantes:

- `mobilityEventId`
- `pilotId`
- `amount`
- `validatedAt`
- `evidenceRefs`

Invariantes:

- toda entrada aponta para um `MobilityEvent` existente;
- nunca existe entrada solta, sem `validatedAt`;
- o valor econômico nasce da mobilidade concluída com evidência.

### EconomicNetworkNode

Nó da rede econômica do Collegium.

Campos relevantes:

- `id`
- `label`
- `pilotIds`
- `supervisedBy`
- `activeProductionUnits`

Invariantes:

- o nó organiza pilotos e capacidade operacional;
- ele não substitui canal de runtime nem presença técnica;
- seu papel é econômico-governativo.

### DeliberationCase

Caso institucional do `The Forum`.

Campos relevantes:

- `id`
- `title`
- `status`
- `linkedMobilityEventIds`
- `linkedPilotIds`
- `riskLevel`
- `summary`
- `options`
- `recommendedPath`
- `chairmanActionRequired`
- `evidenceRefs`

Estados:

- `draft`
- `under_review`
- `pending_chairman`
- `resolved`

Invariantes:

- toda deliberação se ancora em piloto, evento ou ambos;
- casos não existem como abstração vazia;
- `The Forum` usa esses casos como pauta institucional principal.

## Snapshot Agregado

`CollegiumDomainSnapshot` reúne:

- `pilots`
- `passengers`
- `mobilityEvents`
- `productionLedger`
- `networkNodes`
- `deliberations`

Este snapshot é a base das projeções da etapa atual.

## Separação de Superfícies

- `Cortex Command`: consome projeções agregadas do domínio.
- `The Forum`: consome deliberações e highlights do domínio.
- `Cortex Praetorium`: permanece orientado ao runtime nesta etapa.

## Fonte Atual

Nesta fase, a origem do domínio é:

- `fixture_projection`

Isso é deliberado. O sistema passa a ter alma operacional explícita, mas sem fingir integração real que ainda não existe.
