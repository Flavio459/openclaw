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

A referencia central de visao do projeto fica no Obsidian, em `W:\Collegium Cortex`.

Hierarquia obrigatoria:

1. `ESTATUTO CNP - O Protocolo e a Matematica do SPV`;
2. `Collegium Cortex - Documento Mestre (Revisao Zero)`;
3. documentos satelites de apoio.

Se houver conflito entre documentos satelites e o CNP:

- explicitar o conflito;
- decidir qual formulacao faz mais sentido;
- atualizar o restante da documentacao;
- nao deixar interpretacoes concorrentes coexistindo implicitamente.
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

## 3. Gate de início

Nenhum trabalho deve começar sem declarar, nem que seja mentalmente:

- `superfície`
- `escopo`
- `objetivo`
- `não é isto`

Exemplo:

- superfície: `The Forum`
- escopo: `produto`
- objetivo: melhorar clareza de deliberação
- não é isto: refatoração de runtime ou redesign do Praetorium

Se isso não estiver claro, parar e enquadrar antes de tocar código.

---

## 4. Tipos de trabalho permitidos

### Tipo A — Entendimento

Use quando:

- a visão ainda está difusa
- o usuário disser que a solução não parece com o que idealizou
- a arquitetura estiver andando mais rápido que a clareza conceitual

Entregas esperadas:

- documento
- mapa de fluxo
- material de treinamento
- interpretação do domínio

**Não escrever feature por reflexo.**

### Tipo B — Estrutura

Use quando:

- o enquadramento já está claro
- é preciso criar contratos, tipos, módulos ou separações duráveis

Entregas esperadas:

- tipos
- módulos
- projeções
- documentação estrutural

### Tipo C — Interface

Use quando:

- a função da tela está clara
- o fluxo já foi entendido
- a UI já pode refletir algo decidido

Entregas esperadas:

- tela
- componente
- microfluxo
- material visual

### Tipo D — Runtime

Use quando:

- o gargalo é técnico
- a dúvida é sobre estado, integração, sessão, infraestrutura ou CI

Entregas esperadas:

- correção técnica
- integração
- testes
- scripts
- hardening

---

## 5. Ordem correta de execução

Sempre que possível, trabalhar nesta ordem:

1. entendimento
2. enquadramento
3. estrutura
4. interface
5. runtime fino

**Não inverter isso** sem um motivo forte.

O erro mais comum neste projeto é:

- construir UI antes de fixar o uso real da superfície

---

## 6. Regras de implementação

### 6.1 Não reduzir o projeto

Nunca tratar Collegium como:

- app de corridas
- CRM
- dashboard genérico
- automação com agentes
- rede por indicação

### 6.2 Não esconder regra crítica na interface

Regra institucional, reputacional, econômica ou de autoridade:

- não deve nascer como detalhe visual
- deve ser modelada de forma rastreável

### 6.3 Não inventar backend real

Se o dado ainda é provisório:

- marcar como provisório
- explicitar `fixture_projection`, snapshot ou camada intermediária

### 6.4 Não usar ferramenta como identidade

Ferramentas como:

- Stitch
- Playwright
- scripts auxiliares
- MCP local

são tooling. Não são o produto.

### 6.5 Não prosseguir sob ambiguidade forte

Se o usuário disser que “não parece nada com o que idealizou”:

- parar implementação
- voltar para entendimento

---

## 7. Saída mínima por ciclo

Todo ciclo de trabalho deve fechar com:

- o que foi alterado
- em qual superfície
- por quê
- o que continua provisório
- como foi verificado

Se não houver verificação, declarar explicitamente.

---

## 8. Verificação obrigatória

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

## 9. Quando parar

Parar imediatamente o avanço de implementação quando ocorrer qualquer um:

- o usuário disser que a direção não parece com a visão original
- a equipe estiver discutindo mais “ferramenta” do que “projeto”
- a UI estiver evoluindo mais rápido que o entendimento do fluxo
- houver necessidade de “explicar demais” o que a tela faz
- a solução parecer útil, mas semanticamente errada

Nesses casos, o próximo passo é:

- revisar início
- reabrir visão
- reclassificar superfícies

---

## 10. Workflow recomendado por sessão

### Sessão de entendimento

Objetivo:

- reduzir ambiguidade
- fixar função de tela, fluxo ou entidade

Saída:

- HTML didático
- doc
- mapa de fluxo
- resumo interpretativo

### Sessão de implementação

Objetivo:

- executar um slice pequeno e verificável

Saída:

- código
- testes/checks
- explicação curta do que mudou

### Sessão de revisão

Objetivo:

- verificar se o que foi feito continua coerente com a visão

Saída:

- findings
- riscos
- recomendação de continuar ou parar

---

## 11. Regra de progresso

Avançar só quando estas três condições forem verdadeiras:

1. a superfície está clara
2. o fluxo está claro
3. a alteração melhora coerência, não só volume de entrega

Se qualquer uma falhar, o correto é **não acelerar**.

---

## 12. Regra específica para o momento atual

Estado atual recomendado do projeto:

- segurar expansão de feature
- consolidar entendimento dos fluxos de trabalho
- usar material didático para treino e alinhamento
- voltar a implementar apenas depois que a visão estiver reenquadrada pelo usuário

---

## 13. Síntese operacional

Se precisar resumir este workflow em uma linha:

**Neste projeto, clareza de visão vem antes de velocidade de implementação; separação de superfícies vem antes de refinamento visual; e coerência protocolar vem antes de automação.**
