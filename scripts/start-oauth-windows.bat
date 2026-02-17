@echo off
chcp 65001 >nul
echo ========================================
echo  AUTENTICAÇÃO ANTIGRAVITY - Windows
echo  Conta: eng.flavio.barros@gmail.com
echo ========================================
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js não encontrado!
    echo Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js encontrado

:: Verificar arquivo oauth-server.js
if not exist "oauth-server.js" (
    echo [ERRO] oauth-server.js não encontrado!
    echo Certifique-se de copiar o arquivo do container.
    pause
    exit /b 1
)

echo [OK] Servidor OAuth encontrado
echo.
echo ========================================
echo Iniciando servidor...
echo Acesse: http://localhost:51121
echo ========================================
echo.

node oauth-server.js

pause
