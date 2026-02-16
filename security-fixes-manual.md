# MANUAL DE CORREÇÕES DE SEGURANÇA OPENCLAW

## 📋 COMANDOS MANUAIS (se o script falhar)

Execute no PowerShell **como Administrador**:

```powershell
# 1. Navegar para diretório OpenClaw
cd "w:\workspaces antigravity\OpenClaw"

# 2. Verificar versão
pnpm openclaw --version

# 3. Auditoria inicial
pnpm openclaw security audit

# 4. Aplicar sandboxing global
pnpm openclaw config set agents.defaults.sandbox.mode all

# 5. Restringir ferramentas perigosas
pnpm openclaw config set tools.deny '["group:web","browser"]' --json

# 6. (Opcional) Remover modelo pequeno
pnpm openclaw config remove agents.defaults.model.fallbacks[2]

# 7. Reiniciar gateway
pnpm openclaw gateway restart

# 8. Aguardar 10 segundos e verificar
Start-Sleep -Seconds 10
pnpm openclaw security audit
```

## 🔧 CONFIGURAÇÃO AVANÇADA DE SANDBOXING

Para configuração mais granular (recomendado para email/calendar):

```json
// Adicionar ao openclaw.json (após agents.defaults)
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "rules": {
          "email": {
            "allowRead": true,
            "allowWrite": false,
            "allowDelete": false,
            "requireConfirmation": true,
            "maxEmailsPerDay": 100
          },
          "calendar": {
            "allowRead": true,
            "allowCreate": false,
            "allowUpdate": false,
            "allowDelete": false,
            "requireConfirmation": true
          }
        }
      }
    }
  }
}
```

Para aplicar via CLI:
```powershell
# Criar arquivo de configuração sandbox
$sandboxConfig = @'
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "rules": {
          "email": {
            "allowRead": true,
            "allowWrite": false,
            "allowDelete": false,
            "requireConfirmation": true,
            "maxEmailsPerDay": 100
          }
        }
      }
    }
  }
}
'@ | Set-Content -Path "sandbox-config.json"

# Aplicar configuração
pnpm openclaw config patch --file sandbox-config.json
```

## 🛡️ CONFIGURAÇÃO PARA SKILLS DE EMAIL

**ANTES de instalar `gmail-client` ou similar:**

### Passo 1: Configurar sandbox específico
```powershell
# Criar política de sandbox para email
$emailPolicy = @'
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "email": {
          "allowRead": true,
          "allowWrite": false,
          "allowDelete": false,
          "requireConfirmation": true,
          "allowedSenders": ["*@company.com", "important@domain.com"],
          "blockedSenders": ["spam@domain.com"],
          "logAllOperations": true
        }
      }
    }
  }
}
'@ | Set-Content -Path "email-policy.json"

pnpm openclaw config patch --file email-policy.json
```

### Passo 2: Configurar logging extensivo
```powershell
pnpm openclaw config set logging.level debug
pnpm openclaw config set logging.redactSensitive tools
```

### Passo 3: Testar em conta secundária
```powershell
# Instalar skill (usará conta autenticada)
pnpm openclaw skill install gmail-client

# Testar com permissões mínimas
pnpm openclaw skill gmail-client list --limit 5 --unread-only
```

## 📊 VERIFICAÇÃO PÓS-CORREÇÃO

Comandos para verificar se as correções foram aplicadas:

```powershell
# 1. Verificar sandbox status
pnpm openclaw config get agents.defaults.sandbox

# 2. Verificar tools restritas
pnpm openclaw config get tools.deny

# 3. Auditoria completa
pnpm openclaw security audit --deep

# 4. Verificar gateway status
pnpm openclaw gateway status

# 5. Verificar logs de segurança
Get-Content "$env:USERPROFILE\.openclaw\logs\*.log" -Tail 20 | Select-String -Pattern "sandbox|security|auth"
```

## 🚨 PROCEDIMENTOS DE EMERGÊNCIA

### Se algo der errado:
```powershell
# 1. Desativar todas as skills imediatamente
pnpm openclaw skill disable --all

# 2. Reverter para configuração segura
pnpm openclaw config set agents.defaults.sandbox.mode all
pnpm openclaw config set tools.deny '["*"]' --json

# 3. Parar gateway
pnpm openclaw gateway stop

# 4. Backup de configuração
Copy-Item "$env:USERPROFILE\.openclaw\openclaw.json" "$env:USERPROFILE\.openclaw\openclaw.json.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# 5. Restaurar configuração anterior (se necessário)
Copy-Item "$env:USERPROFILE\.openclaw\openclaw.json.backup.*" "$env:USERPROFILE\.openclaw\openclaw.json" -Force
```

## 📝 CHECKLIST DE SEGURANÇA

**ANTES de instalar qualquer skill sensível:**

- [ ] Sandboxing ativo (`agents.defaults.sandbox.mode: "all"`)
- [ ] Ferramentas perigosas restritas (`tools.deny` configurado)
- [ ] Logging ativo (`logging.level: "debug"`)
- [ ] Backup recente da configuração
- [ ] Conta de teste configurada (não conta principal)
- [ ] Permissões mínimas (apenas leitura inicial)
- [ ] Confirmação manual habilitada
- [ ] Limites de uso configurados

**APÓS instalação:**

- [ ] Testar apenas leitura por 24h
- [ ] Monitorar logs extensivamente
- [ ] Validar que ações destrutivas são bloqueadas
- [ ] Testar revogação de permissões
- [ ] Documentar comportamentos observados

## 🔗 RECURSOS ADICIONAIS

- [Documentação de Segurança OpenClaw](https://docs.openclaw.ai/gateway/security)
- [Guia de Sandboxing](https://docs.openclaw.ai/agents/sandbox)
- [Skills Security Best Practices](https://docs.openclaw.ai/skills/security)
- [Emergency Procedures](https://docs.openclaw.ai/gateway/security#emergency-procedures)

---

**Última atualização:** 2026-02-15 15:25 UTC  
**Preparado por:** Flavius Magnus Magnificus  
**Para:** Flávio Souza Barros  
**Contexto:** Auditoria de segurança pré-instalação skills email/calendar