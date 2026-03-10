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

---

## 3C. Envelopes de saída

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

---

## 13. Síntese operacional

Se precisar resumir este workflow em uma linha:

**Neste projeto, clareza de visão vem antes de velocidade de implementação; separação entre decisão e trabalho vivo vem antes de burocracia; e coerência protocolar vem antes de automação.**