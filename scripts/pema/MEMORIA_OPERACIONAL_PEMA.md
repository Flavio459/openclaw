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
- Primeira camada explícita de domínio central do Collegium materializada na UI.
- `Cortex Command` e `The Forum` agora consomem projeções de domínio além da telemetria de runtime.
- A proveniência atual desse domínio é `fixture_projection`, declarada de forma explícita.
- O snapshot de domínio agora possui uma costura intermediária de persistência local, ainda com fallback para fixture.
- Backend definitivo e telemetria real de `The Pilots` continuam pendentes nesta etapa.

## Componentes Operacionais

- `OpenClaw`: orquestração, sessão de agentes, gateway e superfície de controle.
- `Chairman API`: gate de decisão, leitura de estado e mutação controlada de pendências.
- `MCP do dashboard`: ponte entre frontend e estado real do LAB.
- `Scripts PEMA`: scaffolding, smoke tests, deploy remoto e relatórios.
- `Dashboard`: interface executiva do sistema.
- `Domínio Collegium`: contratos, fixtures e projeções para pilotos, passageiros, mobilidade, rede e deliberação.

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
- O domínio central ainda não possui persistência própria nem integração com eventos reais de mobilidade.
- Projeções `fixture_projection` não podem ser tratadas como telemetria viva nem como ledger definitivo.

## Uso Recomendado

- Consulte este documento para entender o que já existe e como o sistema roda hoje.
- Consulte `CONTEXTO_OPERACIONAL_AGENTES.md` para o enquadramento operacional e arquitetural oficial.
- Consulte `ORIGEM_PEMA_CURADA.md` para verificar coerência de direção.
- Quando houver dúvida entre ferramenta e produto, trate `Stitch` e similares como tooling, não como parte do sistema.
