# OpenClaw 2026.3.8 LAB Preflight

Checklist de preparacao para a futura trilha de upgrade do OpenClaw no LAB.

Estado atual da decisao:

- upgrade adiado no ambiente principal;
- alvo futuro: `2026.3.8`;
- ambiente inicial: `LAB`;
- este checklist nao autoriza execucao automatica; ele prepara a janela correta.

## Gate de abertura

Nao abrir a trilha de upgrade enquanto qualquer item abaixo estiver falso:

- [ ] PR atual do Collegium mergeada
- [ ] worktree principal limpo
- [ ] nenhuma mudanca estrutural concorrente no LAB
- [ ] branch ou worktree dedicado para upgrade criado
- [ ] baseline atual do LAB registrada

## Baseline obrigatoria

- [ ] registrar versao atual do OpenClaw no LAB
- [ ] registrar hash/tag atual do runtime em uso
- [ ] registrar estado do dashboard, Chairman API e MCP
- [ ] registrar situacao atual de pairing / Control UI
- [ ] salvar evidencias de health (`/health`, `/state`, agents visiveis, pendencias)

## Auth e pairing

- [ ] localizar configuracao de `gateway.auth.token`
- [ ] localizar configuracao de `gateway.auth.password`
- [ ] definir explicitamente `gateway.auth.mode` se ambos coexistirem
- [ ] validar impacto no fluxo de pairing do browser
- [ ] validar impacto na Control UI por tunel HTTP/SSH

## Collegium / PEMA impact surface

- [ ] revisar Chairman API local
- [ ] revisar MCP do dashboard (`/state`, token, health)
- [ ] revisar wrappers, handoff e estado do LAB
- [ ] revisar monitor local e qualquer integracao com endpoints do LAB
- [ ] revisar dependencias de contexto, compaction e bootstrap

## Runtime e bootstrap

- [ ] revisar notas de release `v2026.3.7`
- [ ] revisar notas de release `v2026.3.8`
- [ ] mapear mudancas em `ContextEngine`, hooks e registry
- [ ] mapear mudancas em plugins/bundled modules
- [ ] mapear mudancas em onboarding/control UI

## Rollback

- [ ] definir comando/procedimento de rollback do container ou binario atual
- [ ] confirmar disponibilidade dos artefatos da versao atual
- [ ] confirmar como restaurar config anterior
- [ ] confirmar como restaurar emparelhamento e acesso a UI se houver regressao

## Validacao minima pos-upgrade no LAB

- [ ] gateway sobe sem erro
- [ ] auth/pairing continuam funcionais
- [ ] agents aparecem corretamente
- [ ] Chairman API responde
- [ ] MCP le `/state` com autenticacao
- [ ] dashboard continua operacional
- [ ] Control UI continua utilizavel
- [ ] smokes essenciais do Collegium passam

## Criterio de promocao

So considerar promover o upgrade para ambiente principal quando:

- [ ] LAB estiver estavel apos o upgrade
- [ ] nao houver regressao em auth/pairing/control UI
- [ ] nao houver regressao no Chairman API / dashboard / MCP
- [ ] rollback tiver sido exercitado ou validado de forma crivel
- [ ] a janela de promocao estiver isolada de outras frentes de desenvolvimento
