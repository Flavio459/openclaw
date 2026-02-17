# Autenticação Antigravity - Abordagem Profissional

## SITUAÇÃO
- Container: Onde o OpenClaw roda (servidor OAuth na porta 51121)
- Host Windows: Onde o navegador Chrome está disponível
- Objetivo: Autenticar eng.flavio.barros@gmail.com no Antigravity

## SOLUÇÃO PROFISSIONAL RECOMENDADA: Túnel SSH Reverso

### Por que esta abordagem?
1. **Segurança**: Token não transita pelo clipboard
2. **Automação**: Callback chega diretamente ao servidor OAuth
3. **Reutilizável**: Funciona para futuras renovações de token
4. **Padrão da indústria**: Usado em produção para expor serviços locais

### Implementação

#### PASSO 1: Configurar Túnel SSH (Host Windows)

No PowerShell como Admin:
```powershell
# Verificar se há conexão SSH disponível para o container
# O container está rodando em um host Linux/VPS

# Opção A: Se o container estiver em VPS remota
ssh -N -R 51121:localhost:51121 usuario@vps-ip

# Opção B: Se o container estiver em WSL2 local
ssh -N -R 51121:localhost:51121 node@localhost -p 2222
```

#### PASSO 2: Acessar URL de Autorização

Com o túnel ativo, abrir no Chrome do host:
```
http://localhost:51121
```

O servidor OAuth no container responderá como se estivesse local.

#### PASSO 3: Completar Fluxo

1. Clicar em "Autorizar com Google"
2. Fazer login com eng.flavio.barros@gmail.com
3. Autorizar acesso ao Cloud Code
4. O callback voltará para o container automaticamente

---

## ALTERNATIVA: Autenticação Direta no Host

Se o túnel não for viável, executar o servidor OAuth no próprio Windows:

### PASSO 1: Copiar arquivo para host
Copiar `oauth-server.js` do container para o host Windows

### PASSO 2: Executar no host
```powershell
node oauth-server.js
```

### PASSO 3: Acessar http://localhost:51121

### PASSO 4: Copiar tokens gerados de volta para o container
Arquivo: `antigravity-config.json`

---

## DECISÃO AUTOMÁTICA

Dado o contexto, vou preparar ambas as opções e deixar o usuário escolher apenas o método de conexão (túnel ou local), não a arquitetura.
