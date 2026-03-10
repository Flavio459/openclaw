# SKILL: Claude (Anthropic) Integration

## 🎯 Purpose
Direct integration with Anthropic's Claude models via Antigravity proxy for enhanced reasoning, code generation, and skill creation capabilities.

## 🏗️ Architecture

### Models Available
- Claude Opus 4.5 Thinking
- Claude Opus 4.6 Thinking
- Other Claude variants via proxy

### Integration Method
- Uses OpenClaw `antigravity` provider (localhost:8080)
- Compatible with OpenRouter-style model IDs: `antigravity/claude-*`
- Supports reasoning mode and extended context (200K)

## 🚀 Capabilities

### Reasoning & Analysis
- Complex problem decomposition
- Multi-step logical reasoning
- Code architecture design
- System optimization planning

### Skill Generation
- Create new OpenClaw skills from specifications
- Generate skill templates following conventions
- Auto-generate documentation (SKILL.md, README.md)
- Implement scripts and protocols

### Code Generation
- Multi-language support (Node.js, Python, Bash)
- adherence to OpenClaw patterns
- Error handling and fallback strategies
- TTY-aware scripts (PTY support)

## 📋 Usage

### Direct Claude Usage
```bash
# Use Claude as primary model for a session
skill claude --prompt "Analyze system performance..."

# Or via model override in chat
/flavius model antigravity/claude-opus-4-6-thinking
```

### Skill Generation
```bash
# Generate a new skill from description
skill claude generate-skill \
  --name "network-scanner" \
  --description "Scan local network for devices and services" \
  --output ./skills/network-scanner
```

## 🔧 Configuration

### Provider Setup
Ensure `openclaw.json` has:
```json
"providers": {
  "antigravity": {
    "baseUrl": "http://localhost:8080",
    "api": "anthropic-messages"
  }
}
```

### Model Aliases
```json
"antigravity/claude-opus-4-5-thinking": "Claude Opus 4.5 (Grátis)"
"antigravity/claude-opus-4-6-thinking": "Claude Opus 4.6 (Grátis)"
```

## ⚙️ Scripts

### claude-query
```bash
#!/bin/bash
# Query Claude with a prompt
PROMPT="$1"
MODEL="${2:-antigravity/claude-opus-4-6-thinking}"
# Send to OpenClaw with model override
echo "Querying Claude..."
```
### generate-skill-template
```bash
#!/bin/bash
# Generate full skill structure from description
NAME="$1"
DESC="$2"
# Output directory
OUT="./skills/$NAME"
# Create structure and populate with AI-generated content
```

## 📦 Dependencies
- Antigravity proxy running on localhost:8080
- Valid authentication (Plugin `google-antigravity-auth` enabled)
- OpenClaw gateway with Anthropic provider configured

## 🧪 Testing
Run validation:
```bash
skill claude test --model antigravity/claude-opus-4-6-thinking --prompt "Hello"
```

## 🔐 Security
- All Claude interactions go through local proxy (no direct internet)
- No credentials stored in skill files
- Only use with authorized Anthropic access methods

## 📚 References
- OpenClaw Skill Development Guide
- Anthropic Claude API Documentation
- Antigravity Integration Protocol

---

*This skill brings Claude's advanced reasoning to the OpenClaw ecosystem.*