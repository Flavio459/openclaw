# WebChat first-message echo fix (2026-02-17)

## Objective
Stabilize the first WebChat response to avoid echo/empty final payload behavior.

## Root cause addressed
`chat.send` could emit `state: "final"` even when no assistant payload was produced.
This created inconsistent UI behavior (echo/repeat/empty-looking first reply).

## Code changes
- `src/gateway/server-methods/chat.ts`
  - Prevent `broadcastChatFinal` when final payload is missing.
  - Emit `broadcastChatError` with `errorMessage: "no_assistant_payload"`.
  - Add structured diagnostics for:
    - `started_without_payload`
    - `final_without_message_prevented`
    - `fallback_error_billing`
    - `timeout_or_abort`
- `src/gateway/server.chat.gateway-server-chat.e2e.test.ts`
  - Added test to assert error event on missing assistant payload.

## Runtime/config rollout
- Unified image tag for Lab/Prod: `openclaw:2026.2.6-3-hotfix1`
- Primary model moved to `moonshot/kimi-k2.5` (fallbacks preserved).
- Heartbeat stays on low-cost model (`deepseek/deepseek-chat`).
- `gateway.trustedProxies` reinforced for WebChat proxy path.

## Validation
- Focused e2e test passed (Node 22 runtime).
- Lab canary before Prod promotion completed.
- Prod and Lab are on the same image digest.
- `doctor` and key config checks passed post-rollout.

## Rollback
1. Revert container image tag in `/home/deploy/openclaw/.env` and `docker-compose.yml`.
2. Restore config backups from `.ops-archive/20260217-151050/remote-bak`:
   - `.env.bak-*`
   - `docker-compose.yml.bak-*`
   - `src/gateway/server-methods/chat.ts.bak-*`
   - `src/gateway/server.chat.gateway-server-chat.e2e.test.ts.bak-*`
3. Recreate services:
   - `docker compose up -d --no-deps openclaw-gateway-lab`
   - `docker compose up -d --no-deps openclaw-gateway`

## Notes
- Existing unrelated UI changes were intentionally left untouched.
- This hotfix is protocol-compatible (no RPC method/schema break).
