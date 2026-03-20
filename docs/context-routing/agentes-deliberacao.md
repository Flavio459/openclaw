# Agentes e Deliberação

## Leia no vault

Obrigatório:

- `Motor Agentico do Collegium Cortex`
- `Protocolo Operacional do Motor Agentico`
- `Contratos de Saída e Horizontes de Resultado do Collegium Cortex`
- `Matriz de Mandatos e Escalonamento dos C-Levels`
- `Fluxos de Trabalho do Collegium`

Consultar conforme o caso:

- `Protocolo de Decisão Relevante do Collegium Cortex`
- `Fila de Decisões do Collegium Cortex`
- `Fila de Workstreams do Collegium Cortex`
- `Registro de Despachos de Especialistas do Collegium Cortex`
- `Registro de Revisões e Fechamentos do Collegium Cortex`
- `Conselho Seletivo do Collegium Cortex`
- prompt do C-Level dono da frente

## Abra no repo

- `WORKFLOW.md`
- `docs/context-routing/governanca.md`
- `docs/context-routing/produto-superficies.md`
- `scripts/pema/register-decision-case.ps1`
- `scripts/pema/list-open-decisions.ps1`
- `scripts/pema/list-open-specialist-dispatches.ps1`
- `scripts/pema/dispatch-open-cli-specs.ps1`
- `scripts/pema/run-motor-agentico-checkpoint.ps1`
- `scripts/pema/run-motor-agentico-cron.ps1`
- `scripts/pema/new-specialist-response-template.ps1`
- `scripts/pema/import-specialist-output.ps1`
- `scripts/pema/GUIA_FLUXOS_DE_TRABALHO_COLLEGIUM.md`
- `scripts/pema/README.stitch-mcp-dashboard.md`

## Entrada técnica mínima

Antes de agir, responda:

1. isto é `DEC` ou `workstream`?
2. quem é o dono da frente?
3. qual é o horizonte de resultado?
4. qual envelope de saída é aceito?
5. o próximo passo é despacho, revisão, pré-conselho ou `Chairman`?

## Política prática de continuidade

Continue sozinho quando:

- houver `WS` ativo com dono claro;
- o próximo `SPEC` for derivável;
- o risco dominante for operacional;
- não houver conflito material nem necessidade de `Chairman`.

Pare e consulte quando:

- houver decisão estrutural;
- surgir bifurcação estratégica real;
- faltar dado não derivável;
- surgir risco crítico;
- o próximo passo implicar exposição pública ou mudança estrutural.

Formato mínimo de checkpoint:

- `Estado`
- `Risco`
- `Próxima ação dominante`

## Execução descentralizada assistida por CLI

Use CLI apenas quando existir tarefa delimitada e revisável por `SPEC`.

Pré-condições mínimas:

- `WS` ativo com dono claro
- `SPEC` explícito
- read set mínimo definido
- template aprovado
- envelope de saída revisável

Substratos aceitos:

- execução local humana
- `antigravity-cli`, apenas como fallback explícito quando houver ganho líquido comprovado
- `gemini-cli`, somente se estiver instalado, autenticado e com contrato de uso conhecido

Regra prática:

- execução local humana é o padrão desta fase;
- `antigravity-cli` fica suspenso para os ciclos correntes porque adicionou overhead e dependência de retorno manual;
- use `gemini-cli` apenas como throughput paralelo opcional quando houver contrato operacional conhecido;
- nenhum dos dois substitui `DEC`, conselho seletivo ou `Chairman`.

Fluxo mínimo:

1. liste `SPEC` abertos;
2. rode dispatch em `preview`;
3. só então execute o `SPEC` por CLI;
4. gere o envelope de resposta com `new-specialist-response-template.ps1`;
5. importe a resposta final com `import-specialist-output.ps1`;
6. volte com `REV`, não com conversa solta.

Para cadência recorrente:

- `run-motor-agentico-cron.ps1` registra checkpoints em `.logs` e roda em higiene `read-only` por padrão;
- só despacha `SPEC` CLI abertos quando chamado explicitamente com `-LaunchOpenCliSpecs`, respeitando `-ForceRelaunch`.

## Não fazer

- não tratar toda divergência como decisão estrutural
- não despachar especialista sem dono e sem workstream
- não engessar saída em formulário rígido
- não usar `The Forum` para conversa vaga
- não perguntar ao operador em toda microetapa derivável
