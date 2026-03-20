# Fila de Ideias - Registro no Repo

> Espelho local quando o vault `W:\Collegium Cortex` não está disponível.
> IDEAs aqui devem ser sincronizadas com `Fila de Ideias do Collegium Cortex.md` no vault quando acessível.

---

### IDEA-20260312-01 — Retroativa: melhorias UI/UX no preview collegium-status

- Estado: promoted
- Track: motor
- Superfície alvo: Cortex Praetorium
- Descrição curta: Ajustes visuais no `_preview_artifacts/collegium-status/index.html` — hierarquia tipográfica, cores semânticas dos cards FAZER/NÃO FAZER, contraste WCAG, diferenciação badges vs links, micro-animações. Alteração feita por agente sem leitura prévia de WORKFLOW.md.
- Impacta WS atual?: Não — é artefato de preview, não código de produção
- WS alvo: nenhum WS ativo vinculado
- Próxima ação dominante: registrar SPEC retroativo e fechar REV
- Evidência mínima: diff do commit no `index.html`, screenshots do before/after
- Promovido para: SPEC-RETRO-20260312-01

---

### IDEA-20260312-02 — Regra CONTEXT GATE no GEMINI.md global

- Estado: promoted
- Track: motor
- Superfície alvo: Cortex Praetorium (infra de governança)
- Descrição curta: Inserção de regra P0 CONTEXT GATE no `.agent/rules/GEMINI.md` do Antigravity Kit. Obriga o agente a ler `WORKFLOW.md` antes de qualquer edição. Inclui revisão profissional do GEMINI.md (Socratic Gate movido para TIER 0, eliminação de heading duplicado, correção de prioridade).
- Impacta WS atual?: Sim — muda o comportamento global de todas as sessões futuras
- WS alvo: infraestrutura de governança
- Próxima ação dominante: validação do usuário + sincronizar com vault quando disponível
- Evidência mínima: diff do GEMINI.md
- Promovido para: SPEC-RETRO-20260312-02
