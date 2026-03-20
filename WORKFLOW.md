# WORKFLOW

Fluxo operacional de desenvolvimento para `Collegium Cortex` em `openclaw-push`.

Este documento é inspirado na disciplina do Symphony, mas **não depende de Symphony, Elixir, Linear ou API ativa**.
Ele existe para orientar execução com clareza, isolamento mental e verificação antes de continuar.

## 0. Regra-mãe

Antes de implementar qualquer coisa, responder internamente:

1. isto é `produto`, `estratégia`, `bastidor` ou `runtime`?
2. isto muda `visão`, `regra`, `decisão` ou `interface`?
3. isto afeta `governança`, `reputação`, `economia`, `segurança` ou `auditabilidade`?
4. isto já está claro o suficiente para implementação, ou ainda é fase de entendimento?

Se a resposta para a última pergunta for “ainda é fase de entendimento”, **não implementar**.

---

## Fonte de verdade documental

A referência central de visão do projeto fica no Obsidian, em `W:\Collegium Cortex`.

Regra de bloqueio:

- se a tarefa pedir status geral do projeto, leitura estratégica, avaliação arquitetural, priorização, revisão de superfícies, ou qualquer julgamento sobre `Collegium Cortex`, `CNP`, `Cortex Command`, `The Forum`, `Cortex Praetorium` ou `OpenClaw Runtime`, não responder a partir do repo sozinho;
- antes de qualquer resposta material, ler obrigatoriamente:
  1. `ESTATUTO CNP - O Protocolo e a Matemática do SPV`;
  2. `Collegium Cortex - Documento Mestre (Revisão Zero)`;
  3. `Fonte de Verdade do Collegium Cortex`;
  4. a nota `Roteamento - ...` dominante do tema.
- se isso ainda não tiver sido lido, o agente deve parar e declarar que a leitura canônica é pré-condição.

Hierarquia obrigatória:

1. `ESTATUTO CNP - O Protocolo e a Matemática do SPV`;
2. `Collegium Cortex - Documento Mestre (Revisão Zero)`;
3. documentos satélites de apoio.

Se houver conflito entre documentos satélites e o CNP:

- explicitar o conflito;
- decidir qual formulação faz mais sentido;
- atualizar o restante da documentação;
- não deixar interpretações concorrentes coexistindo implicitamente.

## 1. Roteamento documental obrigatório

Antes de abrir trabalho relevante:

1. escolha a trilha correspondente no vault `W:\Collegium Cortex`;
2. leia apenas o `read set` mínimo da nota `Roteamento - ...`;
3. no repo, abra `docs/context-routing/README.md` e o arquivo-ponte do tema;
4. só então navegue para os paths técnicos listados.

Trilhas disponíveis no vault:

- `Roteamento - Governança e Mandatos`
- `Roteamento - Economia do Protocolo`
- `Roteamento - Fluxos Operacionais`
- `Roteamento - Dados, Memória e Auditoria`
- `Roteamento - Agentes e Deliberação`
- `Roteamento - Produto, UI e Superfícies`
- `Roteamento - Repo e Implementação`

Arquivos-ponte no repo:

- `docs/context-routing/README.md`
- `docs/context-routing/governanca.md`
- `docs/context-routing/agentes-deliberacao.md`
- `docs/context-routing/economia-protocolo.md`
- `docs/context-routing/fluxos-operacionais.md`
- `docs/context-routing/dados-memoria-auditoria.md`
- `docs/context-routing/produto-superficies.md`

Regras:

- não reler o vault inteiro por padrão;
- não usar `scripts/pema/*` como leitura universal; abrir só o que a trilha mandar;
- se a tarefa cruzar temas, começar pela trilha dominante e consultar as demais apenas se houver impacto real.
- para `status geral do projeto`, a trilha dominante padrão é `Roteamento - Produto, UI e Superfícies`, seguida da leitura de `Visão do Projeto`.

---

## 2. Superfícies oficiais

Toda demanda deve ser classificada em uma destas superfícies:

### `Cortex Command`

Superfície principal do produto.

Use quando o foco for:

- operação da companhia
- leitura executiva
- pilotos, passageiros, mobilidade, produção, redes
- sinais do domínio

### `The Forum`

Superfície de deliberação estratégica.

Use quando o foco for:

- caso institucional
- risco
- decisão
- evidência
- comparação de caminhos
- atuação do `Chairman`

### `Cortex Praetorium`

Cockpit de desenvolvimento e bastidor.

Use quando o foco for:

- runtime
- agentes
- timeline
- bloqueios
- evidências técnicas
- snapshot intermediário do domínio

### `OpenClaw Runtime`

Camada de engine e execução técnica.

Use quando o foco for:

- gateway
- sessões
- pairing
- infraestrutura
- integração MCP/API
- agentes e runtime

**Regra:** não misturar superfície de produto com superfície de bastidor no mesmo objetivo.

---

## 3A. Decisão relevante

Quando surgir uma decisão relevante:

1. identificar a trilha dominante no vault;
2. ler apenas o read set mínimo;
3. consultar `Prompt do Agente de Decisão do Collegium Cortex`;
4. registrar o caso em `Fila de Decisões do Collegium Cortex` com `scripts/pema/register-decision-case.ps1` se a decisão deslocar prioridade, interpretação, escopo ou governança;
5. monitorar casos em aberto com `scripts/pema/list-open-decisions.ps1`;
6. escalar ao `Chairman` se o caso for estrutural ou sensível.

Não usar loop temporal como substituto de julgamento.
Loop só faz sentido depois, para monitorar fila ou estado, nunca como mecanismo primário de decisão.

---

## 3B. Trabalho agentico normal

Quando a necessidade for de construção, exploração, produção, revisão ou coordenação contínua dentro de mandato:

1. decidir se o caso é `workstream`, não `DEC`;
2. abrir ou localizar o `workstream` correspondente no vault;
3. despachar especialista se o problema exigir foco delimitado;
4. revisar a saída recebida;
5. só subir para `DEC`, `pré-conselho` ou `Chairman` se houver impacto estrutural, cruzado ou sensível.

Estruturas canônicas:

- `WS` = frente viva de trabalho
- `SPEC` = despacho de especialista
- `REV` = revisão e fechamento
- `DEC` = decisão relevante
- `IDEA` = intake obrigatório antes de virar `SPEC` ou `DEC`

### 3B.1. Dois trilhos sincronizados

O fluxo operacional passa a ser explicitamente dividido em:

- `Trilho Aplicação`
  - `scope`: `product + research`
  - `surface`: `Cortex Command` + `The Forum`
  - função: hipóteses, superfícies, fluxos, semântica, requisitos e priorização
- `Trilho Motor`
  - `scope`: `engine + infra`
  - `surface`: `OpenClaw Runtime` + `Cortex Praetorium`
  - função: runtime, agentes, worktrees, scripts, VPS dev, testes, integração e merge
- `Trilho de Sincronismo`
  - função: decidir quando algo da aplicação vira `SPEC` técnica e quando o motor devolve a questão para `DEC`, `WS` ou revisão estratégica

Regras operacionais:

- toda demanda nova entra como `IDEA`, nunca direto como branch;
- `Trilho Aplicação` não abre branch; ele prepara `WS`, `DEC` ou `SPEC` funcional;
- `Trilho Motor` só recebe trabalho ligado a `WS`, `SPEC` ou `DEC`;
- toda passagem de um trilho para outro precisa preservar `Estado`, `Risco`, `Próxima ação dominante` e `Próximo responsável`.
- outro chat no mesmo workspace só pode existir como frente deliberativa `read-only` enquanto o
  assunto ainda for `IDEA` ou `pré-DEC`;
- se o assunto virar implementação, ele sai desse formato e ganha frente própria no
  `Trilho Motor`.

Formato mínimo de `IDEA`:

- `ID`: `IDEA-YYYYMMDD-NN`
- `Estado`: `inbox | triaged | promoted | parked | rejected`
- `Track`: `application | motor | hybrid`
- `Surface alvo`
- `Descrição curta`
- `Impacta WS atual?`
- `Próxima ação dominante`

### 3B.2. Política de topologia operacional

A política oficial de ambiente fica em [docs/runtime-topology-policy.md](docs/runtime-topology-policy.md).
Checklist operacional: [docs/runtime-adoption-checklist.md](docs/runtime-adoption-checklist.md).

Resumo obrigatório:

- `local-first` para código
- `VPS lab-first` para runtime e validação integradora
- `VPS prod-only` para operação estável

Regra prática:

- `Trilho Aplicação` pode amadurecer localmente;
- `Trilho Motor` pode implementar localmente, mas não fecha mudanças de runtime sem validação em `lab`;
- `prod` nunca vira ambiente de descoberta.

---

## 3C. Política de autonomia progressiva

Dentro de um `workstream` ativo, o sistema deve continuar sozinho quando:

1. existe dono claro da frente;
2. existe `SPEC` atual ou próximo `SPEC` derivável;
3. o próximo passo não altera constituição nem regra estrutural;
4. o risco dominante é operacional, não soberano;
5. o read set mínimo já existe ou é derivável;
6. não existe conflito real entre caminhos estratégicos de peso semelhante.

Se essas condições forem verdadeiras, a regra é:

- não perguntar;
- executar o ciclo;
- registrar entrega;
- registrar `REV`;
- atualizar `WS`;
- abrir o próximo `SPEC`;
- informar `Estado`, `Risco` e `Próxima ação dominante`.

O sistema só deve parar quando houver:

- decisão estrutural;
- bifurcação estratégica real;
- falta de dado não derivável;
- risco institucional, econômico, regulatório ou reputacional relevante;
- necessidade de `Chairman`.

---

## 3D. Envelopes de saída

Nenhuma saída relevante deve terminar em conversa vaga.

Toda saída precisa responder explicitamente:

1. o que foi tentado;
2. o que foi produzido ou descoberto;
3. qual é o estado atual;
4. qual é o principal risco ou limite;
5. qual é a próxima ação dominante;
6. quem é o próximo responsável.

Tipos canônicos de saída aceitos:

- `artefato`
- `proposta`
- `revisão`
- `bloqueio`
- `escalonamento`
- `aprendizado`
- `oportunidade`

O formato do corpo é livre. Esses invariantes não são.

Formato mínimo de atualização sem interrupção:

- `Estado`
- `Risco`
- `Próxima ação dominante`

## 3E. Execução descentralizada assistida por CLI

Tarefas delimitadas podem usar CLI como substrato auxiliar quando houver ganho real de paralelismo sem perda de governança.

Pré-condições:

1. existe `WS` ativo com dono claro;
2. existe `SPEC` explícito;
3. o read set mínimo está definido;
4. o template do especialista é aprovado;
5. as skills obrigatórias estão nomeadas quando o substrato depender delas;
6. a saída continua revisável por `REV`.

Substratos aceitos nesta fase:

- execução local humana
- `antigravity-cli`, apenas como fallback explícito quando houver ganho líquido comprovado
- `gemini-cli`, apenas quando instalado, autenticado e com contrato operacional conhecido
- `codex-cli`, quando o `SPEC` já estiver no `Trilho Motor` ou quando a revisão pedir execução técnica delimitada

Regra prática:

- execução local humana é o padrão desta fase;
- `Antigravity` fica suspenso para os ciclos correntes porque introduziu overhead e dependência de retorno manual;
- `Gemini CLI` entra como auxiliar opcional de throughput, nunca como atalho de governança;
- `Codex CLI` entra como executor técnico delimitado, nunca como inbox de ideias nem orquestrador estratégico;
- cron ou cadência temporal podem monitorar `DEC`, `WS` e `SPEC`, mas não substituem julgamento.

Usos aceitáveis:

- pesquisa estruturada;
- escrita estratégica delimitada;
- organização de hipótese, dores, substitutos e jornadas;
- preparação de artefatos internos revisáveis.

Scripts de apoio no repo:

- `scripts/pema/list-open-ideas.ps1`
- `scripts/pema/promote-idea.ps1`
- `scripts/pema/list-open-specialist-dispatches.ps1`
- `scripts/pema/dispatch-open-cli-specs.ps1`
- `scripts/pema/run-motor-agentico-checkpoint.ps1`
- `scripts/pema/run-motor-agentico-cron.ps1`
- `scripts/pema/new-specialist-response-template.ps1`
- `scripts/pema/import-specialist-output.ps1`

Regra operacional:

- use `list-open-ideas.ps1` para manter o intake separado do backlog de execução;
- use `promote-idea.ps1` para transformar `IDEA` em `SPEC` ou `DEC` sem perder rastreabilidade;
- use `dispatch-open-cli-specs.ps1 -Mode preview` antes de qualquer execução real;
- use `run-motor-agentico-checkpoint.ps1` para enxergar `DEC`, `WS` e `SPEC` na mesma cadência;
- use `run-motor-agentico-cron.ps1` para cadência recorrente com snapshot em `.logs`; o modo padrão agora é higiene `read-only`, e o despacho de `SPEC` CLI só acontece com `-LaunchOpenCliSpecs`;
- use `new-specialist-response-template.ps1` para gerar o envelope Markdown de resposta do especialista antes de consolidar a entrega;
- use `import-specialist-output.ps1` para transformar a resposta final em `Entrega` + `REV` e fechar o `SPEC` canônico;
- só execute `SPEC` por CLI quando o despacho já estiver canônico no vault.

Usos proibidos:

- decisão estrutural soberana;
- mudança do `CNP`, de mandatos ou de política institucional;
- publicação pública irreversível;
- mudança econômica, regulatória ou reputacional sem gate apropriado.

---

## 3F. Skills operacionais desta fase

As seguintes skills passam a orientar o desenvolvimento do motor e dos scripts do Collegium nesta fase `local-first`:

- `ai-agents-architect`: tratar o motor como ciclo `plan-and-execute` com replanejamento controlado, limites de iteração e registro explícito de ferramentas.
- `autonomous-agent-patterns`: reforçar permissionamento, checkpoint/resume e fronteiras `HITL` no fluxo `WS -> SPEC -> Entrega -> REV`.
- `agent-tool-builder`: evoluir `scripts/pema/*.ps1` como tools canônicas com entradas mínimas claras, erros legíveis e saídas determinísticas.
- `agent-memory-systems`: separar memória de trabalho do ciclo, memória episódica por workstream e memória semântica do vault.

Uso futuro próximo, sem adoção obrigatória neste ciclo:

- `multi-agent-patterns`: apenas para derivação paralela de análise e revisão sem colapsar contexto entre frentes.
- `parallel-agents`: apenas quando houver subtarefas independentes e revisáveis.
- `agent-orchestration-improve-agent`: apenas depois de baseline, métricas e casos repetidos de falha.

Skills não priorizadas nesta fase:

- `crewai`
- `langgraph`
- `computer-use-agents`
- `agent-memory-mcp`

Regra prática:

- não adotar framework novo antes de estabilizar o contrato operacional `local-first`;
- não usar paralelismo multiagente para um fluxo linear que já é derivável;
- toda automação futura deve respeitar checkpoint/resume e não depender da memória informal do operador.
- não usar um segundo chat do Codex como segunda frente de código disfarçada; isso só é aceitável
  como review `read-only` de `IDEA` ou `pré-DEC`.

---

## 3G. Modelo enxuto de execução

O Collegium Cortex não deve usar a mesma intensidade documental para todo tipo de trabalho.

Regra:

- governança forte onde há risco estrutural;
- execução leve onde o trabalho já é derivado;
- implementação agregada quando o problema já está decidido e só precisa ser traduzido.

### Velocidade 1: `full governance cycle`

Usar `WS -> SPEC -> Entrega -> REV` completo quando o trabalho tocar:

- governança;
- protocolo;
- economia;
- compliance;
- narrativa sensível;
- separação de superfícies;
- decisão irreversível;
- conflito entre caminhos;
- mudança de mandato ou de interpretação.

Obrigatório:

- read set explícito;
- `SPEC` completo;
- entrega canônica;
- `REV` formal;
- atualização do `workstream`;
- possível escalonamento.

### Velocidade 2: `lean product cycle`

Usar quando o trabalho for de aplicação interna, produto, protótipo, copy interna, arquitetura de fluxo ou refinamento de superfície já enquadrada.

Forma:

- manter `SPEC`, mas curto;
- reduzir repetição de contexto já aprovado;
- puxar por referência o que já está travado;
- registrar apenas o risco novo, a decisão local e a próxima ação dominante.

Obrigatório:

- objetivo claro;
- entradas mínimas;
- risco dominante;
- resultado esperado;
- checkpoint de continuidade.

Não obrigatório:

- recontar toda a história do `workstream`;
- repetir texto já aprovado sem novo valor;
- abrir nova formulação estratégica quando o ponto é só refinamento interno.

### Velocidade 3: `implementation execution cycle`

Usar quando a camada estratégica e de produto já está suficientemente travada e o próximo passo é só traduzir para implementação.

Forma:

- não abrir `SPEC` novo para cada micro-refino técnico;
- agrupar implementação por pacote coerente;
- registrar checklist técnico, evidência e resultado agregado;
- consolidar revisão ao final do pacote, não a cada microetapa.

Obrigatório:

- vínculo explícito ao último `SPEC` ou `REV` aprovado;
- definição do pacote de implementação;
- critérios de aceite;
- verificação técnica;
- atualização curta do `workstream`.

Proibido:

- usar ciclo pesado para ajustes que não criam risco novo;
- multiplicar `SPEC` só para manter sensação de movimento.

### Regra de escolha

Antes de abrir um novo `SPEC`, responder:

1. há risco novo de governança, narrativa, economia, compliance ou superfície?
2. há bifurcação real entre caminhos?
3. há necessidade de revisão formal de um novo artefato?
4. ou o trabalho já está suficientemente decidido e só precisa ser implementado?

Se a resposta para `1-3` for não, preferir `implementation execution cycle`.

---

## 3H. Sinais de sobrepeso processual

O processo está ficando pesado demais quando:

- vários `SPEC` consecutivos refinam a mesma superfície com diferença incremental pequena;
- o texto novo repete mais contexto do que cria decisão;
- a equipe passa mais tempo corrigindo registro, anchor, parser e envelope do que produzindo avanço real;
- o `workstream` parece avançar na documentação, mas não muda de capacidade;
- refinamento visual local começa a se comportar como se fosse decisão estrutural.

Quando esses sinais aparecerem:

1. parar de abrir novos `SPEC` por inércia;
2. reclassificar o próximo passo para o regime mais leve compatível;
3. manter o checkpoint mínimo:
   - `Estado`
   - `Risco`
   - `Próxima ação dominante`
4. só voltar ao ciclo completo se surgir risco novo ou bifurcação estratégica real.

---

## 4. Gate de início

Nenhum trabalho deve começar sem declarar, nem que seja mentalmente:

- `superfície`
- `escopo`
- `objetivo`
- `não é isto`

Se isso não estiver claro, parar e enquadrar antes de tocar código.

---

## 5. Tipos de trabalho permitidos

### Tipo A — Entendimento

Use quando:

- a visão ainda está difusa
- o usuário disser que a solução não parece com o que idealizou
- a arquitetura estiver andando mais rápido que a clareza conceitual

### Tipo B — Estrutura

Use quando:

- o enquadramento já está claro
- é preciso criar contratos, tipos, módulos ou separações duráveis

### Tipo C — Interface

Use quando:

- a função da tela está clara
- o fluxo já foi entendido
- a UI já pode refletir algo decidido

### Tipo D — Runtime

Use quando:

- o gargalo é técnico
- a dúvida é sobre estado, integração, sessão, infraestrutura ou CI

---

## 6. Ordem correta de execução

Sempre que possível, trabalhar nesta ordem:

1. entendimento
2. enquadramento
3. estrutura
4. interface
5. runtime fino

---

## 7. Regras de implementação

### 7.1 Não reduzir o projeto

Nunca tratar Collegium como:

- app de corridas
- CRM
- dashboard genérico
- automação com agentes
- rede por indicação

### 7.2 Não esconder regra crítica na interface

Regra institucional, reputacional, econômica ou de autoridade:

- não deve nascer como detalhe visual
- deve ser modelada de forma rastreável

### 7.3 Não inventar backend real

Se o dado ainda é provisório:

- marcar como provisório
- explicitar `fixture_projection`, snapshot ou camada intermediária

### 7.4 Não usar ferramenta como identidade

Ferramentas como Stitch, Playwright, scripts auxiliares e MCP local são tooling. Não são o produto.

### 7.5 Não prosseguir sob ambiguidade forte

Se o usuário disser que “não parece nada com o que idealizou”:

- parar implementação
- voltar para entendimento

---

## 8. Saída mínima por ciclo

Todo ciclo de trabalho deve fechar com:

- o que foi alterado
- em qual superfície
- por quê
- o que continua provisório
- como foi verificado

Se não houver verificação, declarar explicitamente.

---

## 9. Verificação obrigatória

Antes de declarar algo “pronto”:

### Código

- `build`
- lint/check quando aplicável
- testes relevantes quando viáveis

### Interface

- leitura visual básica
- navegação principal
- ausência de erro óbvio

### Narrativa

Checar se a solução:

- preserva a tese do projeto
- não enfraquece defensabilidade
- não mistura superfícies

---

## 10. Quando parar

Parar imediatamente o avanço de implementação quando ocorrer qualquer um:

- o usuário disser que a direção não parece com a visão original
- a equipe estiver discutindo mais “ferramenta” do que “projeto”
- a UI estiver evoluindo mais rápido que o entendimento do fluxo
- houver necessidade de “explicar demais” o que a tela faz
- a solução parecer útil, mas semanticamente errada

---

## 11. Workflow recomendado por sessão

### Sessão de entendimento

Objetivo:

- reduzir ambiguidade
- fixar função de tela, fluxo ou entidade

### Sessão de implementação

Objetivo:

- executar um slice pequeno e verificável

### Sessão de revisão

Objetivo:

- verificar se o que foi feito continua coerente com a visão

---

## 12. Regra específica para o momento atual

Estado atual recomendado do projeto:

- consolidar o `Motor Agentico` como camada documental e operacional interna;
- manter `DEC` separado de `workstream`;
- preservar saídas flexíveis com invariantes mínimos;
- usar a frente `Comunidade/Portal do CMO` como primeiro workstream piloto;
- não congelar cedo demais a forma final da aplicação.

Aplicação imediata:

- seguir `WS-20260310-01` por cadeia de `SPEC -> REV -> próximo SPEC`;
- não interromper o operador em microetapas deriváveis;
- só parar se surgir exposição prematura do Collegium, conflito real entre CMO/Legal/CFO/CEO, decisão pública irreversível ou nova questão estrutural.

---

## 13. Síntese operacional

Se precisar resumir este workflow em uma linha:

**Neste projeto, clareza de visão vem antes de velocidade de implementação; separação entre decisão e trabalho vivo vem antes de burocracia; e coerência protocolar vem antes de automação.**
