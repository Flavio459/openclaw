@echo off
chcp 65001 >nul
title Autenticacao Antigravity - Automatico
cls

echo ========================================
echo  AUTENTICACAO ANTIGRAVITY - AUTOMATICO
echo ========================================
echo.
echo Conta: eng.flavio.barros@gmail.com
echo.

:: Verificar PowerShell
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] PowerShell nao encontrado!
    pause
    exit /b 1
)

echo [OK] PowerShell encontrado
echo.
echo Iniciando script de autenticacao...
echo.

:: Baixar e executar script
powershell -ExecutionPolicy Bypass -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm 'https://raw.githubusercontent.com/Flavio459/openclaw/flavius-environment/scripts/antigravity-auth-auto.ps1' | iex}"

pause
