# Collegium Cortex

## Contexto Operacional para Agentes de Desenvolvimento

### Documento interno para OpenClaw / Codex / Antigravity

Versão 0.1

---

## Finalidade deste documento

Este documento não substitui o whitepaper tecnológico. Ele existe para uma finalidade diferente: alinhar o agente de desenvolvimento com a realidade prática do projeto em construção.

O whitepaper descreve a visão, a tese institucional, a arquitetura de governança e a lógica econômica do ecossistema Collegium Cortex.

Este documento, por sua vez, serve como memória operacional viva para o agente que está ajudando a construir o sistema na stack atual. Seu objetivo é reduzir interpretações erradas, evitar decisões de implementação desalinhadas e dar contexto suficiente para que o agente adapte código, estrutura, nomenclatura e fluxo às necessidades reais do projeto.

Em termos simples:

- o whitepaper explica o que o projeto é;
- este contexto operacional explica como o projeto está sendo construído agora, quais são seus componentes reais e quais partes ainda estão em definição.

## Relação com os demais documentos

- Este é o documento central de contexto operacional do projeto.
- [ORIGEM_PEMA_CURADA.md](./ORIGEM_PEMA_CURADA.md) continua como memória curta de origem, princípios e direção.
- [MEMORIA_OPERACIONAL_PEMA.md](./MEMORIA_OPERACIONAL_PEMA.md) continua como retrato resumido do estado atual da implementação.
- [README.stitch-mcp-dashboard.md](./README.stitch-mcp-dashboard.md) continua como guia técnico da integração dashboard/MCP/Stitch.

---

## 1. Enquadramento correto do projeto

A Collegium Cortex não deve ser interpretada pelo agente como apenas um app de corridas, um CRM, um backoffice tradicional ou um sistema MLM isolado.

O projeto deve ser entendido como uma infraestrutura de mobilidade com governança protocolada, composta por:

- operação de mobilidade;
- lógica econômica própria;
- reputação e mediação entre piloto e passageiro;
- governança híbrida humano + IA;
- arquitetura multiagente para monitoramento, análise, decisão assistida e execução operacional.

Toda decisão de arquitetura, nomenclatura, modelagem de dados, UX interna, automações e integrações deve respeitar esse enquadramento.

---

## 2. O que o agente precisa assumir como verdade-base

Ao trabalhar neste projeto, o agente deve operar com as seguintes premissas:

### 2.1 O sistema é protocolar, não apenas aplicativo

A aplicação é apenas a interface visível. O valor do projeto está na camada de regras, governança, rastreabilidade, reputação, distribuição econômica e evolução do protocolo.

### 2.2 O sistema é agentic por definição

A arquitetura desejada não é de automações isoladas. O objetivo é construir uma estrutura em que agentes especializados assumam funções distintas dentro do ecossistema.

### 2.3 A soberania final é humana e colegiada

Os agentes ampliam capacidade operacional e analítica, mas não substituem a deliberação estratégica humana. Mudanças estruturais, parâmetros sensíveis e temas institucionais exigem governança humana.

### 2.4 O passageiro também é parte governada do sistema

O projeto não deve tratar o passageiro apenas como cliente. Passageiro também integra reputação, segurança, auditoria e responsabilização.

### 2.5 A rede econômica é derivada de mobilidade real

A camada de rede e incentivos sempre deve ser entendida como derivada da atividade real do sistema, nunca como motor autônomo desligado da produção operacional.

---

## 3. Objetivo do agente dentro do ambiente de desenvolvimento

O agente deve agir como colaborador de engenharia, estrutura e modelagem, não apenas como gerador de código.

Isso significa que ele deve ser capaz de:

- entender a tese do produto;
- manter coerência entre visão e implementação;
- identificar componentes ainda implícitos;
- sugerir estruturas modulares compatíveis com crescimento futuro;
- preservar separação entre visão pública, regra protocolar e implementação operacional;
- evitar atalhos que resolvam o curto prazo destruindo a arquitetura de longo prazo.

O agente deve preferir soluções que preservem extensibilidade, auditabilidade, modularidade e rastreabilidade.

---

## 4. Camadas que o agente deve considerar ao implementar

Ao raciocinar sobre o sistema, o agente deve separar o projeto nas seguintes camadas.

### 4.1 Camada institucional

Define a identidade do ecossistema, sua lógica de governança, princípios, papéis e limites de decisão.

Exemplos:

- Conselho CORE;
- Conselho Humano de Diretrizes;
- regras de revisão do protocolo;
- critérios de decisão estrutural.

### 4.2 Camada protocolar

Define as regras que governam os participantes e a operação do sistema.

Exemplos:

- reputação;
- elegibilidade;
- qualificação por atividade;
- SPV;
- compressão dinâmica;
- progressão de patentes;
- regras de integridade e compliance.

### 4.3 Camada agentic

Define agentes, responsabilidades, entradas, saídas, estados e níveis de autonomia.

Exemplos:

- agentes financeiros;
- agentes de compliance;
- agentes operacionais;
- agentes de inteligência estratégica;
- agentes de governança.

### 4.4 Camada de aplicação

Define interfaces, fluxos, dashboards, painéis, rotas, páginas, notificações, formulários, eventos e experiência do usuário.

### 4.5 Camada de dados e auditoria

Define persistência, versionamento, logging, trilha de eventos, histórico decisório e vínculo entre telemetria, regra aplicada e consequência gerada.

O agente não deve colapsar essas camadas em um único bloco de implementação.

---

## 5. Modelo mental que o agente deve usar

Ao analisar demandas, o agente deve perguntar internamente:

1. isso é visão institucional, regra protocolar ou detalhe de interface?
2. isso altera comportamento de um agente, de um humano ou de ambos?
3. isso exige auditabilidade futura?
4. isso impacta reputação, remuneração, governança ou segurança?
5. isso é uma regra estrutural ou apenas um comportamento temporário de MVP?

Se houver ambiguidade, o agente deve preferir modelagem que preserve clareza de separação entre:

- regra;
- decisão;
- evidência;
- execução.

---

## 6. Entidades centrais que o agente deve respeitar

O projeto gira em torno de entidades conceituais que devem permanecer claras mesmo que a modelagem técnica evolua.

### 6.1 Piloto

Operador logístico da malha, com atributos de produção, reputação, elegibilidade, rede, progressão, histórico e integridade operacional.

### 6.2 Passageiro

Usuário da mobilidade com atributos de identidade, reputação, histórico de interação, risco, confiabilidade e comportamento.

### 6.3 Corrida / Evento de Mobilidade

Unidade operacional central do sistema. Deve ser tratada como evento auditável, com telemetria, contexto, resultado, vínculo reputacional e impacto econômico.

### 6.4 U.P. - Unidade de Produção

Métrica protocolar derivada de produção real validada.

### 6.5 Rede

Estrutura relacional entre participantes para fins de expansão, formação, supervisão e distribuição econômica derivada da operação real.

### 6.6 Agente

Entidade funcional especializada da camada agentic, com escopo definido, limites operacionais, entradas, saídas e grau de autonomia.

### 6.7 Deliberação

Processo institucional pelo qual dados, sinais de campo e diretrizes humanas se convertem em mudança ou manutenção do protocolo.

---

## 7. Comportamentos que o agente deve evitar

O agente não deve simplificar o projeto para categorias inadequadas.

Evitar interpretar o sistema como:

- apenas app de corridas;
- apenas painel administrativo;
- apenas CRM de motoristas;
- apenas motor de comissionamento;
- apenas automação com bots;
- apenas rede de afiliados;
- apenas app marketplace convencional.

Também deve evitar:

- acoplar regra de negócio crítica diretamente à interface;
- esconder decisões importantes em lógica opaca;
- misturar governança com implementação improvisada;
- criar estruturas sem histórico, versionamento ou explicabilidade mínima;
- transformar agentes em funções genéricas sem identidade clara.

---

## 8. O que ainda pode estar incompleto neste documento

Este documento não pretende afirmar que toda a arquitetura já foi totalmente especificada.

Durante a construção, podem existir:

- ações estruturais já iniciadas no ambiente de desenvolvimento e ainda não descritas no whitepaper;
- componentes experimentais em fase de iteração;
- fluxos provisórios de MVP;
- regras ainda não formalizadas em documento institucional;
- decisões técnicas tomadas por necessidade de execução e ainda não convertidas em linguagem protocolar.

O agente deve entender que o projeto está em construção e, portanto, precisa trabalhar com estrutura evolutiva.

Sempre que identificar discrepância entre o whitepaper e a implementação prática, deve interpretar isso como um sinal de que existe uma camada de contexto operacional ainda não formalizada, e não necessariamente como erro definitivo.

---

## 9. Como o agente deve lidar com lacunas

Quando faltar informação, o agente deve priorizar as seguintes condutas:

### 9.1 Preservar extensibilidade

Modelar de forma que novas regras possam ser incorporadas sem reescrever o sistema inteiro.

### 9.2 Preservar auditabilidade

Sempre que possível, decisões importantes devem deixar rastro.

### 9.3 Preservar separação de responsabilidades

Agentes, regras, humanos, eventos e efeitos devem permanecer distinguíveis.

### 9.4 Preservar aderência à tese do projeto

Toda solução deve continuar compatível com a visão de mobilidade protocolada, governança híbrida e arquitetura multiagente.

### 9.5 Marcar explicitamente hipóteses provisórias

Quando o sistema depender de uma suposição ainda não consolidada, isso deve ficar claro na estrutura, comentários, documentação ou convenção adotada.

---

## 10. Modo de adaptação esperado do agente

Ao atuar neste projeto, espera-se que o agente adapte seu comportamento para trabalhar como um parceiro de construção arquitetural.

Isso inclui:

- entender o domínio antes de propor abstrações;
- não reduzir o projeto a padrões genéricos prontos;
- identificar onde há necessidade de documentação complementar;
- sugerir nomes, módulos e fluxos que reflitam a lógica real do sistema;
- manter consistência entre governança, agentes, protocolo e operação;
- ajudar a transformar estruturas tácitas em estruturas documentadas.

O agente deve ser capaz de operar tanto no nível micro da implementação quanto no nível macro da coerência do ecossistema.

---

## 11. Diferença entre documentos do projeto

Para evitar confusão, o agente deve distinguir os seguintes tipos documentais:

### Whitepaper Tecnológico

Documento de visão, tese, arquitetura conceitual e posicionamento estratégico.

### Contexto Operacional para Agentes

Documento interno para orientar adaptação da IA durante a construção do sistema.

### Especificações de Módulo

Documentos focados em componentes específicos, como reputação, SPV, governança, telemetria, mediação de disputas, dashboards ou orquestração multiagente.

### Regras Protocolares

Documento ou camada documental que formaliza a lógica normativa do sistema.

### Decisões de Arquitetura

Registro de escolhas estruturais tomadas ao longo da construção.

Essa distinção é importante para que o agente não tente usar um único documento para todas as finalidades.

---

## 12. Camada de defensabilidade do projeto

O agente deve entender que este projeto não está sendo construído apenas para funcionar tecnicamente. Ele também precisa ser defensável em narrativa, arquitetura e percepção institucional.

Isso significa que decisões de modelagem, nomenclatura, fluxo e documentação devem considerar desde cedo três frentes de risco:

- risco de má leitura pública;
- risco regulatório;
- risco de rejeição por investidores, parceiros ou adotantes estratégicos.

### 12.1 Risco de leitura inadequada do modelo

Determinados componentes do projeto podem ser mal interpretados se forem apresentados ou implementados sem o enquadramento correto.

Entre os riscos de leitura mais prováveis estão:

- interpretar a rede como fim em si mesma;
- interpretar o sistema como app de corridas com comissionamento multinível;
- interpretar a arquitetura agentic como centralização opaca travestida de IA;
- interpretar mecanismos de compliance como subordinação trabalhista excessiva;
- interpretar reputação e controle como sistema punitivo unilateral.

O agente deve evitar nomenclaturas, fluxos, labels e abstrações que reforcem essas leituras.

### 12.2 Diretriz de defensabilidade econômica

Toda implementação deve manter aderência à seguinte premissa:

**a produção econômica do sistema deriva de mobilidade real validada na infraestrutura.**

A camada de rede, progressão e remuneração residual deve sempre aparecer como derivada de:

- ativação operacional;
- formação qualificada;
- retenção;
- supervisão;
- contribuição efetiva para a estabilidade da oferta.

O agente deve evitar estruturar qualquer módulo de forma que pareça haver relevância econômica autônoma em:

- cadastro puro;
- adesão sem produção;
- indicação sem ativação;
- progressão sem base operacional.

### 12.3 Diretriz de defensabilidade regulatória

O sistema deve ser modelado de forma a sustentar a leitura de que existe:

- infraestrutura com regras explícitas;
- produção real mensurável;
- governança revisável;
- trilha de auditoria;
- proporcionalidade em medidas de integridade;
- separação entre automação operacional e deliberação humana estruturante.

Sempre que possível, o agente deve preservar mecanismos que facilitem demonstrar:

- origem do valor econômico;
- motivo de uma decisão automatizada;
- critério aplicado em bloqueios, contenções ou compensações;
- possibilidade de revisão institucional em temas sensíveis.

### 12.4 Diretriz de defensabilidade para investidor

O investidor sofisticado tende a avaliar o projeto a partir de perguntas implícitas como:

- isso escala sem colapsar institucionalmente?
- isso depende demais de narrativa ou possui engenharia real?
- a governança é clara ou arbitrária?
- a economia é auditável?
- o risco regulatório é mitigável?
- a arquitetura suporta evolução sem reescrita completa?

O agente deve, portanto, preferir estruturas que transmitam:

- modularidade;
- clareza de responsabilidade;
- rastreabilidade de decisão;
- consistência entre visão e execução;
- capacidade de expansão por camadas.

### 12.5 Diretriz de defensabilidade de adoção

Além de funcionar e ser regulatoriamente defensável, o sistema precisa ser adotável por usuários, operadores e parceiros.

O agente deve considerar que estruturas excessivamente complexas, obscuras ou difíceis de explicar podem gerar fricção de adoção mesmo quando tecnicamente corretas.

Ao implementar, deve equilibrar:

- sofisticação interna;
- inteligibilidade externa;
- clareza de fluxo;
- simplicidade progressiva na experiência.

---

## 13. Guardrails narrativos que o agente deve respeitar

Ao produzir textos internos, labels, componentes, descrições de módulo, nomes de entidades ou documentação auxiliar, o agente deve respeitar os seguintes guardrails narrativos.

### 13.1 Como o projeto deve ser descrito

Preferir enquadramentos como:

- infraestrutura de mobilidade governada por protocolo;
- ecossistema de mobilidade com governança híbrida;
- arquitetura multiagente supervisionada por deliberação humana;
- sistema econômico auditável derivado de atividade real;
- protocolo de confiança entre piloto e passageiro.

### 13.2 Como o projeto não deve ser descrito

Evitar enquadramentos como:

- app de corridas com rede;
- sistema de afiliados para motoristas;
- IA decide tudo;
- jurídico automatizado como autoridade final;
- bônus infinito como proposta principal;
- monetização por indicação.

### 13.3 Como a camada agentic deve ser comunicada

A camada agentic deve ser descrita como:

- orquestração de agentes especializados;
- ampliação de capacidade operacional;
- sistema de monitoramento, análise, recomendação e execução;
- inteligência distribuída com limites institucionais.

Evitar linguagem que personifique excessivamente agentes como se fossem soberanos corporativos autônomos.

### 13.4 Como a rede econômica deve ser comunicada

A rede deve ser descrita como mecanismo de:

- expansão qualificada;
- formação e retenção da oferta;
- supervisão operacional distribuída;
- participação em valor gerado por atividade real.

Evitar linguagem que faça parecer que a expansão relacional, isoladamente, é o centro econômico do sistema.

---

## 14. Campos que futuras versões deste documento devem receber

Para tornar este documento plenamente aderente ao ambiente real de construção, futuras versões devem incorporar informações concretas do projeto em andamento.

### 14.1 Stack e ambiente atual

Adicionar:

- stack principal;
- runtime;
- serviços já adotados;
- banco de dados;
- filas, eventos e integrações;
- ambiente OpenClaw / Codex / Antigravity conforme uso real.

### 14.2 Módulos já implementados

Adicionar lista objetiva de módulos existentes, por exemplo:

- autenticação;
- cadastro de piloto;
- cadastro de passageiro;
- telemetria;
- reputação;
- SPV;
- patentes;
- dashboards;
- agentes já ativos ou simulados.

### 14.3 Ações estruturais já em curso

Adicionar explicitamente as ações estruturais que já existem no ambiente de desenvolvimento e ainda não foram descritas no whitepaper.

Cada ação deve registrar:

- nome;
- função;
- camada a que pertence;
- status atual;
- impacto arquitetural;
- dependências;
- risco de interpretação incorreta se ficar sem documentação.

### 14.4 Convenções de nomenclatura

Adicionar convenções oficiais para nomes de:

- entidades;
- módulos;
- agentes;
- eventos;
- estados;
- painéis;
- fluxos.

### 14.5 Decisões de arquitetura já tomadas

Adicionar um registro das escolhas estruturais relevantes já decididas, inclusive escolhas temporárias de MVP que não representam a forma final do protocolo.

---

## 15. Próximo passo recomendado

Este documento deve evoluir para um manual operacional de contexto do projeto, alimentado continuamente com:

- decisões estruturais já tomadas;
- módulos existentes;
- fluxos em construção;
- convenções de nomenclatura;
- arquitetura atual da stack;
- limitações temporárias do ambiente;
- pendências conceituais ainda abertas;
- riscos de percepção e defesa institucional.

A versão atual já oferece um enquadramento mais robusto para construção técnica, narrativa pública e leitura regulatória. As próximas versões devem torná-lo cada vez mais aderente ao estado real da implementação.

---

## 16. Síntese executiva para o agente

Se este documento precisar ser resumido em uma diretriz operacional única, ela é a seguinte:

**Você está colaborando na construção de uma infraestrutura de mobilidade governada por protocolo, assistida por múltiplos agentes de IA, supervisionada por deliberação humana e baseada em regras auditáveis de confiança, produção, reputação, segurança e distribuição econômica. Não trate este projeto como um app convencional. Modele-o como um ecossistema evolutivo, economicamente lastreado em mobilidade real e narrativamente defensável perante usuários, reguladores, parceiros e investidores.**
