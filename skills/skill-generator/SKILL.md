# SKILL: Skill Generator (Anthropic Claude-Powered)

## 🎯 Purpose
Automated generation of new OpenClaw skills using Claude's reasoning and code generation capabilities. Turn natural language descriptions into complete, production-ready skill packages.

## 🏗️ Architecture

### Workflow
1. **Input:** Natural language description of desired skill
2. **Analysis:** Claude understands requirements, determines skill type
3. **Generation:** Produces full skill structure (SKILL.md, scripts, templates)
4. **Validation:** Ensures compliance with OpenClaw conventions
5. **Output:** Ready-to-install skill directory

### Components Generated
- `SKILL.md` — skill documentation with purpose, architecture, usage
- `scripts/` — executable scripts (with proper shebangs, error handling)
- `templates/` — configuration templates (JSON, YAML)
- `protocols/` — protocol specifications (if needed)
- `tests/` — test scenarios and validation
- Optional: `README.md`, `INSTALL.md`

## 🚀 Capabilities

### Skill Types Supported
- **Tool Skills:** Shell exec, web search, file operations
- **Integration Skills:** API clients, service connections
- **Automation Skills:** Cron-triggered workflows
- **Agent Skills:** Sub-agent management
- **Media Skills:** TTS, image processing, video handling

### Quality Guarantees
- Follows OpenClaw skill conventions (see AGENTS.md)
- Proper R0/R1 risk classification in documentation
- Idempotent operations with rollback strategies
- PTY support for interactive commands when needed
- Comprehensive error handling and logging

## 📋 Usage

### Basic Generation
```bash
skill generate-skill "Scan local network for active hosts and open ports"
# Output: ./skills/network-scanner/
```

### Specify Name
```bash
skill generate-skill --name=weather-alert "Get weather forecasts and send alerts"
```

### With Options
```bash
skill generate-skill \
  --name=git-backup \
  --description="Automatically commit and push workspace changes" \
  --type=automation \
  --schedule="every 1h"
```

### Interactive Mode
```bash
skill generate-skill --interactive
# Prompts for: name, description, type, triggers, outputs
```

## 🔧 CLI Interface

```bash
skill-generator generate [OPTIONS] <description>

Options:
  -n, --name NAME            Skill name (kebab-case)
  -d, --description TEXT     Override description
  -t, --type TYPE            skill type (tool|integration|automation|agent|media)
  -s, --schedule CRON        Default trigger schedule (if automation)
  -o, --output DIR           Output directory (default: ./skills/<name>)
  --interactive              Prompt for details
  --validate                 Run validation after generation
  --install                  Install immediately (copy to skills/)
  --model MODEL              Claude model to use (default: claude-opus-4-6-thinking)
```

## 📦 Generated Structure Example

```
network-scanner/
├── SKILL.md                 # Auto-generated documentation
├── README.md                # Quick start guide
├── scripts/
│   └── scan.sh              # Main executable (bash + nmap/ping)
├── templates/
│   └── report.json          # Output template
├── protocols/
│   └── discovery.md         # Network discovery protocol
└── tests/
    └── smoke-test.md        # Validation scenarios
```

## 🧠 Claude Prompt Engineering

The skill generator uses a specialized prompt template:

```
You are an OpenClaw Skill Architect. Generate a complete skill package.

Requirements:
- Name: {name}
- Description: {description}
- Type: {type}
- Triggers: {triggers}
- Risk Level: Determine R0/R1/R2 appropriately

Conventions:
- All scripts in ./scripts/, executable, with proper error handling
- SKILL.md must include: Purpose, Architecture, Usage, Risk Classification
- Use standard tools available in OpenClaw environment
- Idempotent operations preferred
```

## 🔐 Security & Safety

### Autonomy Bounds
- **Auto-approval:** Only for R0/R1 skills (read-only, reversible writes)
- **R2 skills:** Generated but require manual review before activation
- **Dangerous patterns:** Blocked (rm -rf, firewall changes, mass delete)

### Validation Rules
- No hardcoded credentials (use credential management skill)
- No internet-facing changes without explicit `--type=integration`
- All cron schedules must include `anchorMs` or be explicit
- Scripts must have `set -euo pipefail` (bash) or equivalent safety

## 🔧 Development Workflow

1. **Write description** in natural language
2. **Run generator** → Claude produces full skill package
3. **Review generated code** (optional, skip for R0/R1)
4. **Install** → Copy to `workspace/skills/`
5. **Test** → Use `skill test <name>` or `skill <name> --help`
6. **Deploy** → Use in production

## 📚 Examples

### Example 1: Simple Tool Skill
```bash
skill-generator generate \
  "Check disk usage and alert if above 80%"
# → creates: disk-monitor/
```

### Example 2: Integration Skill
```bash
skill-generator generate \
  --name=github-status \
  --description="Check GitHub API status and incidents" \
  --type=integration
# → creates: github-status/ (uses web_request, parses API)
```

### Example 3: Automation Skill
```bash
skill-generator generate \
  --name=daily-backup \
  --description="Compress workspace and upload to remote" \
  --type=automation \
  --schedule="0 2 * * *"
# → creates: daily-backup/ (cron-triggered)
```

## 🧪 Testing Generated Skills
```bash
# Validate structure
skill <name> --help

# Dry run (if supported)
skill <name> --dry-run

# Full execution
skill <name>
```

## 📈 Performance Metrics
- **Generation time:** ~5-15s per skill (Claude response)
- **Success rate:** >95% first-run valid skills (target)
- **Human review needed:** <10% (R2 or complex integrations)

## 🐛 Known Limitations
- Cannot generate skills requiring proprietary binaries not in base image
- Network-dependent skills must declare `internet: required` in SKILL.md
- TTY-heavy interactivity may require manual adaptation

## 🔄 Version
v1.0 — Claude-powered skill generation (2026-03-09)

---

*Turn ideas into skills instantly. Describe what you need, get production code.*