# Origem PEMA Curada

Documento curto de memória de origem do projeto. Esta curadoria foi extraída de material preliminar do Gemini e reduzida a princípios, hipóteses e lacunas verificáveis. Não é um transcript bruto.

Documento complementar:

- use [CONTEXTO_OPERACIONAL_AGENTES.md](./CONTEXTO_OPERACIONAL_AGENTES.md) como referência principal de enquadramento operacional;
- use este arquivo para memória curta de origem, intenção e direção.

## Essência

- O PEMA não nasce como "um chat com agentes". Ele nasce como um sistema de governança operacional.
- O OpenClaw ocupa o papel de orquestrador e "Secretário do Board", não apenas de interface.
- O núcleo da proposta é multiagente com papéis distintos: `Chairman`, `CEO`, `CFO`, `Legal` e `PED`.
- O projeto precisa manter identidade flexível: evolui durante a construção, mas sem perder o núcleo de governança.
- O risco central desde a origem é produzir uma casca técnica sem alma operacional, com interface bonita e regras fracas.

## Invariantes

- Decisões críticas precisam passar por Human-in-the-Loop do `Chairman`.
- Handoffs entre agentes precisam ser explícitos, auditáveis e difíceis de falsificar.
- Cada cluster funcional precisa ter limites reais de escrita e atuação.
- O estado operacional precisa ser visível no dashboard a partir de dados reais, não mockados.
- Os agentes precisam ter identidade clara de papel, responsabilidade e permissão.
- A "Sala de Reuniões" é parte do produto: deliberação entre C-levels antes da decisão final.

## Hipóteses Evolutivas

- O OpenClaw pode evoluir de orquestrador manual para "Secretário do Board" mais autônomo, reagindo a mudanças no fluxo.
- A sala de reuniões pode sair de uma representação estrutural para uma experiência visual e colaborativa mais forte.
- O dashboard pode se tornar a superfície principal de decisão do `Chairman`, desde que continue acoplado ao estado real.
- A memória de origem deve continuar separada da camada operacional para evitar que ideias preliminares contaminem a execução diária.

## Relação Com a Implementação Atual

- `HITL` do `Chairman`: implementado e endurecido via API autenticada.
- `Handoff` auditável: implementado com wrappers por agente e assinatura `HMAC + TTL`.
- `Guardas de cluster`: implementados para restringir escrita indevida.
- `State sync`: implementado com consumo de `/state` no MCP e no dashboard.
- `Identidade dos agentes`: já visível no LAB com agentes separados no OpenClaw.
- `Sala de Reuniões`: parcialmente materializada; ainda é uma frente de evolução.

## Lacunas Ainda Abertas

- Consolidar a camada de origem como insumo de longo prazo sem torná-la fonte operacional automática.
- Evoluir a sala de reuniões para um fluxo visual e deliberativo mais forte.
- Preservar coerência entre identidade dos agentes, dashboard e governança conforme o sistema crescer.
- Evitar regressão para automação rasa: qualquer expansão deve reforçar governança, rastreabilidade e papel do `Chairman`.

## Regra de Uso

- Use este documento para orientar direção, identidade e critérios de coerência.
- Não use este documento como fonte única de requisitos de implementação.
- Para decisões de modelagem, nomenclatura e implementação corrente, priorize `CONTEXTO_OPERACIONAL_AGENTES.md`.
- Quando houver conflito entre origem e operação atual, o conflito deve ser resolvido explicitamente, não implicitamente.
- Ferramentas de desenvolvimento visual, como `Stitch`, não fazem parte da identidade do PEMA; entram apenas como apoio de layout e frontend.
