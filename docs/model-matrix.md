# OpenClaw Model Matrix

This document outlines the configured AI models, their strengths, and recommended usage contexts.

## Primary Models & Fallbacks

| Priority | Model ID | Provider | Alias | Context Window | Input Types | Recommended For |
|----------|----------|----------|-------|----------------|-------------|-----------------|
| 1 (Primary) | `deepseek-reasoner` | DeepSeek | 🧠 DeepSeek Raciocinador | 128K | Text | Complex reasoning, logic, step-by-step thinking |
| 2 (Fallback 1) | `kimi-k2.5` | Moonshot | 📚 Kimi 256K | 256K | Text | Long‑context tasks, document analysis, summarization |
| 3 (Fallback 2) | `gemini-3-flash-preview` | Google | ⚡ Gemini Rápido | 262K | Text, Image | Speed‑sensitive queries, multimodal (images), general chat |
| 4 (Fallback 3) | `claude-3-5-sonnet-20241022` | Antigravity | 🎯 Claude Premium | 200K | Text | High‑quality output, nuanced language, premium tasks |

## Provider Details

### DeepSeek
- **Base URL**: `https://api.deepseek.com`
- **API**: OpenAI‑completions
- **Models**:
  - `deepseek‑chat`: General‑purpose chat (128K context)
  - `deepseek‑reasoner`: Optimized for reasoning (128K context)
- **Use when**: You need strong logical reasoning or step‑by‑step problem solving.

### Moonshot (Kimi)
- **Base URL**: `https://api.moonshot.ai/v1`
- **API**: OpenAI‑completions
- **Models**:
  - `kimi‑k2.5`: Long‑context specialist (256K context)
- **Use when**: Processing long documents, books, codebases, or conversations exceeding 100K tokens.

### Google (Gemini)
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta`
- **API**: Google Generative AI
- **Models**:
  - `gemini‑3‑flash‑preview`: Fast, multimodal (262K context, text+image)
  - `gemini‑3‑pro‑preview`: Higher quality, multimodal (262K context, text+image)
- **Use when**: Speed is critical, or the input includes images.

### Antigravity (Claude)
- **Base URL**: `http://localhost:8080` (local proxy)
- **API**: Anthropic Messages
- **Models**:
  - `claude‑3‑5‑sonnet‑20241022`: Claude 3.5 Sonnet (200K context)
- **Use when**: You need high‑quality, nuanced language generation (e.g., creative writing, sensitive replies).

## Fallback Strategy

The agent’s default model chain is designed to match the task context:

1. **Complex reasoning** → `deepseek/deepseek‑reasoner` (primary)
2. **Long‑context** → `moonshot/kimi‑k2.5` (fallback 1)
3. **Speed‑first** → `google/gemini‑3‑flash‑preview` (fallback 2)
4. **Premium quality** → `antigravity/claude‑3‑5‑sonnet‑20241022` (fallback 3)

If the primary model fails or times out, the system will try the next fallback in order.

## Aliases & Human‑Friendly Names

The following aliases are registered for easy reference in logs and UI:

- `deepseek/deepseek‑reasoner` → **🧠 DeepSeek Raciocinador**
- `moonshot/kimi‑k2.5` → **📚 Kimi 256K**
- `google/gemini‑3‑flash‑preview` → **⚡ Gemini Rápido**
- `antigravity/claude‑3‑5‑sonnet‑20241022` → **🎯 Claude Premium**

## Configuration Notes

- All models have zero cost configured (cost fields set to 0). Adjust if actual API pricing is needed.
- The `reasoning` flag is `false` for all models (OpenClaw does not currently support reasoning‑mode toggling via this flag).
- Context‑window values are approximate and based on provider documentation.
- The Antigravity proxy runs locally; ensure the service is reachable at `http://localhost:8080` before relying on Claude.

## Testing

Run `./test‑suite.sh` to verify each model endpoint is reachable and responds correctly.

## Applying the Configuration

You have three ways to apply the multi‑model configuration:

### Option A: Run the automatic script (recommended)
```bash
python3 ./apply-multi-model-config.py
```

This script will backup your current `openclaw.json` and apply all necessary changes.

### Option B: Apply the JSON Patch file
If you have the `jsonpatch` Python library installed:
```bash
python3 -c "
import json, jsonpatch
with open('$HOME/.openclaw/openclaw.json', 'r') as f:
    config = json.load(f)
with open('openclaw‑config‑patch.json', 'r') as f:
    patch = json.load(f)
patched = jsonpatch.apply_patch(config, patch)
with open('$HOME/.openclaw/openclaw.json', 'w') as f:
    json.dump(patched, f, indent=2)
"
```

### Option C: Manual edit
Make the following changes directly in `~/.openclaw/openclaw.json`:

1. **Primary model**: Set `agents.defaults.model.primary` to `"deepseek/deepseek‑reasoner"`
2. **Fallback order**: Set `agents.defaults.model.fallbacks` to:
   ```json
   [
     "moonshot/kimi‑k2.5",
     "google/gemini‑3‑flash‑preview",
     "antigravity/claude‑3‑5‑sonnet‑20241022"
   ]
   ```
3. **Aliases**: Under `agents.defaults.models`, ensure the following entries exist:
   ```json
   "deepseek/deepseek‑reasoner": { "alias": "🧠 DeepSeek Raciocinador" },
   "moonshot/kimi‑k2.5": { "alias": "📚 Kimi 256K" },
   "google/gemini‑3‑flash‑preview": { "alias": "⚡ Gemini Rápido" },
   "antigravity/claude‑3‑5‑sonnet‑20241022": { "alias": "🎯 Claude Premium" }
   ```

## Final Step: Restart the Gateway

After updating the configuration, restart the OpenClaw gateway for changes to take effect:

```bash
openclaw gateway restart
```

If the `openclaw` CLI is not in your PATH, you may need to restart the gateway service manually (e.g., via systemctl or the Docker container).