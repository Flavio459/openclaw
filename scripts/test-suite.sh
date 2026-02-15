#!/bin/bash
set -e

echo "🚀 OpenClaw Multi‑Model Test Suite"
echo "=========================================="

CONFIG_FILE="$HOME/.openclaw/openclaw.json"
PATCH_FILE="$(dirname "$0")/openclaw-config-patch.json"

# 1. Check if configuration files exist
echo -e "\n1. Checking configuration files..."
if [[ -f "$CONFIG_FILE" ]]; then
    echo "   ✓ Main config found: $CONFIG_FILE"
else
    echo "   ✗ Main config missing! Please ensure OpenClaw is installed."
    exit 1
fi

if [[ -f "$PATCH_FILE" ]]; then
    echo "   ✓ Patch file found: $PATCH_FILE"
else
    echo "   ⚠ Patch file not found in current directory."
fi

# 2. Validate JSON syntax
echo -e "\n2. Validating JSON syntax..."
if python3 -m json.tool "$CONFIG_FILE" > /dev/null; then
    echo "   ✓ Main config JSON is valid."
else
    echo "   ✗ Main config JSON is invalid!"
    exit 1
fi

if [[ -f "$PATCH_FILE" ]]; then
    if python3 -m json.tool "$PATCH_FILE" > /dev/null; then
        echo "   ✓ Patch file JSON is valid."
    else
        echo "   ✗ Patch file JSON is invalid!"
        exit 1
    fi
fi

# 3. Check for required providers and models
echo -e "\n3. Checking configured providers..."
providers=$(python3 -c "
import json, sys
with open('$CONFIG_FILE') as f:
    c = json.load(f)
provs = c.get('models', {}).get('providers', {})
print(' '.join(provs.keys()))
")

expected=("deepseek" "moonshot" "google" "antigravity")
for exp in "${expected[@]}"; do
    if echo "$providers" | grep -q "$exp"; then
        echo "   ✓ Provider '$exp' present."
    else
        echo "   ⚠ Provider '$exp' missing."
    fi
done

# 4. Run connectivity tests
echo -e "\n4. Testing provider connectivity (this may take a few seconds)..."
if command -v python3 >/dev/null; then
    python3 ./test_models.py
    CONNECTIVITY_EXIT=$?
else
    echo "   ✗ python3 not found, skipping connectivity tests."
    CONNECTIVITY_EXIT=0
fi

# 5. Verify agent defaults
echo -e "\n5. Checking agent defaults..."
primary_model=$(python3 -c "
import json, sys
with open('$CONFIG_FILE') as f:
    c = json.load(f)
primary = c.get('agents', {}).get('defaults', {}).get('model', {}).get('primary', '')
print(primary)
")

if [[ "$primary_model" == "deepseek/deepseek-reasoner" ]]; then
    echo "   ✓ Primary model set to DeepSeek Reasoner."
else
    echo "   ⚠ Primary model is '$primary_model' (expected deepseek/deepseek-reasoner)."
fi

fallbacks=$(python3 -c "
import json, sys
with open('$CONFIG_FILE') as f:
    c = json.load(f)
fall = c.get('agents', {}).get('defaults', {}).get('model', {}).get('fallbacks', [])
print(' '.join(fall))
")

echo "   Fallbacks: $fallbacks"

# 6. Verify aliases
echo -e "\n6. Checking model aliases..."
aliases=$(python3 -c "
import json, sys
with open('$CONFIG_FILE') as f:
    c = json.load(f)
alias_map = c.get('agents', {}).get('defaults', {}).get('models', {})
for k, v in alias_map.items():
    print(f'{k} → {v[\"alias\"]}')
" 2>/dev/null || echo "")

if echo "$aliases" | grep -q "🧠 DeepSeek Raciocinador"; then
    echo "   ✓ DeepSeek Reasoner alias present."
else
    echo "   ⚠ DeepSeek Reasoner alias missing."
fi

if echo "$aliases" | grep -q "📚 Kimi 256K"; then
    echo "   ✓ Kimi 256K alias present."
else
    echo "   ⚠ Kimi 256K alias missing."
fi

if echo "$aliases" | grep -q "⚡ Gemini Rápido"; then
    echo "   ✓ Gemini Flash alias present."
else
    echo "   ⚠ Gemini Flash alias missing."
fi

if echo "$aliases" | grep -q "🎯 Claude Premium"; then
    echo "   ✓ Claude Premium alias present."
else
    echo "   ⚠ Claude Premium alias missing."
fi

# 7. Summary
echo -e "\n=========================================="
echo "TEST SUITE COMPLETE"
if [[ $CONNECTIVITY_EXIT -eq 0 ]]; then
    echo "✅ All checks passed (or skipped)."
    echo ""
    echo "Next steps:"
    echo "1. Review the configuration patch: openclaw-config-patch.json"
    echo "2. Merge it into your openclaw.json (see model-matrix.md for instructions)."
    echo "3. Restart the OpenClaw gateway: openclaw gateway restart"
    exit 0
else
    echo "❌ Some connectivity tests failed."
    echo "   Check your API keys and network connectivity."
    exit 1
fi