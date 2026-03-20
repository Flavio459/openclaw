# Collegium Cortex Implantation Status

## Escopo

### Cobre

- Implantacao atual do `Collegium Cortex` dentro de `c:\Pico-Open\openclaw-push`.
- Leitura executiva da frente ativa, dos bloqueios, das decisoes pendentes e das evidencias recentes.
- Separacao entre base `OpenClaw Runtime`, superficies do produto, integracoes PEMA e tooling de LAB.
- Topologia operacional entre `local`, `VPS prod`, `VPS lab` e `PicoClaw`.

### Nao cobre

- O workspace inteiro de `c:\Pico-Open`.
- Roadmap institucional completo do protocolo.
- Planejamento detalhado de sprint ou inventario tecnico exaustivo.

### Distincao

- `OpenClaw Runtime`: engine, gateway, sessoes, pairing, auth, cron, agentes e infraestrutura.
- `Collegium Cortex`: superficies de produto e de leitura executiva usadas para operar, deliberar e supervisionar.
- `Cadencia`: atualizacao por evento + fechamento diario + revisao semanal.

## Estado Atual

- **Branch ativa:** `antigravity-dev`
- **Frente ativa:** consolidacao das superficies do Collegium com guardrails, contexto agentic e leitura executiva local.
- **Contrato agentico:** baseline explicita de mandato, explicabilidade, escalation e `HITL` agora existe no repo.
- **Status geral:** consolidacao ativa com base operacional real no LAB.
- **Acesso rapido Windows:** atalho canonico `Collegium Cortex Center.lnk` no Desktop, abrindo o centro unico de acompanhamento.
- **Topologia local:** gateway canonico local em `127.0.0.1:19000` via launchers Node do `openclaw-push`; gateway Docker legado do workspace antigo foi desativado.
- **Topologia remota:** `prod` + `lab` em Docker Compose na VPS e `PicoClaw` como gateway remoto separado via `systemd`; `prod` opera em `/home/deploy/openclaw-prod` e `lab` em `/home/deploy/openclaw-lab`.
- **Ultimo checkpoint:** `2026-03-11` - superficies Collegium existem, `Chairman API` e dashboard/MCP leem estado real, upgrade do runtime segue congelado ate janela limpa.

## Centro Operacional

### Quero desenvolver e escrever codigo

- **Ambiente:** `local`
- **Fazer aqui:** branch, worktree, implementacao, refactor, testes rapidos, build local e revisao antes de promover qualquer mudanca.
- **Nao fazer aqui:** tratar o runtime local como estado operacional autoritativo ou usar este ambiente como release final.
- **Acesso:** [http://127.0.0.1:19000](http://127.0.0.1:19000)
- **Comando:** `start http://127.0.0.1:19000`
- **Fonte de verdade:** `repo` para codigo; `local` e sandbox de desenvolvimento.
- **Status:** ativo

### Quero registrar decisao e contexto

- **Ambiente:** `vault`
- **Fazer aqui:** `IDEA`, `DEC`, `WS`, `SPEC`, `REV`, checkpoint, memoria operacional e observacoes do Chairman.
- **Nao fazer aqui:** codigo de aplicacao, ajuste manual de runtime ou estado de sessao.
- **Acesso:** `W:\\Collegium Cortex`
- **Comando:** `explorer.exe "W:\\Collegium Cortex"`
- **Fonte de verdade:** `vault` para decisao, rastreabilidade e contexto.
- **Status:** ativo

### Quero validar runtime real

- **Ambiente:** `VPS lab`
- **Fazer aqui:** auth, pairing, sessoes, agentes, cron, smoke real e validacao integradora antes de `prod`.
- **Nao fazer aqui:** experimento solto sem branch, hotfix esquecido fora do repo ou uso do LAB como substituto de `prod`.
- **Acesso:** depois do tunel, [http://127.0.0.1:28789/](http://127.0.0.1:28789/)
- **Comando:** `ssh -N -L 28789:127.0.0.1:28789 openclaw-vps-ts`
- **Preflight:** `pnpm collegium:lab:preflight`
- **Fonte de verdade:** estado operacional de `lab`.
- **Status:** ativo

### Quero operar producao

- **Ambiente:** `VPS prod`
- **Fazer aqui:** release aprovada, smoke pos-release, observabilidade e verificacao final de estabilidade.
- **Nao fazer aqui:** desenvolvimento, descoberta, experimento livre ou correcao que nao volte para o repo.
- **Acesso:** depois do tunel, [http://127.0.0.1:18789/](http://127.0.0.1:18789/)
- **Comando:** `ssh -N -L 18789:127.0.0.1:18789 openclaw-vps-ts`
- **Fonte de verdade:** estado operacional de `prod`.
- **Status:** ativo

### Quero diagnosticar PicoClaw

- **Ambiente:** `PicoClaw remoto`
- **Fazer aqui:** troubleshooting do gateway `picoclaw`, incidente proprio e verificacao do servico remoto separado.
- **Nao fazer aqui:** assumir que restart de `prod` ou `lab` cobre automaticamente este servico.
- **Acesso:** via `openclaw-vps-ts`; servico `systemd` separado na VPS.
- **Comando:** `ssh openclaw-vps-ts`
- **Fonte de verdade:** servico remoto `picoclaw-gateway.service`.
- **Status:** separado

## Agora

- Consolidando uma camada executiva local para acompanhar a implantacao sem depender do chat.
- `Cortex Command`, `The Forum` e `Cortex Praetorium` ja existem na UI e precisam de uma leitura operacional mais curta.
- `Chairman API`, handoff com `HMAC + TTL` e `cluster_write_guard` sustentam o LAB.
- O runtime local permanece em `2026.2.6-3` por decisao deliberada de risco.
- A ambiguidade local entre o container Docker legado e o runtime canonico do repo atual foi removida; `19000` agora pertence ao `openclaw-push`.
- A politica operacional agora esta formalizada: codigo nasce no local, validacao real de runtime fecha em `VPS lab` e `prod` fica restrito a operacao estavel.
- A VPS nao e um bloco unico: hoje ela abriga `prod`, `lab` e `picoclaw`, cada um com ciclo de mudanca e diagnostico proprio.
- `prod` e `lab` agora usam checkouts remotos dedicados na VPS, reduzindo drift entre validacao e release.
- A higiene recorrente do motor agora roda em modo `read-only` por padrao; despacho CLI exige opt-in explicito.
- O gate operacional de `lab` agora tem um preflight curto e `read-only`, com `health`, tunel local e `Control UI` em um unico comando.
- O gate operacional de `prod` agora tem o preflight espelhado em modo `read-only`, pronto para entrar na promocao canônica.
- O pacote Collegium agora tem verificacao local unica via `pnpm collegium:verify`, incluindo evals deterministicas de governanca agentica.
- `The Forum` agora renderiza uma sala deliberativa com `DecisionTrace`, evidencias, opcao recomendada e `chairmanAction` explicita.
- `RuntimeSignals` agora concentram continuidade de runtime, pressao de autoridade, cadencia de automacao, continuidade de sessao e ambiguidade estrategica.
- `The Cockpit` agora existe como contrato, arquitetura e preview interno separados de `Cortex Praetorium`, sem abrir build amplo do produto do piloto nesta fase.
- Outro chat no mesmo workspace agora esta explicitamente enquadrado: so pode operar como frente
  deliberativa `read-only` de `IDEA` ou `pré-DEC`, nunca como segunda frente motora.
- O foco imediato e reduzir ambiguidade entre produto, bastidor tecnico e tooling de desenvolvimento.

## Proxima Acao Dominante

Usar este painel como checkpoint unico da implantacao do Collegium, manter a higiene recorrente em `read-only` e promover qualquer mudanca de runtime pelo trilho `local -> VPS lab -> VPS prod`.

## Top 3 da Semana

1. Consolidar a leitura executiva diaria da implantacao do Collegium.
2. Reduzir dependencia de snapshots intermediarios nas superficies de produto.
3. Preparar a janela limpa que permitira abrir a trilha isolada de upgrade para `2026.3.8`.

## Bloqueios

### B1. Sala deliberativa menos madura do que o restante do fluxo

- **Efeito:** `The Forum` ainda nao entrega o mesmo grau de consolidacao que `Cortex Praetorium`.
- **Dependencia:** amadurecer caso, evidencia, opcao recomendada e trilha de autoridade.
- **Decisao humana:** nao

### B2. Upgrade do runtime congelado ate checkpoint limpo

- **Efeito:** novas capacidades do OpenClaw ficam fora da implantacao atual.
- **Dependencia:** PR atual mergeada, worktree limpo, LAB sem mudanca estrutural concorrente e preflight de auth/config concluido.
- **Decisao humana:** sim

### B3. Parte do dominio ainda aparece por snapshot intermediario

- **Efeito:** `Cortex Command` e `The Forum` ainda misturam leitura real com consolidacao parcial de dominio.
- **Dependencia:** ligar fontes de dominio mais diretas e preservar auditoria da camada protocolar.
- **Decisao humana:** nao

## Decisoes Pendentes

### D1. Quando abrir a trilha isolada de upgrade para `2026.3.8`

- **Impacto:** mexe em auth, pairing, `Control UI`, contexto e runtime.
- **Urgencia:** media
- **Dono:** Chairman + lider de desenvolvimento

### D2. O que vem primeiro entre amadurecer `The Forum` e aprofundar fonte real de dominio

- **Impacto:** define se a proxima fase fortalece deliberacao ou reduz intermediacao tecnica nas superficies.
- **Urgencia:** alta
- **Dono:** lider de desenvolvimento

### D3. Qual o checkpoint que marca saida do modo consolidacao

- **Impacto:** libera nova janela de runtime, reduz ambiguidade operacional e muda o ritual de acompanhamento.
- **Urgencia:** media
- **Dono:** Chairman

## Superficies do Produto

| superficie        | status  | usa dado real? | dependencia                                | maturidade                                     |
| ----------------- | ------- | -------------- | ------------------------------------------ | ---------------------------------------------- |
| Cortex Command    | parcial | parcial        | snapshot do dominio + estado do LAB        | leitura executiva em consolidacao              |
| The Forum         | parcial | parcial        | fila de autoridade + eventos estrategicos  | deliberacao funcional, sala ainda menos madura |
| Cortex Praetorium | ativo   | sim            | runtime OpenClaw + event log + fila + cron | cockpit tecnico mais consolidado               |

## Componentes de Implantacao

| componente                      | tipo       | status       | fonte                                                                            | next_step                                            |
| ------------------------------- | ---------- | ------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| OpenClaw Runtime                | base       | ativo        | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/overview.ts`                 | manter congelado ate checkpoint limpo                |
| Cortex Command                  | produto    | parcial      | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/overview.ts`                 | separar melhor leitura executiva de sinais tecnicos  |
| The Forum                       | produto    | parcial      | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/forum.ts`                    | amadurecer casos, evidencias e decisao recomendada   |
| Cortex Praetorium               | produto    | ativo        | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/praetorium.ts`               | manter como cockpit de supervisao e prova tecnica    |
| RuntimeSignals                  | integracao | ativo        | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/collegium/runtime-signals.ts`      | reduzir composicao ad hoc nas superficies executivas |
| The Cockpit                     | produto    | experimental | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/cockpit-preview.ts`          | manter preview interno antes de binding operacional  |
| Chairman API                    | integracao | ativo        | `file:///C:/Pico-Open/openclaw-push/scripts/pema/MEMORIA_OPERACIONAL_PEMA.md`    | preservar gate de decisao e leitura de pendencias    |
| Dashboard MCP                   | integracao | ativo        | `file:///C:/Pico-Open/openclaw-push/scripts/pema/README.stitch-mcp-dashboard.md` | manter leitura via `/state` e evitar mocks           |
| Handoff wrappers com HMAC + TTL | integracao | ativo        | `file:///C:/Pico-Open/openclaw-push/scripts/pema/MEMORIA_OPERACIONAL_PEMA.md`    | manter rastreabilidade entre agentes                 |
| cluster_write_guard             | integracao | ativo        | `file:///C:/Pico-Open/openclaw-push/scripts/pema/MEMORIA_OPERACIONAL_PEMA.md`    | sustentar separacao de escrita entre areas           |
| Stitch                          | lab        | experimental | `file:///C:/Pico-Open/openclaw-push/scripts/pema/README.stitch-mcp-dashboard.md` | manter como tooling de layout, nao como arquitetura  |
| Praetorium local monitor        | lab        | experimental | `file:///C:/Pico-Open/openclaw-push/scripts/pema/praetorium-local-monitor.html`  | absorver aprendizados na camada executiva local      |
| Snapshot de dominio inicial     | provisorio | parcial      | `file:///C:/Pico-Open/openclaw-push/ui/src/ui/collegium.ts`                      | substituir por fontes mais diretas e auditaveis      |

## Riscos Atuais

### R1. Mistura entre consolidacao do Collegium e evolucao do runtime OpenClaw

- **Efeito:** mascara causalidade e aumenta risco de regressao em auth, pairing e control UI.
- **Mitigacao:** manter upgrade isolado para outra janela e separar claramente produto, integracao e engine.

### R2. Tratar tooling de LAB como se fosse produto

- **Efeito:** gera leitura errada da implantacao e empurra decisoes estruturais para ferramentas temporarias.
- **Mitigacao:** marcar `Stitch` e monitores locais como `lab` ou `experimental` em toda leitura executiva.

### R3. Deixar observacoes e decisoes morrerem no chat

- **Efeito:** perda de contexto, repeticao de alinhamento e baixa rastreabilidade para a IA lider.
- **Mitigacao:** registrar observacoes neste documento e exigir resposta operacional da IA lider no proprio artefato.

## Ultimas Evidencias

- [WORKFLOW.md](file:///C:/Pico-Open/openclaw-push/WORKFLOW.md)
- [runtime-topology-policy.md](file:///C:/Pico-Open/openclaw-push/docs/runtime-topology-policy.md)
- [runtime-adoption-checklist.md](file:///C:/Pico-Open/openclaw-push/docs/runtime-adoption-checklist.md)
- [collegium-agentic-operating-contract.md](file:///C:/Pico-Open/openclaw-push/docs/collegium-agentic-operating-contract.md)
- [cockpit.architecture.md](file:///C:/Pico-Open/openclaw-push/docs/cockpit.architecture.md)
- [cockpit-preview.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/cockpit-preview.ts)
- [preflight_collegium_lab.ps1](file:///C:/Pico-Open/openclaw-push/scripts/preflight_collegium_lab.ps1)
- [preflight_collegium_prod.ps1](file:///C:/Pico-Open/openclaw-push/scripts/preflight_collegium_prod.ps1)
- [gateway.cmd](file:///C:/Users/flavi/.openclaw/gateway.cmd)
- [node.cmd](file:///C:/Users/flavi/.openclaw/node.cmd)
- [openclaw.json](file:///C:/Users/flavi/.openclaw/openclaw.json)
- [openclaw-2026-03-12.log](file:///C:/tmp/openclaw/openclaw-2026-03-12.log)
- [CONTEXTO_OPERACIONAL_AGENTES.md](file:///C:/Pico-Open/openclaw-push/scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md)
- [MEMORIA_OPERACIONAL_PEMA.md](file:///C:/Pico-Open/openclaw-push/scripts/pema/MEMORIA_OPERACIONAL_PEMA.md)
- [GUIA_FLUXOS_DE_TRABALHO_COLLEGIUM.md](file:///C:/Pico-Open/openclaw-push/scripts/pema/GUIA_FLUXOS_DE_TRABALHO_COLLEGIUM.md)
- [ADR-OPENCLAW-UPGRADE-WINDOW-2026-03.md](file:///C:/Pico-Open/openclaw-push/scripts/pema/ADR-OPENCLAW-UPGRADE-WINDOW-2026-03.md)
- [collegium.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/collegium.ts)
- [agentic-governance.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/collegium/agentic-governance.ts)
- [runtime-signals.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/collegium/runtime-signals.ts)
- [forum.adapter.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/collegium/forum.adapter.ts)
- [forum.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/forum.ts)
- [praetorium.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/praetorium.ts)
- [overview.ts](file:///C:/Pico-Open/openclaw-push/ui/src/ui/views/overview.ts)

## Observacoes do Chairman

### OBS-2026-03-11-01

- **Data:** 2026-03-11
- **Tipo:** direcao
- **Texto:** manter a leitura executiva focada na implantacao do Collegium dentro de `openclaw-push`, sem diluir a leitura no workspace inteiro.
- **Impacto esperado:** separar claramente base OpenClaw, produto Collegium, integracoes PEMA e tooling de LAB.
- **Status:** em_acao

#### Resposta da IA Lider

- **Leitura:** a observacao corrige o enquadramento e elimina a ambiguidade entre workspace, engine e produto.
- **Impacto:** reorganiza o acompanhamento em torno da implantacao real, da branch viva e das superficies oficiais.
- **Acao adotada:** documento e HTML passaram a classificar cada componente por tipo, status, dependencia e proximo passo.
- **Precisa decisao humana:** nao

### OBS-2026-03-11-02

- **Data:** 2026-03-11
- **Tipo:** direcao
- **Texto:** quando for adequado, cogitar a separacao explicita entre `workspace`, base `OpenClaw`, operacao `local` e runtime `VPS`.
- **Impacto esperado:** reduzir drift entre ambientes, diminuir ambiguidade operacional e preparar uma topologia canonica entre laboratorio local e host remoto.
- **Status:** em_acao

#### Resposta da IA Lider

- **Leitura:** a observacao reforca uma separacao que ja apareceu no troubleshooting do LAB e evita colapsar codigo, estado, runtime e ambiente de validacao no mesmo plano.
- **Impacto:** melhora diagnostico, reduz risco de configuracao cruzada e ajuda a decidir quando o runtime canonico deve ficar remoto enquanto o local permanece como laboratorio.
- **Acao adotada:** melhoria registrada neste artefato como diretriz operacional para proximas mudancas de runtime, onboarding e manutencao.
- **Precisa decisao humana:** nao

### OBS-2026-03-11-03

- **Data:** 2026-03-11
- **Tipo:** correcao
- **Texto:** na `VPS`, considerar explicitamente tres trilhas remotas distintas: `prod`, `lab` e `picoclaw`.
- **Impacto esperado:** evitar leitura simplificada do host remoto como um unico ambiente e melhorar roteamento de diagnostico, mudanca e validacao.
- **Status:** em_acao

#### Resposta da IA Lider

- **Leitura:** essa informacao corrige a topologia operacional da VPS e impede que `prod`, `lab` e `picoclaw` sejam tratados como variacoes menores do mesmo runtime.
- **Impacto:** melhora a precisao de troubleshooting, reduz risco de aplicar ajuste no alvo errado e reforca a necessidade de documentar o papel de cada trilha remota antes de upgrades ou mudancas estruturais.
- **Acao adotada:** observacao registrada neste artefato como regra de contexto para as proximas intervencoes no runtime remoto.
- **Precisa decisao humana:** nao

### OBS-2026-03-11-04

- **Data:** 2026-03-11
- **Tipo:** correcao
- **Texto:** `picoclaw` nao esta acoplado ao mesmo runtime Docker do OpenClaw na VPS; ele roda como servico `systemd` separado.
- **Impacto esperado:** impedir que manutencao de `prod` ou `lab` seja tratada como se cobrisse automaticamente o gateway `picoclaw`.
- **Status:** em_acao

#### Resposta da IA Lider

- **Leitura:** a verificacao da VPS confirmou `picoclaw-gateway.service` ativo em paralelo ao stack Docker do OpenClaw.
- **Impacto:** reforca que a topologia remota tem pelo menos dois mecanismos de runtime na mesma VPS: Docker Compose para `prod/lab` e `systemd` para `picoclaw`.
- **Acao adotada:** estado remoto consolidado neste artefato para orientar futuras janelas de upgrade, restart e troubleshooting.
- **Precisa decisao humana:** nao

### OBS-2026-03-12-01

- **Data:** 2026-03-12
- **Tipo:** correcao
- **Texto:** o gateway canonico local agora deve ser tratado como o runtime direto do `openclaw-push` em `127.0.0.1:19000`; o container Docker legado montado sobre `W:\\workspaces antigravity\\OpenClaw` foi desativado para eliminar ambiguidade local.
- **Impacto esperado:** fixar uma unica referencia local de runtime, reduzir drift entre repo atual e workspace antigo e impedir diagnostico enganoso na porta `19000`.
- **Status:** em_acao

#### Resposta da IA Lider

- **Leitura:** a ambiguidade local era real porque a porta `19000` ainda estava publicada por um container legado enquanto os launchers ja precisavam apontar para `C:\\Pico-Open\\openclaw-push`.
- **Impacto:** onboarding, troubleshooting e validacao local passam a ler o repo atual como unica base canonica, sem colisao com o workspace antigo.
- **Acao adotada:** Node local atualizado, `pnpm install --force` executado no repo atual, `gateway.cmd` e `node.cmd` reapontados para `openclaw-push`, container legado parado com `restart=no` e gateway validado com `health=200` em `127.0.0.1:19000`.
- **Precisa decisao humana:** nao

#### Modelo para nova observacao

- **Data:** AAAA-MM-DD
- **Tipo:** correcao | duvida | direcao | veto | prioridade
- **Texto:** registrar a observacao em uma frase curta e objetiva.
- **Impacto esperado:** descrever a mudanca esperada no produto, na leitura ou na execucao.
- **Status:** nova

#### Protocolo de resposta da IA lider

1. Ler observacoes com status `nova` ou `lida` no inicio de cada ciclo.
2. Classificar impacto e transformar a observacao em ajuste direto, item operacional, decisao pendente, pesquisa adicional ou rejeicao justificada.
3. Responder no proprio documento com `Leitura`, `Impacto`, `Acao adotada` e `Precisa decisao humana`.
4. Regenerar o HTML ao final do ciclo relevante para refletir a nova leitura.
