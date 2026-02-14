# Protocol: OAuth 2.0 Automated Flow

## 🎯 Purpose
Automate OAuth 2.0 authentication flows with appropriate human-in-the-loop safety based on risk assessment.

## 📋 Flow Overview

```
1. Service Registration
   └── Human provides: client_id, redirect_uri, scopes
   
2. Risk Assessment
   └── Determine autonomy level (critical/high/medium/low)
   
3. Auth URL Generation
   └── AI generates OAuth URL with correct parameters
   
4. Human Interaction (if required)
   └── Present URL to human
   └── Human authorizes in browser
   └── Human provides callback code/URL
   
5. Token Exchange
   └── AI exchanges code for tokens
   
6. Secure Storage
   └── Store tokens in appropriate secure store
   
7. Auto-Refresh Setup
   └── Configure token refresh mechanism
   
8. Validation
   └── Test token validity
   └── Confirm access permissions
```

## 🔐 Risk Assessment Matrix

### Critical Risk (Human Only)
- **Services:** Banking, financial, root/admin accounts
- **Human Involvement:** Full manual process
- **AI Role:** Documentation only
- **Storage:** Human-managed only

### High Risk (Human Initiated, AI Maintained)
- **Services:** Production APIs, business-critical services
- **Human Involvement:** Initial auth only
- **AI Role:** Token refresh, storage, monitoring
- **Storage:** Segregated (human vs AI)

### Medium Risk (Human Approved, AI Executed)
- **Services:** Development environments, CI/CD, testing
- **Human Involvement:** Approve before execution
- **AI Role:** Full execution with approval
- **Storage:** AI-managed with human audit

### Low Risk (AI Autonomous)
- **Services:** Sandbox accounts, test services, public APIs
- **Human Involvement:** Notification only
- **AI Role:** Full autonomy
- **Storage:** AI-managed

## 🛠️ Implementation Details

### 1. Auth URL Generation
```javascript
function generateOAuthUrl(config) {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: generateSecureState(),
    code_challenge: generatePKCECodeChallenge(),
    code_challenge_method: 'S256'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
```

### 2. Code Capture Methods

#### Method A: Browser Redirect (Preferred)
```yaml
Setup:
  - Local callback server on specific port
  - Redirect URI: http://localhost:[PORT]/callback
  
Process:
  1. Human authorizes in browser
  2. Google redirects to localhost
  3. Callback server captures code
  4. Code passed to AI
  
Requirements:
  - Local network access
  - Port availability
```

#### Method B: Manual Code Entry
```yaml
Process:
  1. Human authorizes in browser
  2. Browser shows "localhost refused" error
  3. Human copies full redirect URL from address bar
  4. Human pastes URL to AI
  5. AI extracts code from URL
  
Fallback: Use when callback server not available
```

### 3. Token Exchange
```javascript
async function exchangeCodeForTokens(code, config) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.client_id,
      client_secret: config.client_secret,
      redirect_uri: config.redirect_uri,
      grant_type: 'authorization_code',
      code_verifier: config.code_verifier
    })
  });
  
  return await response.json(); // { access_token, refresh_token, expires_in }
}
```

### 4. Secure Storage Strategy

#### For Human Accounts (Critical/High Risk)
```yaml
Storage: Human's Bitwarden vault
Access: Human-only
AI Access: None
Backup: Human responsibility
```

#### For AI Accounts (Medium/Low Risk)
```yaml
Storage: AI's secure storage (encrypted)
Access: AI + human audit
Backup: Automated to secure location
Encryption: AES-256-GCM
```

### 5. Auto-Refresh Implementation
```javascript
class TokenManager {
  constructor(storage, config) {
    this.storage = storage;
    this.config = config;
  }
  
  async refreshIfNeeded() {
    const tokens = await this.storage.getTokens();
    
    if (this.isExpired(tokens.access_token)) {
      const newTokens = await this.refreshTokens(tokens.refresh_token);
      await this.storage.saveTokens(newTokens);
      return newTokens;
    }
    
    return tokens;
  }
  
  async refreshTokens(refreshToken) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
        grant_type: 'refresh_token'
      })
    });
    
    return await response.json();
  }
}
```

## 📝 Current Implementation: Antigravity Proxy

### Context
- **Service:** Google Antigravity (Claude/Gemini models)
- **Account Type:** AI (flavius9ia@gmail.com)
- **Risk Level:** Medium (AI execution with human approval)
- **Storage:** AI secure storage

### Current Status
```yaml
Step 1: ✅ Proxy server running (localhost:8080)
Step 2: ✅ OAuth URL generated
Step 3: ⏳ Waiting for human authorization
Step 4: 🔜 Token exchange
Step 5: 🔜 Secure storage
Step 6: 🔜 OpenClaw integration
```

### OAuth URL (Current)
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A51121%2Foauth-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcclog+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fexperimentsandconfigs&access_type=offline&prompt=consent&code_challenge=-9aiRAlZCBG8YgCx2IBlkLeL4fpOs6AzSRrFMdaUjZY&code_challenge_method=S256&state=b074e8ed39bbb9a33824bdccc75814da
```

## 🚨 Error Handling

### Common Errors & Solutions
1. **"Invalid redirect_uri"**
   - Ensure exact match with registered URI
   - Check for trailing slashes

2. **"Code already used"**
   - Generate new auth URL
   - Use new state parameter

3. **"Refresh token expired"**
   - Require re-authentication
   - Present new auth URL to human

4. **"Insufficient permissions"**
   - Request additional scopes
   - Update OAuth consent screen

## 📊 Monitoring & Audit

### What to Log
```yaml
Authentication Events:
  - Timestamp
  - Service name
  - Account type (human/ai)
  - Risk level
  - Success/failure
  - Error details (if any)
  - Token expiry
  - Human involvement level

Security Events:
  - Failed attempts (count & pattern)
  - Token refresh events
  - Scope changes
  - Storage access
```

### Alert Conditions
- 3+ failed auth attempts in 5 minutes
- Token refresh failure
- Unusual access patterns
- Human account accessed by AI (critical alert)

## 🔄 Continuous Improvement

### Metrics to Track
1. **Autonomy Rate:** % of flows without human intervention
2. **Success Rate:** % of successful authentications
3. **Time to Auth:** Average time from start to valid tokens
4. **Error Rate:** % of flows with errors
5. **Human Satisfaction:** Feedback on process

### Feedback Loop
```
Execution → Metrics → Analysis → Protocol Update → Execution
```

---

*This protocol enables scalable, secure OAuth automation while maintaining appropriate human oversight based on risk assessment.*