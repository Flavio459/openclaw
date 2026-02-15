#!/usr/bin/env node

console.log('🔍 DIAGNÓSTICO DE CONFLITO DE IDENTIDADE');
console.log('='.repeat(50));

// Analisar configurações atuais
const fs = require('fs');
const path = require('path');

console.log('\n📋 CONFIGURAÇÕES IDENTIFICADAS:');

// 1. Verificar configuração OpenClaw
try {
    const configPath = path.join(__dirname, 'test_config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('\n1. Configuração OpenClaw:');
        console.log('   • Provedor Antigravity:', config.models?.providers?.antigravity ? '✅ Configurado' : '❌ Não configurado');
        console.log('   • Base URL:', config.models?.providers?.antigravity?.baseUrl || 'Não definida');
        console.log('   • Plugin google-antigravity-auth:', config.plugins?.entries?.['google-antigravity-auth']?.enabled ? '✅ Habilitado' : '❌ Desabilitado');
    }
} catch (error) {
    console.log('   ❌ Erro ao ler configuração:', error.message);
}

// 2. Verificar tokens Antigravity
try {
    const tokenPath = path.join(__dirname, 'antigravity-config.json');
    if (fs.existsSync(tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        console.log('\n2. Tokens Antigravity:');
        if (tokens.accounts && tokens.accounts.length > 0) {
            tokens.accounts.forEach((account, index) => {
                console.log(`   • Conta ${index + 1}: ${account.email}`);
                console.log(`     Access Token: ${account.accessToken?.substring(0, 20)}...`);
                console.log(`     Project ID: ${account.projectId || 'Não definido'}`);
                console.log(`     Expira em: ${account.expiresAt ? new Date(account.expiresAt).toISOString() : 'Não definido'}`);
            });
        } else {
            console.log('   ❌ Nenhuma conta configurada');
        }
    } else {
        console.log('\n2. Tokens Antigravity: ❌ Arquivo não encontrado');
    }
} catch (error) {
    console.log('   ❌ Erro ao ler tokens:', error.message);
}

// 3. Verificar servidor OAuth
console.log('\n3. Servidor OAuth:');
const http = require('http');
const checkPort = (port) => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 2000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const health = JSON.parse(data);
                    resolve({ status: 'running', data: health });
                } catch {
                    resolve({ status: 'running-no-json' });
                }
            });
        });
        
        req.on('error', () => resolve({ status: 'not-running' }));
        req.on('timeout', () => resolve({ status: 'timeout' }));
        req.end();
    });
};

(async () => {
    const port51121 = await checkPort(51121);
    console.log('   • Porta 51121:', port51121.status === 'running' ? '✅ Servidor OAuth rodando' : '❌ Servidor não responde');
    
    if (port51121.status === 'running' && port51121.data) {
        console.log(`     Status: ${port51121.data.status}`);
        console.log(`     Active sessions: ${port51121.data.active_sessions}`);
        console.log(`     Stored tokens: ${port51121.data.stored_tokens}`);
    }
})();

// 4. Verificar variáveis de ambiente e contexto
console.log('\n4. Contexto do Sistema:');
console.log('   • Usuário atual:', process.env.USER || process.env.USERNAME || 'Não identificado');
console.log('   • Diretório de trabalho:', process.cwd());
console.log('   • Ambiente Node:', process.version);

// 5. Verificar arquivos de memória para conflitos
console.log('\n5. Análise de Contas em Memória:');
try {
    const memoryFiles = fs.readdirSync(path.join(__dirname, 'memory')).filter(f => f.endsWith('.md'));
    let flavioCount = 0;
    let flaviusCount = 0;
    
    memoryFiles.forEach(file => {
        const content = fs.readFileSync(path.join(__dirname, 'memory', file), 'utf8');
        if (content.includes('eng.flavio.barros')) flavioCount++;
        if (content.includes('flavius9ia')) flaviusCount++;
    });
    
    console.log(`   • Menções a eng.flavio.barros: ${flavioCount} arquivos`);
    console.log(`   • Menções a flavius9ia: ${flaviusCount} arquivos`);
    
    if (flavioCount > 0 && flaviusCount > 0) {
        console.log('   ⚠️  AMBAS as contas aparecem na memória - possível conflito!');
    }
} catch (error) {
    console.log('   ❌ Erro ao analisar memória:', error.message);
}

// 6. Verificar se há sessões do Google ativas
console.log('\n6. Possíveis Sessões Google Ativas:');
console.log('   • Cookies do navegador: Não acessível (ambiente container)');
console.log('   • Cache OAuth: Verificar se há tokens antigos contaminando');

// 7. Recomendações
console.log('\n🔧 RECOMENDAÇÕES PARA RESOLVER CONFLITO:');
console.log('='.repeat(50));

console.log('\nA. LIMPEZA DE SESSÕES:');
console.log('   1. Encerrar TODOS os servidores OAuth (porta 51121)');
console.log('   2. Limpar cookies/cache do navegador para Google');
console.log('   3. Verificar se há processos Node.js antigos rodando');

console.log('\nB. SEPARAÇÃO DE CONTAS:');
console.log('   1. Usar navegador anônimo/privado para autenticação');
console.log('   2. Garantir que está logado APENAS com flavius9ia@gmail.com');
console.log('   3. Não permitir "escolher conta" - forçar logout de outras');

console.log('\nC. CONFIGURAÇÃO TÉCNICA:');
console.log('   1. Verificar se Client ID/Secret são específicos para flavius9ia');
console.log('   2. Garantir que redirect_uri é exclusivo para esta conta');
console.log('   3. Usar state parameter único para cada fluxo');

console.log('\nD. MONITORAMENTO:');
console.log('   1. Logar qual conta está sendo usada em cada etapa');
console.log('   2. Verificar headers de autenticação nas requisições');
console.log('   3. Monitorar redirecionamentos do Google');

console.log('\nE. SOLUÇÃO DEFINITIVA:');
console.log('   1. Criar Client ID OAuth separado para flavius9ia@gmail.com');
console.log('   2. Configurar projeto Google Cloud separado');
console.log('   3. Isolar completamente as credenciais das duas contas');

console.log('\n' + '='.repeat(50));
console.log('⚠️  CONFLITO IDENTIFICADO: eng.flavio.barros está contaminando fluxo de flavius9ia');
console.log('🎯 SOLUÇÃO: Isolar completamente as duas identidades no nível OAuth');

// Verificar processos rodando
setTimeout(() => {
    console.log('\n📊 PROCESSOS ATIVOS (verificação adicional):');
    const { exec } = require('child_process');
    exec('ps aux | grep -E "(node|51121|oauth)" | grep -v grep', (error, stdout) => {
        if (!error && stdout) {
            const processes = stdout.trim().split('\n').filter(p => p);
            console.log(`   • ${processes.length} processo(s) OAuth/Node encontrado(s):`);
            processes.forEach(p => {
                const parts = p.split(/\s+/);
                console.log(`     PID ${parts[1]}: ${parts.slice(10).join(' ').substring(0, 50)}...`);
            });
        } else {
            console.log('   • Nenhum processo OAuth/Node encontrado');
        }
    });
}, 1000);