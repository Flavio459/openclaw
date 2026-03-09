# Google Stitch Prompt (Dashboard Chairman + MCP)

Use this exact prompt in Google Stitch:

```text
Dashboard web responsivo (desktop-first) para o sistema PEMA Antigravity.

Objetivo:
- Dar visibilidade operacional para o Chairman decidir aprovações pendentes.
- Integrar com backend via MCP tools (não usar dados mockados).

Layout:
- Sidebar esquerda com navegação: Overview, Decisions, Agents, Meeting.
- Topbar com título, timestamp de atualização e status de conexão.
- Área principal com:
  1) Cards de métricas: Pending, Approved, Rejected, Total.
  2) Tabela "Decisions Pending" com colunas: ID, Title, Class, Requested By, Created At.
  3) Painel lateral "Ações rápidas" com botões Approve e Reject para item selecionado.
  4) Painel inferior com JSON de contexto: agents e meeting.

Interações:
- Seleção de linha na tabela habilita Approve/Reject.
- Confirm dialog antes de enviar decisão.
- Toast de sucesso/erro após ação.
- Atualização automática a cada 5 segundos.
- Estado de loading e empty state ("Sem decisões pendentes").

Tema visual:
- Profissional, executivo, alto contraste.
- Base neutra cinza/azul petróleo, acentos verde (approve) e vermelho (reject).
- Cards com cantos 12px, sombra suave, tipografia limpa.

Acessibilidade:
- Botões com foco visível.
- Contraste WCAG AA.
- Tabela navegável por teclado.

Dados (via MCP):
- Tool pema.state para métricas + contexto.
- Tool pema.pending para lista pendente.
- Tool pema.decision para aprovar/rejeitar.
- Tool pema.health para sinalizador de status.

Entregar:
- Versão desktop e mobile.
- Componentes reutilizáveis (MetricCard, DecisionTable, ActionPanel, StatusBadge).
```

## Pós-geração no Stitch

Use os comandos de refinamento:

1. `Make the decisions table denser with sticky header and row hover highlight.`
2. `Add optimistic UI for approve/reject and rollback on failure.`
3. `Create a mobile variant with bottom sheet actions instead of side panel.`
