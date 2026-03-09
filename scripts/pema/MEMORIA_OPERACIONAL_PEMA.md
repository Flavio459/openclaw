# Memoria Operacional PEMA

Documento de operação atual do projeto. Esta camada descreve como o PEMA está sendo implementado, validado e evoluído no ambiente real. Não define identidade; define execução.

Documento complementar:

- use [CONTEXTO_OPERACIONAL_AGENTES.md](./CONTEXTO_OPERACIONAL_AGENTES.md) como enquadramento operacional oficial;
- use este arquivo para o retrato resumido do que já existe e como o sistema roda hoje.

## Escopo

- `PEMA` e `OpenClaw` compõem o sistema operacional do projeto.
- O dashboard faz parte do produto como superfície de observação e decisão.
- Ferramentas como `Stitch` entram apenas como apoio de desenvolvimento visual e prototipação de layout.

## Estado Atual

- Ambiente LAB funcional com agentes separados no OpenClaw.
- Agentes ativos visíveis no LAB: `main`, `ceo`, `cfo`, `legal`, `ped`.
- `Chairman API` operacional com autenticação por Bearer token.
- `Handoff` entre agentes endurecido com wrappers dedicados e `HMAC + TTL`.
- `cluster_write_guard` em uso para conter escrita indevida entre áreas.
- Dashboard/MCP consumindo estado real por `/state`, sem depender de mock.

## Componentes Operacionais

- `OpenClaw`: orquestração, sessão de agentes, gateway e superfície de controle.
- `Chairman API`: gate de decisão, leitura de estado e mutação controlada de pendências.
- `MCP do dashboard`: ponte entre frontend e estado real do LAB.
- `Scripts PEMA`: scaffolding, smoke tests, deploy remoto e relatórios.
- `Dashboard`: interface executiva do sistema.

## Tooling de Desenvolvimento

- `Stitch`: desenho de layout e exploração visual do dashboard.
- `Playwright`: validação e inspeção de UI no navegador.
- `Shell/PowerShell`: deploy, túnel, smoke test e manutenção operacional.
- `Node/Python/Bash`: implementação dos utilitários e serviços auxiliares.

## Regras de Separação

- Ferramenta de desenvolvimento não vira pilar de arquitetura por conveniência.
- Layout não define governança.
- Protótipo visual não substitui fluxo real, autenticação, estado nem auditoria.
- O dashboard só é considerado válido quando conectado a dados reais.

## Riscos Operacionais Atuais

- A sala de reuniões ainda está menos madura do que o restante do fluxo.
- A memória de origem ainda precisa continuar sendo consultada sem contaminar a execução diária.
- Qualquer expansão visual precisa preservar o papel do `Chairman`, dos agentes e das trilhas de auditoria.
- O upgrade do runtime OpenClaw foi deliberadamente postergado para um checkpoint limpo; ver [ADR-OPENCLAW-UPGRADE-WINDOW-2026-03.md](./ADR-OPENCLAW-UPGRADE-WINDOW-2026-03.md).

## Uso Recomendado

- Consulte este documento para entender o que já existe e como o sistema roda hoje.
- Consulte `CONTEXTO_OPERACIONAL_AGENTES.md` para o enquadramento operacional e arquitetural oficial.
- Consulte `ORIGEM_PEMA_CURADA.md` para verificar coerência de direção.
- Quando houver dúvida entre ferramenta e produto, trate `Stitch` e similares como tooling, não como parte do sistema.
- Consulte [ADR-OPENCLAW-UPGRADE-WINDOW-2026-03.md](./ADR-OPENCLAW-UPGRADE-WINDOW-2026-03.md) antes de abrir qualquer frente de atualização do runtime.
