const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== DIAGNÓSTICO PROFUNDO DO PLUGIN GOOGLE-ANTIGRAVITY-AUTH ===\n');

// 1. Verificar estrutura do plugin
console.log('1. ESTRUTURA DO PLUGIN:');
const pluginDir = '/app/extensions/google-antigravity-auth';
console.log(`   Diretório: ${pluginDir}`);
console.log(`   Existe: ${fs.existsSync(pluginDir)}`);

if (fs.existsSync(pluginDir)) {
  const files = fs.readdirSync(pluginDir);
  console.log(`   Arquivos: ${files.join(', ')}`);
  
  // Verificar package.json
  const pkgPath = path.join(pluginDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`   Package: ${pkg.name}@${pkg.version}`);
  }
  
  // Verificar openclaw.plugin.json
  const pluginConfigPath = path.join(pluginDir, 'openclaw.plugin.json');
  if (fs.existsSync(pluginConfigPath)) {
    const pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8'));
    console.log(`   Plugin ID: ${pluginConfig.id}`);
    console.log(`   Providers: ${JSON.stringify(pluginConfig.providers)}`);
  }
}

// 2. Verificar se está no bundle
console.log('\n2. PRESENÇA NO BUNDLE:');
try {
  const grepResult = execSync('grep -r "google-antigravity-auth" /app/dist --include="*.js" | head -5', { encoding: 'utf8' });
  console.log('   Encontrado nos bundles:');
  console.log(grepResult.split('\n').map(line => `     ${line}`).join('\n'));
} catch (e) {
  console.log('   Não encontrado nos bundles (pode ser normal se carregado dinamicamente)');
}

// 3. Verificar configuração do sistema
console.log('\n3. CONFIGURAÇÃO DO SISTEMA:');
const configPath = '/home/node/.openclaw/openclaw.json';
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const pluginEnabled = config.plugins?.entries?.['google-antigravity-auth']?.enabled;
  console.log(`   Plugin habilitado na config: ${pluginEnabled}`);
  
  // Verificar se há outros plugins funcionando
  const enabledPlugins = Object.entries(config.plugins?.entries || {})
    .filter(([_, plugin]) => plugin.enabled)
    .map(([name]) => name);
  console.log(`   Plugins habilitados: ${enabledPlugins.join(', ')}`);
}

// 4. Verificar se o gateway está carregando plugins
console.log('\n4. PROCESSO DO GATEWAY:');
try {
  const pid = execSync("ps aux | grep 'openclaw-gateway' | grep -v grep | awk '{print $2}'", { encoding: 'utf8' }).trim();
  console.log(`   PID do gateway: ${pid}`);
  
  // Verificar arquivos abertos pelo processo
  try {
    const openFiles = execSync(`lsof -p ${pid} 2>/dev/null | grep -i plugin | head -5`, { encoding: 'utf8' });
    console.log('   Arquivos de plugin abertos:');
    console.log(openFiles.split('\n').map(line => `     ${line}`).join('\n'));
  } catch (e) {
    console.log('   Não foi possível verificar arquivos abertos');
  }
} catch (e) {
  console.log('   Não foi possível obter PID do gateway');
}

// 5. Testar compilação TypeScript do plugin
console.log('\n5. TESTE DE COMPILAÇÃO:');
const indexTsPath = path.join(pluginDir, 'index.ts');
if (fs.existsSync(indexTsPath)) {
  console.log(`   index.ts existe: Sim (${fs.statSync(indexTsPath).size} bytes)`);
  
  // Verificar sintaxe básica
  const content = fs.readFileSync(indexTsPath, 'utf8');
  const hasExport = content.includes('export default');
  const hasPluginDef = content.includes('antigravityPlugin');
  console.log(`   Tem export default: ${hasExport}`);
  console.log(`   Define antigravityPlugin: ${hasPluginDef}`);
  
  // Verificar imports críticos
  const missingImports = [];
  const requiredImports = [
    'createHash',
    'randomBytes',
    'createServer',
    'emptyPluginConfigSchema',
    'isWSL2Sync',
    'OpenClawPluginApi',
    'ProviderAuthContext'
  ];
  
  requiredImports.forEach(imp => {
    if (!content.includes(imp)) {
      missingImports.push(imp);
    }
  });
  
  if (missingImports.length > 0) {
    console.log(`   ⚠️  Imports possivelmente faltando: ${missingImports.join(', ')}`);
  } else {
    console.log(`   ✅ Todos os imports críticos presentes`);
  }
}

// 6. Verificar dependências
console.log('\n6. DEPENDÊNCIAS:');
const nodeModulesPath = '/app/node_modules';
const requiredDeps = [
  '@mariozechner/pi-ai',
  'google-auth-library'
];

requiredDeps.forEach(dep => {
  const depPath = path.join(nodeModulesPath, dep.split('/')[0]);
  if (fs.existsSync(depPath)) {
    console.log(`   ${dep}: ✅ Presente`);
  } else {
    console.log(`   ${dep}: ❌ Ausente (POSSÍVEL PROBLEMA)`);
  }
});

// 7. Verificar variáveis de ambiente
console.log('\n7. VARIÁVEIS DE AMBIENTE:');
const envVars = [
  'NODE_ENV',
  'OPENCLAW_PLUGIN_PATH',
  'OPENCLAW_EXTENSIONS_DIR'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${varName}: ${value || '(não definida)'}`);
});

console.log('\n=== CONCLUSÃO DO DIAGNÓSTICO ===');
console.log('\nPRÓXIMOS PASSOS:');
console.log('1. Verificar se o plugin está sendo compilado/carregado dinamicamente');
console.log('2. Verificar logs de inicialização do gateway');
console.log('3. Testar carregamento manual do plugin');
console.log('4. Implementar servidor OAuth profissional se necessário');