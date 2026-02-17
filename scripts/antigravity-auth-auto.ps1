#Requires -Version 5.1
<#
.SYNOPSIS
    Autenticação Automática Antigravity para eng.flavio.barros@gmail.com
.DESCRIPTION
    Configura servidor OAuth local, abre navegador e guia o usuário através da autenticação Google.
#>

$ErrorActionPreference = "Stop"

# Configurações
$OAuthPort = 51121
$OAuthUrl = "http://localhost:$OAuthPort"
$TargetEmail = "eng.flavio.barros@gmail.com"
$TempDir = "$env:TEMP\antigravity-auth"
$ServerFile = "$TempDir\oauth-server.js"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Header {
    Clear-Host
    Write-ColorOutput Green "=========================================="
    Write-ColorOutput Green "  AUTENTICAÇÃO ANTIGRAVITY - AUTOMÁTICA"
    Write-ColorOutput Green "=========================================="
    Write-Output ""
    Write-ColorOutput Yellow "Conta: $TargetEmail"
    Write-Output ""
}

function Test-NodeJS {
    Write-ColorOutput Cyan "[1/5] Verificando Node.js..."
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "      ✅ Node.js encontrado: $nodeVersion"
            return $true
        }
    } catch {}
    
    Write-ColorOutput Red "      ❌ Node.js não encontrado!"
    Write-Output ""
    Write-ColorOutput Yellow "Instale o Node.js:"
    Write-Output "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    Write-Output ""
    Read-Host "Pressione ENTER para abrir o download..."
    Start-Process "https://nodejs.org/"
    exit 1
}

function Install-OAuthServer {
    Write-ColorOutput Cyan "[2/5] Preparando servidor OAuth..."
    
    # Criar diretório temporário
    if (!(Test-Path $TempDir)) {
        New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    }
    
    # Criar arquivo do servidor OAuth
    $serverCode = @'
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const PORT = 51121;
const TARGET_EMAIL = 'eng.flavio.barros@gmail.com';
const CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const REDIRECT_URI = `http://localhost:${PORT}/oauth-callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cclog',
  'https://www.googleapis.com/auth/experimentsandconfigs'
].join(' ');

const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
const state = crypto.randomBytes(16).toString('hex');

function log(level, msg) {
  const colors = { ERROR: '\x1b[31m', SUCCESS: '\x1b[32m', INFO: '\x1b[36m', reset: '\x1b[0m' };
  console.log(`${colors[level] || colors.INFO}[${new Date().toLocaleTimeString()}] [${level}]${colors.reset} ${msg}`);
}

function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
    access_type: 'offline',
    prompt: 'consent',
    login_hint: TARGET_EMAIL
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) resolve(response);
          else reject(new Error(response.error_description || 'Falha'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getEmailFromToken(accessToken) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: '/oauth2/v2/userinfo',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data).email); } catch { resolve(TARGET_EMAIL); }
      });
    });
    req.on('error', () => resolve(TARGET_EMAIL));
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (url.pathname === '/oauth-callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1 style="color:red">Erro: ${error}</h1>`);
      return;
    }
    
    if (!code) {
      res.writeHead(400);
      res.end('Código não encontrado');
      return;
    }
    
    try {
      log('SUCCESS', 'Código recebido! Trocando por tokens...');
      const tokenData = await exchangeCodeForTokens(code);
      const email = await getEmailFromToken(tokenData.access_token);
      
      // Salvar arquivo
      const config = {
        accounts: [{
          email: email,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          projectId: 'ancient-botany-qz2vf',
          expiresAt: Date.now() + (tokenData.expires_in * 1000)
        }]
      };
      
      const configPath = `${process.env.USERPROFILE}\\.openclaw\\antigravity-config.json`;
      fs.mkdirSync(`${process.env.USERPROFILE}\\.openclaw`, { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      log('SUCCESS', `Tokens salvos em: ${configPath}`);
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>✅ Sucesso!</title></head>
          <body style="font-family:Arial;text-align:center;padding:50px;background:#f5f5f5;">
            <div style="background:white;padding:40px;border-radius:10px;max-width:500px;margin:0 auto;">
              <h1 style="color:#4CAF50;">✅ Autenticação Completa!</h1>
              <p><strong>Conta:</strong> ${email}</p>
              <p>Tokens salvos com sucesso.</p>
              <p style="background:#e3f2fd;padding:15px;border-radius:5px;margin:20px 0;">
                <strong>Próximo passo:</strong><br>
                Copie o arquivo:<br>
                <code style="background:#f0f0f0;padding:2px 5px;">%USERPROFILE%\\.openclaw\\antigravity-config.json</code><br><br>
                Para o container em:<br>
                <code style="background:#f0f0f0;padding:2px 5px;">/home/node/.openclaw/workspace/antigravity-config.json</code>
              </p>
            </div>
          </body>
        </html>
      `);
      
      log('SUCCESS', '=== AUTENTICAÇÃO CONCLUÍDA ===');
      setTimeout(() => process.exit(0), 2000);
      
    } catch (e) {
      log('ERROR', `Falha: ${e.message}`);
      res.writeHead(500);
      res.end(`<h1>Erro:</h1><p>${e.message}</p>`);
    }
    return;
  }
  
  if (url.pathname === '/') {
    const authUrl = getAuthUrl();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Antigravity Auth - ${TARGET_EMAIL}</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; } h2 { color: #666; font-weight: normal; }
            .instructions { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background: #4285f4; color: white; padding: 15px 30px; 
                   text-decoration: none; border-radius: 4px; font-size: 16px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107; }
            .center { text-align: center; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔐 Autenticação Antigravity</h1>
            <h2>Conta: <code>${TARGET_EMAIL}</code></h2>
            <div class="instructions">
              <h3>📋 Clique no botão abaixo para autenticar:</h3>
            </div>
            <div class="center">
              <a href="${authUrl}" class="btn">🔐 Autorizar com Google</a>
            </div>
            <div class="warning">
              <strong>⚠️ Use APENAS:</strong> <code>${TARGET_EMAIL}</code>
            </div>
          </div>
        </body>
      </html>
    `);
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  log('SUCCESS', `🚀 Servidor OAuth rodando em http://localhost:${PORT}`);
  log('INFO', `Abra no navegador: http://localhost:${PORT}`);
});
'@

    # Salvar arquivo
    $serverCode | Out-File -FilePath $ServerFile -Encoding UTF8
    
    Write-ColorOutput Green "      ✅ Servidor OAuth criado"
}

function Start-OAuthServer {
    Write-ColorOutput Cyan "[3/5] Iniciando servidor OAuth..."
    
    # Verificar se porta está em uso
    $portInUse = Get-NetTCPConnection -LocalPort $OAuthPort -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-ColorOutput Yellow "      ⚠️ Porta $OAuthPort em uso. Tentando encerrar processo..."
        Get-Process | Where-Object { $_.ProcessName -match "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # Iniciar servidor em background
    $proc = Start-Process -FilePath "node" -ArgumentList $ServerFile -WindowStyle Hidden -PassThru
    
    # Aguardar inicialização
    $maxAttempts = 30
    $attempt = 0
    $started = $false
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $OAuthUrl -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $started = $true
                break
            }
        } catch {}
        
        Start-Sleep -Milliseconds 500
        $attempt++
        Write-Host -NoNewline "."
    }
    
    Write-Output ""
    
    if ($started) {
        Write-ColorOutput Green "      ✅ Servidor iniciado (PID: $($proc.Id))"
    } else {
        Write-ColorOutput Red "      ❌ Falha ao iniciar servidor"
        exit 1
    }
}

function Open-Browser {
    Write-ColorOutput Cyan "[4/5] Abrindo navegador..."
    Start-Process "chrome.exe" $OAuthUrl
    Start-Process "msedge.exe" $OAuthUrl -ErrorAction SilentlyContinue
    Write-ColorOutput Green "      ✅ Navegador aberto"
}

function Wait-ForAuth {
    Write-ColorOutput Cyan "[5/5] Aguardando autenticação..."
    Write-Output ""
    Write-ColorOutput Yellow "INSTRUÇÕES:"
    Write-Output "1. No navegador que abriu, clique em 'Autorizar com Google'"
    Write-Output "2. Faça login com: $TargetEmail"
    Write-Output "3. Autorize o acesso ao Cloud Code"
    Write-Output "4. Aguarde a mensagem de sucesso"
    Write-Output ""
    Write-ColorOutput Yellow "O servidor fecha automaticamente após autenticação."
    Write-Output ""
    
    # Monitorar arquivo de config
    $configPath = "$env:USERPROFILE\.openclaw\antigravity-config.json"
    $timeout = 300  # 5 minutos
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        if (Test-Path $configPath) {
            Write-Output ""
            Write-ColorOutput Green "=========================================="
            Write-ColorOutput Green "  ✅ AUTENTICAÇÃO CONCLUÍDA!"
            Write-ColorOutput Green "=========================================="
            Write-Output ""
            Write-ColorOutput Yellow "Arquivo de tokens criado:"
            Write-Output $configPath
            Write-Output ""
            Write-ColorOutput Yellow "PRÓXIMO PASSO:"
            Write-Output "Copie este arquivo para o container em:"
            Write-Output "/home/node/.openclaw/workspace/antigravity-config.json"
            Write-Output ""
            Read-Host "Pressione ENTER para abrir a pasta..."
            Start-Process "explorer.exe" "$env:USERPROFILE\.openclaw"
            return
        }
        
        Start-Sleep -Seconds 1
        $elapsed++
        
        if ($elapsed % 10 -eq 0) {
            Write-Host -NoNewline "."
        }
    }
    
    Write-Output ""
    Write-ColorOutput Red "⏰ Timeout após 5 minutos"
    Write-ColorOutput Yellow "Verifique se concluiu a autenticação no navegador"
}

# EXECUÇÃO PRINCIPAL
Show-Header
Test-NodeJS
Install-OAuthServer
Start-OAuthServer
Open-Browser
Wait-ForAuth

Write-Output ""
Write-ColorOutput Green "=========================================="
Write-ColorOutput Green "  SCRIPT CONCLUÍDO"
Write-ColorOutput Green "=========================================="
Read-Host "Pressione ENTER para sair"
