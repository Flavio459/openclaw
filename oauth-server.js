/**
 * Servidor OAuth para Antigravity - Conta eng.flavio.barros@gmail.com
 * Gera URL de autorização e captura código de callback
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const PORT = 51121;
const TARGET_EMAIL = 'eng.flavio.barros@gmail.com';

// Configurações OAuth
const CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const REDIRECT_URI = `http://localhost:${PORT}/oauth-callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cclog',
  'https://www.googleapis.com/auth/experimentsandconfigs'
].join(' ');

// PKCE
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
const state = crypto.randomBytes(16).toString('hex');

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(level, msg) {
  const color = level === 'ERROR' ? colors.red : level === 'SUCCESS' ? colors.green : colors.cyan;
  console.log(`${color}[${new Date().toISOString()}] [${level}]${colors.reset} ${msg}`);
}

// Construir URL de autorização
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

// Trocar código por tokens
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

    log('INFO', 'Trocando código por tokens...');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response);
          } else {
            reject(new Error(response.error_description || 'Falha na troca de tokens'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Obter email do token
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
        try {
          const userInfo = JSON.parse(data);
          resolve(userInfo.email);
        } catch (e) {
          resolve(TARGET_EMAIL);
        }
      });
    });

    req.on('error', () => resolve(TARGET_EMAIL));
    req.end();
  });
}

// Salvar tokens
function saveTokens(tokenData, email) {
  const config = {
    accounts: [{
      email: email,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      projectId: 'ancient-botany-qz2vf',
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    }]
  };
  
  fs.writeFileSync('/home/node/.openclaw/workspace/antigravity-config.json', JSON.stringify(config, null, 2));
  log('SUCCESS', `✅ Tokens salvos para ${email}`);
  log('INFO', `📁 Arquivo: /home/node/.openclaw/workspace/antigravity-config.json`);
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Callback OAuth
  if (url.pathname === '/oauth-callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const returnedState = url.searchParams.get('state');
    
    if (error) {
      log('ERROR', `❌ Erro OAuth: ${error}`);
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ Erro: ${error}</h1><p>Feche esta janela.</p>`);
      return;
    }
    
    if (!code) {
      res.writeHead(400);
      res.end('Código não encontrado');
      return;
    }
    
    if (returnedState !== state) {
      log('ERROR', '❌ State mismatch - possível ataque CSRF');
      res.writeHead(403);
      res.end('State inválido');
      return;
    }
    
    log('SUCCESS', `✅ Código recebido: ${code.substring(0, 20)}...`);
    
    try {
      const tokenData = await exchangeCodeForTokens(code);
      const email = await getEmailFromToken(tokenData.access_token);
      saveTokens(tokenData, email);
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>✅ Autenticação Completa</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50;">✅ Autenticação Bem-Sucedida!</h1>
              <p><strong>Conta:</strong> ${email}</p>
              <p style="color: #666;">Tokens salvos com sucesso.</p>
              <p>O Antigravity está pronto para uso!</p>
              <hr>
              <p><small>Você pode fechar esta janela.</small></p>
            </div>
          </body>
        </html>
      `);
      
      log('SUCCESS', '🎉 Autenticação completa! Antigravity pronto para uso.');
      
    } catch (e) {
      log('ERROR', `❌ Falha ao trocar código: ${e.message}`);
      res.writeHead(500);
      res.end(`<h1>❌ Erro:</h1><p>${e.message}</p>`);
    }
    return;
  }
  
  // Página inicial
  if (url.pathname === '/') {
    const authUrl = getAuthUrl();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Antigravity OAuth - ${TARGET_EMAIL}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 10px; }
            h2 { color: #666; font-weight: normal; margin-bottom: 30px; }
            .instructions { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background: #4285f4; color: white; padding: 15px 30px; 
                   text-decoration: none; border-radius: 4px; font-size: 16px; margin: 20px 0; }
            .btn:hover { background: #3367d6; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .center { text-align: center; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔐 Autenticação Antigravity</h1>
            <h2>Conta: <code>${TARGET_EMAIL}</code></h2>
            
            <div class="instructions">
              <h3>📋 Passos:</h3>
              <ol>
                <li>Clique no botão azul abaixo para abrir o Google</li>
                <li>Faça login com <strong>${TARGET_EMAIL}</strong></li>
                <li>Autorize o acesso ao <strong>Cloud Code</strong></li>
                <li>Aguarde o redirecionamento automático</li>
              </ol>
            </div>
            
            <div class="center">
              <a href="${authUrl}" class="btn">🔐 Autorizar com Google</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Use APENAS a conta <code>${TARGET_EMAIL}</code></li>
                <li>Não troque para outra conta durante o fluxo</li>
                <li>Se aparecer "Escolher conta", selecione <code>${TARGET_EMAIL}</code></li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              Estado: <code>${state}</code><br>
              Redirect URI: <code>${REDIRECT_URI}</code>
            </p>
          </div>
        </body>
      </html>
    `);
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// Iniciar servidor
server.listen(PORT, () => {
  log('SUCCESS', `🚀 Servidor OAuth rodando na porta ${PORT}`);
  log('INFO', `📧 Conta alvo: ${TARGET_EMAIL}`);
  log('INFO', `🌐 Abra no navegador: http://localhost:${PORT}`);
  log('INFO', `🔗 URL direta: ${getAuthUrl()}`);
});
