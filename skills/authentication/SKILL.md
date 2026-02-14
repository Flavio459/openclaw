# SKILL: Authentication & Credential Management

## 🎯 Purpose
Autonomous authentication and credential management for AI agents with human-in-the-loop safety.

## 🏗️ Architecture

### Environments Strategy
- **Human Environment:** eng.flavio.barros@gmail.com (production, critical)
- **AI Environment:** flavius9ia@gmail.com (operations, testing)
- **Separation:** Complete isolation with selective replication

### Directory Structure
```
authentication/
├── SKILL.md                    # This file
├── protocols/                  # Authentication protocols
│   ├── oauth2-automated.md    # OAuth 2.0 with AI autonomy
│   ├── form-based-auth.md     # Web form automation
│   └── api-key-management.md  # Secure API key handling
├── templates/                  # Configuration templates
│   ├── browser-automation.json
│   ├── credential-schema.json
│   └── environment-mapping.json
├── scripts/                    # Reusable scripts
│   ├── generate-credentials.js
│   ├── save-to-secure-store.js
│   └── validate-auth-status.js
├── memory/                     # Service authentication memory
│   └── services-auth.md
└── tests/                      # Test scenarios
    └── oauth2-test-flow.md
```

## 🔐 Authentication Protocols

### 1. OAuth 2.0 Automated Flow
```yaml
Inputs:
  - client_id
  - redirect_uri
  - scopes
  - account_type (human/ai)
  - environment (prod/test)

Process:
  1. Generate auth URL
  2. Present to human (if first time)
  3. Capture callback code
  4. Exchange for tokens
  5. Store securely
  6. Setup auto-refresh

Security:
  - Never store human production tokens
  - AI tokens in isolated storage
  - Audit logs for all exchanges
```

### 2. Form-Based Authentication
```yaml
Inputs:
  - Form URL
  - Field selectors (CSS/XPath)
  - Credential source (generate/store)
  - Validation selectors

Process:
  1. Browser automation to form
  2. Fill fields (credentials from secure store)
  3. Submit form
  4. Validate success/failure
  5. Capture session tokens/cookies

Autonomy Levels:
  - Full: AI generates and stores credentials
  - Semi: Human provides credentials once
  - Manual: Human does entire flow
```

### 3. Credential Generation & Storage
```yaml
Password Generation:
  - Length: 24+ characters
  - Complexity: Upper, lower, numbers, symbols
  - No dictionary words
  - Use: `bw generate --length 24 --special`

Storage Options:
  1. Bitwarden CLI (preferred)
  2. OpenClaw secure storage
  3. Encrypted local files
  4. Environment variables (temporary)

Naming Convention:
  - Service: [ServiceName]-[Environment]-[AccountType]
  - Example: github-prod-human, aws-test-ai
```

## 🤖 Autonomy Framework

### Decision Matrix
| Risk Level | Human Involvement | AI Autonomy | Examples |
|------------|-------------------|-------------|----------|
| Critical   | Full              | None        | Banking, root accounts |
| High       | Initial auth      | Maintenance | Production APIs, OAuth |
| Medium     | Approval          | Execution   | Dev environments, CI/CD |
| Low        | Notification      | Full        | Test accounts, sandboxes |

### Safety Conditions
```yaml
Stop Conditions:
  - 3 failed authentication attempts
  - 10 minute timeout
  - Security challenge detected (captcha, 2FA)
  - Unusual behavior pattern
  - Human override requested

Success Conditions:
  - Valid tokens obtained
  - Login confirmed
  - Credentials stored securely
  - Test access successful
```

## 🚀 Implementation Priority

### Phase 1: OAuth 2.0 Automation (Current)
1. ✅ Setup Antigravity proxy with AI account
2. ⏳ Complete OAuth flow for flavius9ia@gmail.com
3. 🔜 Test proxy functionality
4. 🔜 Document protocol

### Phase 2: Form-Based Authentication
1. Select test service for automation
2. Create browser automation templates
3. Implement credential generation
4. Test full autonomous flow

### Phase 3: Environment Management
1. Create environment mapping system
2. Implement credential segregation
3. Setup cross-environment audit
4. Develop backup/restore procedures

## 📋 Usage Examples

### Example 1: OAuth for New Service
```bash
# Human initiates (first time only)
skill authentication oauth \
  --service github \
  --account-type ai \
  --environment test

# AI completes autonomously
# - Presents auth URL
# - Human authorizes
# - AI captures tokens
# - Stores in Bitwarden
# - Sets up auto-refresh
```

### Example 2: Form Registration
```bash
# AI executes autonomously (low risk)
skill authentication form-register \
  --url https://service.com/signup \
  --email flavius9ia@gmail.com \
  --generate-password \
  --store-in bitwarden \
  --autonomy-level full
```

## 🔧 Technical Requirements

### Dependencies
- OpenClaw with browser automation
- Bitwarden CLI (`bw`) installed and configured
- Node.js for custom scripts
- Secure storage backend

### Security Measures
1. **Credential Isolation:** Human vs AI separation
2. **Audit Trail:** All auth attempts logged
3. **Rate Limiting:** Prevent brute force
4. **Encryption:** Credentials encrypted at rest
5. **Access Control:** Role-based permissions

## 📈 Success Metrics
- **Autonomy Rate:** % of auth flows completed without human intervention
- **Success Rate:** % of authentication attempts successful
- **Security Score:** Audit compliance rating
- **Time Saved:** Reduction in human authentication time

---

*This skill enables Flavius to operate autonomously while maintaining security boundaries between human and AI environments.*