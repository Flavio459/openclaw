// Script para autenticação Antigravity via browser automation
// Controla Chrome no host Windows para fazer OAuth flow

const OAuthConfig = {
  clientId: '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com',
  redirectUri: 'http://localhost:51121/oauth-callback',
  scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
};

console.log('=== PLANO DE AUTENTICAÇÃO ANTIGRAVITY ===');
console.log('Problema: Container não pode executar openclaw models auth login');
console.log('Solução: Usar browser automation para controlar Chrome no host');
console.log('');
console.log('PASSO 1: Iniciar browser control no host');
console.log('  Comando: openclaw browser start --profile chrome');
console.log('');
console.log('PASSO 2: Abrir página de login Google');
console.log(`  URL: ${OAuthConfig.authUrl}`);
console.log(`  Parâmetros:`);
console.log(`    client_id: ${OAuthConfig.clientId}`);
console.log(`    redirect_uri: ${OAuthConfig.redirectUri}`);
console.log(`    scope: ${OAuthConfig.scope}`);
console.log(`    response_type: code`);
console.log(`    access_type: offline`);
console.log(`    prompt: consent`);
console.log('');
console.log('PASSO 3: Automatizar login');
console.log('  - Preencher email: eng.flavio.barros@gmail.com');
console.log('  - Preencher senha: [você fornece]');
console.log('  - Clicar "Avançar"');
console.log('  - Autorizar aplicação');
console.log('');
console.log('PASSO 4: Capturar código OAuth');
console.log('  - URL de callback contém ?code=...');
console.log('  - Extrair código');
console.log('  - Trocar por tokens');
console.log('');
console.log('PASSO 5: Configurar OpenClaw');
console.log('  - Salvar tokens em antigravity-config.json');
console.log('  - Reiniciar gateway');
console.log('');
console.log('=== COMANDOS PARA EXECUTAR ===');
console.log('');
console.log('1. No HOST Windows (PowerShell como Admin):');
console.log('   cd "w:\\workspaces antigravity\\OpenClaw"');
console.log('   pnpm openclaw browser start --profile chrome');
console.log('   # Aguardar badge "ON" na extensão Chrome');
console.log('');
console.log('2. No CONTAINER (eu executo):');
console.log('   # Usar browser tool para controlar Chrome do host');
console.log('   # Script de automação completo');
console.log('');
console.log('=== ALTERNATIVA SIMPLES ===');
console.log('');
console.log('Se browser automation for complexo:');
console.log('1. Você executa manualmente no host:');
console.log('   pnpm openclaw models auth login --provider google-antigravity');
console.log('2. Após autenticar, copie arquivos:');
console.log('   - %USERPROFILE%\\.openclaw\\credentials\\google-antigravity-auth.json');
console.log('   - Para container: /home/node/.openclaw/workspace/');
console.log('3. Eu configuro no container.');
console.log('');
console.log('=== PRÓXIMA AÇÃO ===');
console.log('Escolha uma abordagem e me informe.');