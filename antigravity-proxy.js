/**
 * Proxy Antigravity - Servidor de Modelos
 * 
 * Este proxy atua como intermediário entre OpenClaw e Google Antigravity API,
 * traduzindo chamadas Anthropic Messages API para o formato do Antigravity.
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const TOKEN_PATH = process.env.TOKEN_PATH || '/home/node/.openclaw/workspace/antigravity-config.json';

// Configurações do Antigravity
const ANTIGRAVITY_BASE_URL = 'daily-cloudcode-pa.sandbox.googleapis.com';

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const color = level === 'ERROR' ? colors.red : level === 'WARN' ? colors.yellow : colors.green;
  console.log(`${color}[${timestamp}] [${level}]${colors.reset} ${message}`);
}

// Carregar tokens
function loadTokens() {
  try {
    const data = fs.readFileSync(TOKEN_PATH, 'utf8');
    const config = JSON.parse(data);
    if (config.accounts && config.accounts.length > 0) {
      return config.accounts[0];
    }
  } catch (e) {
    log('ERROR', `Falha ao carregar tokens: ${e.message}`);
  }
  return null;
}

// Verificar se token expirou
function isTokenExpired(account) {
  if (!account.expiresAt) return true;
  return Date.now() >= account.expiresAt;
}

// Renovar token usando refresh token
async function refreshAccessToken(account) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: '970434256582-1b7k31lsf92ujng89bbdiev35mgt307h.apps.googleusercontent.com',
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token'
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
          if (response.access_token) {
            account.accessToken = response.access_token;
            account.expiresAt = Date.now() + (response.expires_in * 1000);
            
            // Salvar token atualizado
            const config = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
            config.accounts[0] = account;
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(config, null, 2));
            
            resolve(account);
          } else {
            reject(new Error(response.error_description || 'Falha ao renovar token'));
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

// Obter token válido
async function getValidToken() {
  let account = loadTokens();
  if (!account) throw new Error('Nenhuma conta configurada');
  
  if (isTokenExpired(account)) {
    log('INFO', 'Token expirado, renovando...');
    account = await refreshAccessToken(account);
    log('INFO', 'Token renovado com sucesso');
  }
  
  return account;
}

// Converter mensagens Anthropic para formato Antigravity
function convertAnthropicToAntigravity(body) {
  // Extrair mensagens
  const messages = body.messages || [];
  
  // Construir prompt combinado
  let prompt = '';
  if (body.system) {
    prompt += `System: ${body.system}\n\n`;
  }
  
  for (const msg of messages) {
    const role = msg.role === 'user' ? 'Human' : 'Assistant';
    prompt += `${role}: ${msg.content}\n\n`;
  }
  prompt += 'Assistant:';
  
  return {
    prompt: prompt,
    temperature: body.temperature || 0.7,
    max_tokens: body.max_tokens || 4096,
    model: body.model || 'claude-opus-4-5-thinking'
  };
}

// Fazer requisição para Antigravity API
async function callAntigravity(account, requestBody) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);
    
    const options = {
      hostname: ANTIGRAVITY_BASE_URL,
      port: 443,
      path: `/v1/projects/${account.projectId}/models/${requestBody.model}:predict`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'antigravity/1.15.8',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    log('INFO', `Chamando modelo: ${requestBody.model}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        log('INFO', `Resposta: ${res.statusCode}`);
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      log('ERROR', `Erro na requisição: ${err.message}`);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Converter resposta Antigravity para formato Anthropic
function convertAntigravityToAnthropic(antigravityResponse, modelId) {
  // Parse resposta
  const response = JSON.parse(antigravityResponse);
  
  // Extrair texto da resposta (formato pode variar)
  let content = '';
  if (response.predictions && response.predictions[0]) {
    content = response.predictions[0].content || response.predictions[0];
  } else if (response.content) {
    content = response.content;
  } else if (typeof response === 'string') {
    content = response;
  }
  
  return {
    id: `msg_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    model: modelId,
    content: [
      {
        type: 'text',
        text: content
      }
    ],
    usage: {
      input_tokens: response.input_tokens || 0,
      output_tokens: response.output_tokens || 0
    }
  };
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  const reqUrl = url.parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (reqUrl.pathname === '/health') {
    const account = loadTokens();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      authenticated: !!account,
      email: account?.email || null,
      token_expired: account ? isTokenExpired(account) : null
    }));
    return;
  }

  // Listar modelos
  if (reqUrl.pathname === '/v1/models' || reqUrl.pathname === '/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      object: 'list',
      data: [
        { id: 'claude-opus-4-5-thinking', object: 'model', owned_by: 'anthropic' },
        { id: 'claude-opus-4-6-thinking', object: 'model', owned_by: 'anthropic' },
        { id: 'gemini-3-pro-high', object: 'model', owned_by: 'google' },
        { id: 'gemini-3-flash', object: 'model', owned_by: 'google' }
      ]
    }));
    return;
  }

  // API Anthropic Messages
  if (reqUrl.pathname === '/v1/messages' || reqUrl.pathname === '/messages') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        log('INFO', `Requisição: ${requestData.model || 'unknown'}`);
        
        const account = await getValidToken();
        const antigravityRequest = convertAnthropicToAntigravity(requestData);
        
        const result = await callAntigravity(account, antigravityRequest);
        
        if (result.statusCode === 200) {
          const anthropicResponse = convertAntigravityToAnthropic(result.data, requestData.model);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(anthropicResponse));
        } else {
          log('ERROR', `Erro API: ${result.statusCode} - ${result.data}`);
          res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: result.data } }));
        }
      } catch (e) {
        log('ERROR', `Erro: ${e.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: e.message } }));
      }
    });
    return;
  }

  // Página inicial
  if (reqUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Antigravity Proxy</title></head>
        <body>
          <h1>🚀 Antigravity Proxy</h1>
          <p>Status: <a href="/health">Health Check</a></p>
          <p>Models: <a href="/v1/models">List Models</a></p>
          <hr>
          <p><strong>Configuração OpenClaw:</strong></p>
          <pre>
{
  "baseUrl": "http://localhost:${PORT}",
  "api": "anthropic-messages"
}
          </pre>
        </body>
      </html>
    `);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Iniciar servidor
server.listen(PORT, () => {
  log('INFO', `${colors.cyan}🚀 Antigravity Proxy rodando na porta ${PORT}${colors.reset}`);
  log('INFO', `Health check: http://localhost:${PORT}/health`);
  log('INFO', `Token path: ${TOKEN_PATH}`);
  
  const account = loadTokens();
  if (account) {
    log('INFO', `${colors.green}✅ Conta configurada: ${account.email}${colors.reset}`);
    if (isTokenExpired(account)) {
      log('WARN', `${colors.yellow}⚠️  Token expirado, será renovado automaticamente${colors.reset}`);
    }
  } else {
    log('WARN', `${colors.yellow}⚠️  Nenhuma conta configurada em ${TOKEN_PATH}${colors.reset}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('INFO', 'SIGTERM recebido, encerrando...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  log('INFO', 'SIGINT recebido, encerrando...');
  server.close(() => process.exit(0));
});
