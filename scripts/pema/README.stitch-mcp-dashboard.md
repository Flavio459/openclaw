# Stitch + MCP para Collegium Cortex / PEMA

Este pacote entrega:

- Prompt pronto para Google Stitch: `stitch-chairman-dashboard.prompt.md`
- Servidor MCP local (stdio): `pema-chairman-dashboard.mcp.mjs`

Referências de contexto do projeto:

- `CONTEXTO_OPERACIONAL_AGENTES.md` = enquadramento operacional oficial
- `ORIGEM_PEMA_CURADA.md` = memória curta de origem e direção
- `MEMORIA_OPERACIONAL_PEMA.md` = estado resumido da implementação atual

## 0) Enquadramento correto

- `Collegium Cortex` = marca/ecossistema
- `PEMA Protocol` = lógica interna do core business
- `OpenClaw Runtime` = engine invisível
- `Cortex Command` = superfície principal do produto
- `The Forum` = sala estratégica do produto
- `Cortex Praetorium` = cockpit interno de supervisão do desenvolvimento

Regra importante:

- `Stitch` não faz parte da identidade do produto
- `Stitch` é apenas ferramenta de layout/prototipação visual
- decisões de arquitetura, governança e runtime não devem depender do Stitch

## 1) Configurar MCP server

Adicione no seu config MCP:

```json
{
  "mcpServers": {
    "pema-dashboard": {
      "command": "node",
      "args": [
        "c:/Pico-Open/openclaw-push/scripts/pema/pema-chairman-dashboard.mcp.mjs"
      ],
      "env": {
        "PEMA_STATE_URL": "http://127.0.0.1:8787/state",
        "PEMA_DECISION_URL": "http://127.0.0.1:8787/decision",
        "PEMA_HEALTH_URL": "http://127.0.0.1:8787/health",
        "PEMA_API_TOKEN": "<set-chairman-api-token>"
      }
    }
  }
}
```

Se estiver no Windows local e o backend no VPS, abra túnel:

```bash
ssh -L 8787:127.0.0.1:8787 openclaw-vps-ts
```

Use `PEMA_STATE_FILE` apenas quando o MCP estiver rodando no mesmo host Linux do `state.json`.
Para Windows local + VPS, prefira `PEMA_STATE_URL`.
O `PEMA_API_TOKEN` deve ser o mesmo token configurado no `Chairman API`.

Para recuperar o token no LAB:

```bash
ssh openclaw-vps-ts "cat /home/deploy/.openclaw-lab/chairman-api-token"
```

## 1.1) Abrir a Control UI do LAB (opcional)

Se quiser inspecionar a UI nativa do OpenClaw além do dashboard Stitch, abra um túnel
separado para o gateway:

```bash
ssh -L 28789:127.0.0.1:28789 openclaw-vps-ts
```

Depois gere o link no host remoto:

```bash
docker exec openclaw-openclaw-gateway-lab-1 node /app/openclaw.mjs dashboard --no-open
```

Importante:

- o link correto usa fragmento `#token=...`, não querystring `?token=...`
- se a UI abrir em HTTP tunelado e cair em `pairing required`, use HTTPS/Tailscale
  ou habilite `gateway.controlUi.allowInsecureAuth=true` no LAB

## 1.2) Abrir um monitor local simples do desenvolvimento

Se você quiser acompanhar o trabalho sem depender do chat, abra:

- `scripts/pema/praetorium-local-monitor.html`

Esse HTML mostra:

- estado da PR e dos checks remotos
- fase atual do desenvolvimento
- leitura opcional de `http://127.0.0.1:8787/health` e `http://127.0.0.1:8787/state`

Pode abrir direto no navegador. Para leitura mais confiável dos endpoints locais, prefira servir
a pasta por HTTP:

```bash
cd c:/Pico-Open/openclaw-push/scripts/pema
python -m http.server 8934
```

Depois abra:

```text
http://127.0.0.1:8934/praetorium-local-monitor.html
```

Se `/state` exigir autenticação, informe o `PEMA_API_TOKEN` no próprio monitor ou cole o JSON do
snapshot manualmente.

## 2) Validar tools MCP

Com `mcporter`:

```bash
mcporter call --stdio "node c:/Pico-Open/openclaw-push/scripts/pema/pema-chairman-dashboard.mcp.mjs" tools/list
mcporter call --stdio "node c:/Pico-Open/openclaw-push/scripts/pema/pema-chairman-dashboard.mcp.mjs" tools/call --args '{"name":"pema.pending","arguments":{}}'
```

## 3) Gerar UI no Google Stitch

Copie o conteúdo de:

- `stitch-chairman-dashboard.prompt.md`

Depois exporte HTML/CSS (ou Figma) e ligue as ações de dados para chamar:

- `pema.health`
- `pema.state`
- `pema.pending`
- `pema.decision`

Use o Stitch apenas para desenhar as superfícies visuais. A implementação real das novas
superfícies `Cortex Command`, `The Forum` e `Cortex Praetorium` já deve ser tratada no código do
`ui`, não como dependência de design tool.

## 4) Contrato MCP esperado no frontend

- `pema.state`: retorno com `decisions`, `agents`, `meeting`
- `pema.pending`: retorno com `pending_count` e `pending[]`
- `pema.decision`: input `{ id, status, actor?, note? }`
- `pema.health`: valida disponibilidade da API

## 5) Superfícies já previstas no UI

No `openclaw-push/ui`, a taxonomia visual agora separa:

- `/command` → `Cortex Command`
- `/command/forum` → `The Forum`
- `/praetorium` → `Cortex Praetorium`

Essa separação existe para evitar confusão entre:

- o que pertence ao produto
- o que pertence à estratégia/deliberação
- o que pertence aos bastidores do desenvolvimento
