/**
 * Servidor OAuth para Antigravity - Conta eng.flavio.barros@gmail.com
 * Gera URL de autorização e captura código de callback
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const PORT = 51121;

// Configurações OAuth - Mesmo Client ID
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

// Armazenamento
let authCode = null;
let tokens = null;

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
    login_hint: 'eng.flavio.barros@gmail.com'  // Força sugestão desta conta
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

// Salvar tokens
function saveTokens(tokenData, email) {
  const config = {
    accounts: [{
      email: email,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      projectId: 'ancient-botany-qz2vf', // Mesmo project ID
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    }]
  };
  
  fs.writeFileSync('/home/node/.openclaw/workspace/antigravity-config.json', JSON.stringify(config, null, 2));
  log('SUCCESS', `Tokens salvos para ${email}`);
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Callback OAuth
  if (url.pathname === '/oauth-callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const returnedState = url.searchParams.get('state');
    
    if (error) {
      log('ERROR', `Erro OAuth: ${error}`);
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ Erro: ${error}</h1><p>Feche esta janela e tente novamente.</p>`);
      return;
    }
    
    if (!code) {
      res.writeHead(400);
      res.end('Código não encontrado');
      return;
    }
    
    if (returnedState !== state) {
      log('ERROR', 'State mismatch - possível ataque CSRF');
      res.writeHead(403);
      res.end('State inválido');
      return;
    }
    
    authCode = code;
    log('SUCCESS', `Código recebido: ${code.substring(0, 20)}...`);
    
    try {
      // Trocar código por tokens
      const tokenData = await exchangeCodeForTokens(code);
      tokens = tokenData;
      
      // Obter email do token
      const email = await getEmailFromToken(tokenData.access_token);
      saveTokens(tokenData, email);
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>✅ Autenticação Completa</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>✅ Autenticação Bem-Sucedida!</h1>
            <p><strong>Conta:</strong> ${email}</p>
            <p>Tokens salvos com sucesso.</p>
            <p>Você pode fechar esta janela.</p>
            <hr>
            <p><small>Access Token: ${tokenData.access_token.substring(0, 20)}...</small></p>
          </body>
        </html>
      `);
      
      log('SUCCESS', 'Autenticação completa! Pode fechar o servidor.');
      
    } catch (e) {
      log('ERROR', `Falha ao trocar código: ${e.message}`);
      res.writeHead(500);
      res.end(`<h1>❌ Erro:</h1><p>${e.message}</p>`);
    }
    return;
  }
  
  // Página inicial com instruções
  if (url.pathname === '/') {
    const authUrl = getAuthUrl();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Antigravity OAuth - eng.flavio.barros@gmail.com</title></head>
        <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1>🔐 Autenticação Antigravity</h1>
          <h2>Conta: eng.flavio.barros@gmail.com</h2>
          
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Instruções:</h3>
            <ol>
              <li>Clique no link abaixo para abrir a página de autorização Google</li>
              <li>Faça login com <strong>eng.flavio.barros@gmail.com</strong></li>
              <li>Autorize o acesso ao Cloud Code</li>
              <li>Aguarde o redirecionamento automático</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${authUrl}" 
               style="background: #4285f4; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 4px; font-size: 16px;">
              🔐 Autorizar com Google
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Use APENAS a conta eng.flavio.barros@gmail.com</li>
              <li>Não troque para outra conta durante o fluxo</li>
              <li>Se pedir para "escolher conta", selecione eng.flavio.barros@gmail.com</li>
            </ul>
          </div>
          
          <hr>
          <p><small>Estado: ${state}</small></p>
          <p><small>Redirect URI: ${REDIRECT_URI}</small></p>
        </body>
      </html>
    `);
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// Obter email do token
async function getEmailFromToken(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: '/oauth2/v2/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const userInfo = JSON.parse(data);
          resolve(userInfo.email);
        } catch (e) {
          resolve('eng.flavio.barros@gmail.com'); // Fallback
        }
      });
    });

    req.on('error', () => resolve('eng.flavio.barros@gmail.com'));
    req.end();
  });
}

// Iniciar servidor
server.listen(PORT, () => {
  log('SUCCESS', `Servidor OAuth rodando na porta ${PORT}`);
  log('INFO', `Abra no navegador: http://localhost:${PORT}`);
  log('INFO', `Ou diretamente: ${getAuthUrl()}`);
});
