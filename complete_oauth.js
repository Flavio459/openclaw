const { spawn } = require('child_process');
const readline = require('readline');

console.log('🚀 Iniciando processo completo de autenticação OAuth...\n');

// Primeiro, gerar a URL
const authProcess = spawn('npx', ['antigravity-claude-proxy@latest', 'accounts', 'add', '--no-browser'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let url = '';
let waitingForCode = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

authProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(text);
  
  // Capturar URL
  const urlMatch = text.match(/https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth[^\s]+/);
  if (urlMatch && !url) {
    url = urlMatch[0];
    console.log('\n✅ URL capturada!');
    console.log('📋 URL:', url);
    console.log('\n📝 Instruções para o Flávio:');
    console.log('1. Abra esta URL no browser');
    console.log('2. Login com flavius9ia@gmail.com');
    console.log('3. Autorize escopos');
    console.log('4. Copie URL de redirecionamento (localhost error)');
    console.log('5. Cole o código aqui');
  }
  
  // Verificar se está esperando código
  if (text.includes('Paste the callback URL or authorization code:')) {
    waitingForCode = true;
    console.log('\n⏳ Aguardando código OAuth...');
    
    // Pedir código ao usuário via readline
    rl.question('\n📥 Cole o código OAuth aqui: ', (code) => {
      // Extrair apenas o código se veio URL completa
      let cleanCode = code.trim();
      const codeMatch = code.match(/code=([^&]+)/);
      if (codeMatch) {
        cleanCode = codeMatch[1];
      }
      
      console.log(`📤 Enviando código: ${cleanCode.substring(0, 20)}...`);
      authProcess.stdin.write(cleanCode + '\n');
      rl.close();
    });
  }
});

authProcess.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

authProcess.on('close', (code) => {
  console.log(`\n📊 Processo finalizado com código: ${code}`);
  console.log('📄 Saída completa:', output);
  
  if (code === 0) {
    console.log('✅ Autenticação bem-sucedida!');
  } else {
    console.log('❌ Falha na autenticação');
  }
  
  process.exit(code);
});

// Lidar com Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Processo interrompido pelo usuário');
  authProcess.kill('SIGINT');
  rl.close();
  process.exit(0);
});