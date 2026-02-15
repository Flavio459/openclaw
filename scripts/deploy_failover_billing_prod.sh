#!/bin/bash
# deploy_failover_billing_prod.sh
# Automates the deployment of the failover fix and ensures gateway.mode=local is set.

set -e

REPO_DIR="/home/deploy/openclaw"
PROD_CONF="/home/deploy/.openclaw/openclaw.json"
LAB_CONF="/home/deploy/.openclaw-lab/openclaw.json"

echo "🚀 Starting deployment..."

cd "$REPO_DIR"

# Ensure we have the latest code
echo "📦 Syncing code..."
git pull || echo "⚠️ Warning: git pull failed, continuing with current state..."

# Ensure gateway.mode=local is set in configs
echo "⚙️ Configuring gateway.mode=local..."

update_config() {
  local conf_file=$1
  if [ -f "$conf_file" ]; then
    echo "Updating $conf_file using Python..."
    python3 -c "
import json, sys
try:
    with open('$conf_file', 'r') as f:
        data = json.load(f)
    if 'gateway' not in data:
        data['gateway'] = {}
    data['gateway']['mode'] = 'local'
    with open('$conf_file', 'w') as f:
        json.dump(data, f, indent=2)
    print(f'Successfully updated {sys.argv[1]}')
except Exception as e:
    print(f'Error updating {sys.argv[1]}: {e}')
    sys.exit(1)
" "$conf_file"
  else
    echo "⚠️ Warning: $conf_file not found"
  fi
}

update_config "$PROD_CONF"
update_config "$LAB_CONF"

# Rebuild and restart
echo "🔨 Rebuilding and restarting containers..."
docker compose build openclaw-gateway
docker compose up -d --force-recreate openclaw-gateway

echo "✅ Deployment complete!"

# Smoke test
echo "🔍 Running smoke test..."
cid=$(docker ps -qf name=openclaw-openclaw-gateway-1)
if [ -n "$cid" ]; then
  # Wait for gateway to start
  echo "Waiting 10s for gateway to initialize..."
  sleep 10
  docker exec "$cid" sh -lc 'node dist/index.js agent --session-id smoke-deploy --message "ping: responda apenas com OK" --json'
else
  echo "❌ Error: openclaw-gateway container not found"
  exit 1
fi
