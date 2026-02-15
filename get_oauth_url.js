const { spawn } = require('child_process');
const fs = require('fs');

const proc = spawn('npx', ['antigravity-claude-proxy@latest', 'accounts', 'add', '--no-browser'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let urlFound = false;

proc.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  
  // Look for URL pattern
  const urlMatch = text.match(/https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth[^\s]+/);
  if (urlMatch && !urlFound) {
    urlFound = true;
    console.log('📋 NOVA URL DE AUTENTICAÇÃO:');
    console.log(urlMatch[0]);
    console.log('\n📝 Instruções:');
    console.log('1. Abra esta URL no browser');
    console.log('2. Faça login com flavius9ia@gmail.com');
    console.log('3. Autorize os escopos');
    console.log('4. Copie a URL de redirecionamento (com erro localhost)');
    console.log('5. Cole aqui no chat');
    
    // Save to file for reference
    fs.writeFileSync('/tmp/antigravity_oauth_url.txt', urlMatch[0]);
    
    // Kill the process since we got what we need
    proc.kill('SIGINT');
  }
});

proc.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

proc.on('close', (code) => {
  if (!urlFound) {
    console.log('Não encontrei a URL na saída. Saída completa:');
    console.log(output);
  }
});