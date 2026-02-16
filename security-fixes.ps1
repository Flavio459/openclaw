# SECURITY-FIXES.PS1
# Script para aplicar correções de segurança OpenClaw
# Execute no PowerShell como Administrador

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "OPENCLAW SECURITY FIXES APPLICATOR" -ForegroundColor Cyan
Write-Host "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. VERIFICAR AMBIENTE
Write-Host "`n[1/6] VERIFICANDO AMBIENTE..." -ForegroundColor Yellow
$openclawVersion = openclaw --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ OpenClaw CLI não encontrado no PATH" -ForegroundColor Red
    Write-Host "Execute: cd 'w:\workspaces antigravity\OpenClaw' primeiro" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ OpenClaw encontrado: $openclawVersion" -ForegroundColor Green

# 2. AUDITORIA INICIAL
Write-Host "`n[2/6] EXECUTANDO AUDITORIA INICIAL..." -ForegroundColor Yellow
openclaw security audit
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Auditoria com warnings/critical issues" -ForegroundColor Yellow
}

# 3. APLICAR SANDBOXING GLOBAL
Write-Host "`n[3/6] APLICANDO SANDBOXING GLOBAL..." -ForegroundColor Yellow
Write-Host "Configurando: agents.defaults.sandbox.mode = 'all'" -ForegroundColor Gray
openclaw config set agents.defaults.sandbox.mode all
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sandboxing global ativado" -ForegroundColor Green
} else {
    Write-Host "❌ Falha ao configurar sandboxing" -ForegroundColor Red
}

# 4. RESTRINGIR FERRAMENTAS PERIGOSAS
Write-Host "`n[4/6] RESTRINGINDO FERRAMENTAS PERIGOSAS..." -ForegroundColor Yellow
Write-Host "Configurando: tools.deny = ['group:web','browser']" -ForegroundColor Gray
openclaw config set tools.deny '["group:web","browser"]' --json
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Ferramentas perigosas restringidas" -ForegroundColor Green
} else {
    Write-Host "❌ Falha ao restringir ferramentas" -ForegroundColor Red
}

# 5. REMOVER MODELO PEQUENO (OPCIONAL)
Write-Host "`n[5/6] REMOVENDO MODELO PEQUENO DOS FALLBACKS..." -ForegroundColor Yellow
Write-Host "Modelo: openrouter/google/gemma-3-12b-it:free (12B)" -ForegroundColor Gray
Write-Host "Deseja remover? (S/N): " -ForegroundColor Yellow -NoNewline
$removeModel = Read-Host
if ($removeModel -eq "S" -or $removeModel -eq "s") {
    openclaw config remove agents.defaults.model.fallbacks[2]
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Modelo pequeno removido dos fallbacks" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Não foi possível remover (pode não existir)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Modelo mantido (sandboxing deve proteger)" -ForegroundColor Gray
}

# 6. REINICIAR GATEWAY
Write-Host "`n[6/6] REINICIANDO GATEWAY..." -ForegroundColor Yellow
Write-Host "Reiniciando para aplicar configurações..." -ForegroundColor Gray
openclaw gateway restart
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gateway reiniciado com sucesso" -ForegroundColor Green
} else {
    Write-Host "⚠️ Gateway pode já estar reiniciando" -ForegroundColor Yellow
}

# 7. AUDITORIA FINAL
Write-Host "`n[AUDITORIA FINAL] VERIFICANDO CORREÇÕES..." -ForegroundColor Cyan
Start-Sleep -Seconds 5  # Aguardar gateway iniciar
openclaw security audit
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Alguns issues podem persistir" -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASSOS RECOMENDADOS:" -ForegroundColor Cyan
Write-Host "1. Aguardar resposta do Google sobre conta flavius9ia" -ForegroundColor White
Write-Host "2. Se liberada: testar skills nela (zero risco)" -ForegroundColor White
Write-Host "3. Se não: criar conta Google secundária para testes" -ForegroundColor White
Write-Host "4. NUNCA instalar skills sem sandboxing ativo" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`nScript concluído. Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")