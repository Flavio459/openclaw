// Servidor OAuth para autenticação Antigravity
// Você autentica no browser, callback vem para container

const http = require('http');
const url = require('url');
const crypto = require('crypto');

const PORT = 51122;
const CLIENT_ID = '970434256582-1b7k31lsf92ujng89bbdiev35mgt307h.apps.googleusercontent.com';
const REDIRECT_URI = `http://localhost:${PORT}/oauth-callback`;

// Gerar PKCE code verifier e challenge
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
const state = crypto.randomBytes(16).toString('hex');

const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cclog',
  'https://www.googleapis.com/auth/experimentsandconfigs'
].join(' ');

// URL de autorização Google
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.append('client_id', CLIENT_ID);
authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', SCOPES);
authUrl.searchParams.append('code_challenge', codeChallenge);
authUrl.searchParams.append('code_challenge_method', 'S256');
authUrl.searchParams.append('state', state);
authUrl.searchParams.append('access_type', 'offline');
authUrl.searchParams.append('prompt', 'consent');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/') {
    // Página inicial com link para autenticação
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticação Antigravity</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 600px; margin: 0 auto; }
          .step { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { background: #4285f4; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 4px; display: inline-block; }
          .code { background: #333; color: #0f0; padding: 10px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Autenticação Antigravity</h1>
          
          <div class="step">
            <h2>PASSO 1: Clique no link abaixo</h2>
            <p>Isso abrirá a página de login do Google.</p>
            <a href="${authUrl.toString()}" class="button" target="_blank">
              🔗 Autenticar com Google
            </a>
          </div>
          
          <div class="step">
            <h2>PASSO 2: Faça login com</h2>
            <p><strong>eng.flavio.barros@gmail.com</strong></p>
            <p>Conta flavius9ia@gmail.com está bloqueada.</p>
          </div>
          
          <div class="step">
            <h2>PASSO 3: Autorize a aplicação</h2>
            <p>Aceite todas as permissões solicitadas.</p>
          </div>
          
          <div class="step">
            <h2>PASSO 4: Copie o código</h2>
            <p>Após autorizar, você será redirecionado para uma URL como:</p>
            <p class="code">http://localhost:51122/oauth-callback?code=4/0A...&state=...</p>
            <p><strong>Copie todo o código após <code>?code=</code></strong></p>
          </div>
          
          <div class="step">
            <h2>PASSO 5: Envie o código para mim</h2>
            <p>Cole o código copiado na conversa.</p>
            <p>Eu farei o exchange por tokens e configurarei o Antigravity.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  } else if (parsedUrl.pathname === '/oauth-callback') {
    // Callback do OAuth
    const code = parsedUrl.query.code;
    const receivedState = parsedUrl.query.state;
    
    if (code && receivedState === state) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Código Recebido</title></head>
        <body>
          <h1>✅ Código OAuth Recebido!</h1>
          <p>O código foi capturado com sucesso.</p>
          <p><strong>Código:</strong> ${code.substring(0, 50)}...</p>
          <p>Envie este código para o assistente configurar o Antigravity.</p>
          <script>
            // Auto-copy para facilitar
            navigator.clipboard.writeText("${code}").then(() => {
              document.body.innerHTML += '<p>✅ Código copiado para área de transferência!</p>';
            });
          </script>
        </body>
        </html>
      `);
      
      console.log('\n✅ CÓDIGO OAUTH RECEBIDO!');
      console.log(`Código: ${code}`);
      console.log('\nFAÇA O EXCHANGE POR TOKENS:');
      console.log('1. Use este código para obter access_token e refresh_token');
      console.log('2. Configure em antigravity-config.json');
      console.log('3. Reinicie o gateway');
      
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>❌ Erro no callback</h1><p>Parâmetros inválidos.</p>');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Página não encontrada</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor OAuth rodando em: http://localhost:${PORT}`);
  console.log(`📋 PKCE Code Verifier: ${codeVerifier}`);
  console.log(`🔑 Code Challenge: ${codeChallenge}`);
  console.log(`🛡️ State: ${state}`);
  console.log('\n=== INSTRUÇÕES PARA O USUÁRIO ===');
  console.log(`1. Acesse: http://localhost:${PORT}`);
  console.log('2. Clique no link "Autenticar com Google"');
  console.log('3. Faça login com eng.flavio.barros@gmail.com');
  console.log('4. Autorize a aplicação');
  console.log('5. Copie o código da URL de callback');
  console.log('6. Envie o código para mim');
  console.log('\n=== INFORMAÇÕES TÉCNICAS ===');
  console.log(`Client ID: ${CLIENT_ID}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
  console.log(`Scopes: ${SCOPES}`);
});

// Tratar shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor OAuth encerrado.');
  process.exit(0);
});