# 🛡️ PLANO DE AÇÃO DE SEGURANÇA - OPENCLAW

## 🎯 OBJETIVO
Aplicar correções de segurança críticas antes de instalar skills sensíveis (email/calendar).

## ⏱️ TEMPO ESTIMADO
**15-20 minutos** (incluindo reinício do gateway)

## 📋 CHECKLIST RÁPIDO

### ✅ PRÉ-REQUISITOS
- [ ] PowerShell como Administrador
- [ ] OpenClaw CLI instalado (`openclaw --version` funciona)
- [ ] Gateway possivelmente rodando (será reiniciado)

### 🔧 CORREÇÕES OBRIGATÓRIAS (5 minutos)
```powershell
# Execute ESTES 4 comandos:
cd "w:\workspaces antigravity\OpenClaw"

# 1. Sandboxing global
pnpm openclaw config set agents.defaults.sandbox.mode all

# 2. Restringir ferramentas perigosas  
pnpm openclaw config set tools.deny '["group:web","browser"]' --json

# 3. (Opcional) Remover modelo pequeno
pnpm openclaw config remove agents.defaults.model.fallbacks[2]

# 4. Reiniciar gateway
pnpm openclaw gateway restart
```

### ✅ VERIFICAÇÃO (2 minutos)
```powershell
# Aguardar 10 segundos
Start-Sleep -Seconds 10

# Verificar correções
pnpm openclaw security audit

# Esperado: "Summary: 0 critical · 0 warn · 1 info"
```

## 🚀 COMANDOS PRONTOS PARA COPIAR/COLAR

**Opção A: Script completo (recomendado)**
```powershell
cd "w:\workspaces antigravity\OpenClaw"
.\security-fixes.ps1  # Se salvou o script
```

**Opção B: Comandos manuais**
```powershell
cd "w:\workspaces antigravity\OpenClaw"
pnpm openclaw config set agents.defaults.sandbox.mode all
pnpm openclaw config set tools.deny '["group:web","browser"]' --json
pnpm openclaw gateway restart
Start-Sleep -Seconds 10
pnpm openclaw security audit
```

## 📊 O QUE CADA CORREÇÃO FAZ

### 1. `sandbox.mode: "all"`
- **Problema resolvido:** Modelos pequenos sem proteção
- **Efeito:** Isola todas as sessões em sandbox
- **Impacto:** Skills não podem fazer ações destrutivas sem confirmação

### 2. `tools.deny: ["group:web","browser"]`
- **Problema resolvido:** Ferramentas perigosas acessíveis a modelos pequenos
- **Efeito:** Bloqueia web_search, web_fetch, browser para modelos <300B
- **Impacto:** Previne exfiltração de dados via web

### 3. Remover `gemma-3-12b-it:free` (opcional)
- **Problema resolvido:** Modelo muito pequeno (12B) vulnerável
- **Efeito:** Remove dos fallbacks, mantém apenas modelos grandes
- **Impacto:** Melhora segurança, mantém funcionalidade

## 🛡️ ESTADO PÓS-CORREÇÃO

**Esperado após correções:**
```
OpenClaw security audit
Summary: 0 critical · 0 warn · 1 info
```

**Se ainda mostrar critical:**
- Gateway pode não ter reiniciado completamente
- Aguardar mais 30 segundos e rodar `pnpm openclaw gateway status`
- Se persistir, usar `pnpm openclaw security audit --fix`

## 📞 SUPORTE RÁPIDO

**Se encontrar erros:**

1. **"Command not found"**: `cd "w:\workspaces antigravity\OpenClaw"` primeiro
2. **"Permission denied"**: Executar como Administrador
3. **Gateway não reinicia**: `pnpm openclaw gateway stop` depois `start`
4. **Configuração não aplica**: Usar `pnpm openclaw config patch` com arquivo JSON

**Logs para diagnóstico:**
```powershell
# Verificar logs do gateway
Get-Content "$env:USERPROFILE\.openclaw\logs\gateway.log" -Tail 20

# Verificar configuração atual
pnpm openclaw config get agents.defaults.sandbox
pnpm openclaw config get tools.deny
```

## 🎯 PRÓXIMOS PASSOS (APÓS CORREÇÕES)

### **Imediato (hoje):**
1. ✅ Aplicar correções de segurança
2. ✅ Verificar auditoria limpa (0 critical)
3. ⏳ Aguardar resposta Google sobre conta `flavius9ia`

### **Curto prazo (1-2 dias):**
1. **Se conta liberada:** Testar skills nela (zero risco)
2. **Se não liberada:** Criar conta Google secundária
3. Instalar `google-calendar` na conta de teste
4. Validar sandboxing funciona

### **Médio prazo (3-5 dias):**
1. Migrar skills testadas para sua conta principal
2. Configurar Heartbeat proativo
3. Implementar monitoramento de email
4. Testar fluxo completo JARVIS

## ⚠️ AVISOS IMPORTANTES

**NÃO PULE ESTAS ETAPAS:**
- ❌ Nunca instale skills sem sandboxing ativo
- ❌ Nunca use conta principal sem teste em secundária
- ❌ Nunca dê permissões write/delete inicialmente
- ❌ Nunca desative logging durante testes

**SEGURANÇA PRIMEIRO, FUNCIONALIDADE DEPOIS.**

---

**Preparado:** 2026-02-15 15:30 UTC  
**Status:** 🔴 **Aguardando aplicação das correções**  
**Próxima ação:** **Você executar os comandos de correção**