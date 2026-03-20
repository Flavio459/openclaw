# Guia de Fluxos de Trabalho do Collegium Cortex

Este documento traduz a arquitetura do projeto em uso operacional.

Use este guia quando a dúvida for:

- por onde começar numa análise
- qual superfície abrir primeiro
- quando sair de operação e entrar em deliberação
- quando o problema é técnico e não institucional

Documento complementar:

- enquadramento principal: [CONTEXTO_OPERACIONAL_AGENTES.md](./CONTEXTO_OPERACIONAL_AGENTES.md)
- estado atual da implementação: [MEMORIA_OPERACIONAL_PEMA.md](./MEMORIA_OPERACIONAL_PEMA.md)
- disciplina de execução: [../../WORKFLOW.md](../../WORKFLOW.md)
- calibragem de peso documental: [../../WORKFLOW.md#3g-modelo-enxuto-de-execução](../../WORKFLOW.md#3g-modelo-enxuto-de-execução)

---

## 1. Regra simples de uso

O sistema deve ser lido nesta ordem:

1. `Cortex Command`
2. `The Forum`
3. `Cortex Praetorium`

Essa ordem só muda quando o problema já nasce técnico.

---

## 2. Função de cada superfície

### `Cortex Command`

É a superfície de operação e leitura executiva.
Também é a página gráfica de acompanhamento do Chairman/presidência. Não é cockpit técnico.

Use quando quiser responder:

- como a operação está?
- qual corredor está sob pressão?
- há risco institucional aparecendo na operação?
- pilotos, passageiros e eventos parecem saudáveis?

Sinais típicos:

- pilotos
- passageiros
- mobilidade
- redes
- produção
- alertas
- pressão de corredor

### `The Forum`

É a superfície de deliberação estratégica.
Também é a sala digital de conselho. Quando a pauta for de conselho, é aqui que ela deve viver.

Use quando quiser responder:

- qual é o caso?
- qual evidência sustenta esse caso?
- quais caminhos existem?
- qual caminho deve ser recomendado?
- quando o `Chairman` precisa decidir?

Sinais típicos:

- caso principal
- evidências
- riscos
- opções
- caminhos recomendados
- impacto econômico
- escalonamento ao `Chairman`

### `Cortex Praetorium`

É a superfície de bastidor e supervisão de desenvolvimento.
Não é a sala de conselho. É o cockpit técnico e operacional de bastidor.

Use quando quiser responder:

- o runtime está saudável?
- qual agente está ativo?
- existe bloqueio técnico?
- o snapshot do domínio está coerente?
- a telemetria está explicando o que a UI mostra?

Sinais típicos:

- status
- timeline
- agentes
- bloqueios
- evidências técnicas
- ambiguidade
- console do snapshot de domínio

---

## 3. Fluxo-mãe

Quase todo trabalho deve seguir este ciclo:

### Etapa 1 — Ler a operação

Abrir `Cortex Command` para entender:

- o estado geral
- os sinais do domínio
- onde a tensão aparece

### Etapa 2 — Isolar o caso

Se houver:

- risco
- disputa
- alerta institucional
- pressão que exija julgamento

o caso deve subir para `The Forum`.

### Etapa 3 — Deliberar

No `The Forum`, organizar:

- contexto
- evidências
- opções
- riscos
- impacto
- decisão necessária

### Etapa 4 — Verificar bastidor

Se houver dúvida sobre:

- runtime
- consistência técnica
- snapshot
- telemetria

descer para `Cortex Praetorium`.

---

## 4. Casos-padrão

### Caso A — Corredor sob pressão

Começar em:

- `Cortex Command`

Olhar:

- pressão de corredores
- alertas operacionais
- reconciliação de produção

Ir para `The Forum` quando:

- o problema deixar de ser mera leitura operacional
- e passar a exigir decisão

### Caso B — Disputa entre piloto e passageiro

Começar em:

- `Cortex Command`

Olhar:

- assimetria de disputa
- quadro de pilotos
- quadro de confiança dos passageiros

Ir para `The Forum` quando:

- a disputa exigir arbitragem institucional
- houver necessidade de trilha de evidência

### Caso C — Decisão do Chairman

Começar em:

- `The Forum`

Olhar:

- caso principal
- painel de decisão
- matriz de cenários
- urgência
- estado de autoridade

Ir para `Cortex Praetorium` apenas se:

- houver dúvida se a base técnica do caso está errada

### Caso D — Problema técnico ou de consistência

Começar em:

- `Cortex Praetorium`

Olhar:

- status
- agente ativo
- bloqueios
- timeline
- snapshot do domínio

Não tentar resolver isso no `Forum`.

---

## 5. Perguntas que o operador deve fazer

### No `Cortex Command`

- estou vendo operação ou já estou vendo problema institucional?
- esta tela me dá leitura ou já está pedindo decisão?

### No `The Forum`

- o caso está claro?
- a evidência está suficiente?
- a opção recomendada é explicável?
- a decisão precisa do `Chairman`?

### No `Cortex Praetorium`

- o problema é técnico ou semântico?
- existe bloqueio real?
- a UI está refletindo uma projeção temporária ou dado de runtime?

---

## 6. O que não fazer

Não fazer:

- usar `Praetorium` como sala de decisão de negócio
- usar `Forum` como painel técnico
- usar `Command` para resolver disputa institucional sem deliberação
- tratar snapshot provisório como se fosse backend real
- confundir ferramenta de desenvolvimento com o produto

---

## 7. Estado atual do projeto

Hoje:

- a separação entre superfícies já existe
- a lógica inicial de domínio já existe
- o bastidor técnico já existe
- parte do domínio ainda é projetada por snapshot intermediário

Portanto:

- o fluxo já pode ser entendido
- mas nem tudo ainda deve ser lido como produção real

---

## 8. Síntese operacional

Se o usuário estiver perdido, usar esta instrução:

**Primeiro entenda a operação no `Command`. Depois entenda o caso no `Forum`. Só então use o `Praetorium` para validar o bastidor.**
