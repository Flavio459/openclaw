# Configuração do Túnel SSH para Proxy Antigravity

Este guia descreve como configurar um túnel SSH seguro para o proxy Antigravity, com auto-reconexão e monitoramento.

## Pré-requisitos

- Acesso SSH à VPS
- Porta 8080 liberada no firewall da VPS
- Chave SSH configurada (recomendado)

## 1. Configuração da VPS

### 1.1 Liberar porta no firewall (UFW)

```bash
# Verificar status do firewall
sudo ufw status

# Liberar porta 8080
sudo ufw allow 8080/tcp

# Recarregar firewall
sudo ufw reload
```

### 1.2 Configurar SSH para aceitar túneis

Edite `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Adicione ou modifique:

```
GatewayPorts yes
AllowTcpForwarding yes
ClientAliveInterval 60
ClientAliveCountMax 3
```

Reinicie o SSH:

```bash
sudo systemctl restart sshd
```

## 2. Comando de Túnel SSH

### 2.1 Túnel Básico (Primeira vez)

```bash
ssh -N -R 8080:localhost:8080 usuario@vps.exemplo.com
```

### 2.2 Túnel Otimizado com Auto-reconexão

Crie o script `tunnel.sh`:

```bash
#!/bin/bash

VPS_USER="seu-usuario"
VPS_HOST="vps.exemplo.com"
VPS_PORT="22"
LOCAL_PORT="8080"
REMOTE_PORT="8080"
SSH_KEY="$HOME/.ssh/id_rsa"
LOG_FILE="$HOME/logs/antigravity-tunnel.log"

# Criar diretório de logs
mkdir -p "$(dirname "$LOG_FILE")"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Loop de reconexão
while true; do
    log "Iniciando túnel SSH para $VPS_HOST..."
    
    ssh -N \
        -R ${REMOTE_PORT}:localhost:${LOCAL_PORT} \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=10 \
        -i "$SSH_KEY" \
        -p "$VPS_PORT" \
        ${VPS_USER}@${VPS_HOST}
    
    EXIT_CODE=$?
    log "Túnel encerrado com código $EXIT_CODE. Reconectando em 5 segundos..."
    sleep 5
done
```

Torne executável:

```bash
chmod +x tunnel.sh
```

### 2.3 Opções do SSH Explicadas

| Opção | Descrição |
|-------|-----------|
| `-N` | Não executar comando remoto |
| `-R` | Forward reverso: porta_remota:host_local:porta_local |
| `-o ServerAliveInterval=60` | Envia keepalive a cada 60s |
| `-o ServerAliveCountMax=3` | Desconecta após 3 falhas de keepalive |
| `-o ExitOnForwardFailure=yes` | Sai se não conseguir fazer o forward |
| `-o StrictHostKeyChecking=no` | Aceita novos hosts automaticamente |
| `-o ConnectTimeout=10` | Timeout de conexão em 10s |

## 3. Configuração como Serviço (Systemd)

### 3.1 Criar serviço no sistema local

Crie o arquivo `/etc/systemd/system/antigravity-tunnel.service`:

```ini
[Unit]
Description=Antigravity SSH Tunnel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=%I
ExecStart=/bin/bash -c 'while true; do ssh -N -R 8080:localhost:8080 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=no usuario@vps.exemplo.com; sleep 5; done'
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 3.2 Usar autossh (Recomendado)

Instale o `autossh`:

```bash
# Ubuntu/Debian
sudo apt-get install autossh

# macOS
brew install autossh
```

Crie o serviço `/etc/systemd/system/antigravity-tunnel.service`:

```ini
[Unit]
Description=Antigravity SSH Tunnel (autossh)
After=network-online.target

[Service]
Environment="AUTOSSH_GATETIME=0"
Environment="AUTOSSH_POLL=60"
ExecStart=/usr/bin/autossh -M 0 -N -R 8080:localhost:8080 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes usuario@vps.exemplo.com
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3.3 Gerenciar o serviço

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Iniciar serviço
sudo systemctl start antigravity-tunnel

# Verificar status
sudo systemctl status antigravity-tunnel

# Habilitar início automático
sudo systemctl enable antigravity-tunnel

# Ver logs
sudo journalctl -u antigravity-tunnel -f
```

## 4. Monitoramento

### 4.1 Script de Monitoramento

Crie `monitor-tunnel.sh`:

```bash
#!/bin/bash

LOG_FILE="$HOME/logs/tunnel-monitor.log"
PID_FILE="$HOME/.antigravity-tunnel.pid"

# Verificar se túnel está ativo
check_tunnel() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0  # Está rodando
        fi
    fi
    return 1  # Não está rodando
}

# Log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar e reiniciar
if ! check_tunnel; then
    log "Túnel não está ativo. Reiniciando..."
    ./tunnel.sh &
    echo $! > "$PID_FILE"
    log "Túnel reiniciado (PID: $!)"
else
    # Testar conectividade
    if ! curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
        log "Túnel ativo mas sem resposta. Reiniciando..."
        kill $(cat "$PID_FILE") 2>/dev/null
        sleep 2
        ./tunnel.sh &
        echo $! > "$PID_FILE"
        log "Túnel reiniciado (PID: $!)"
    else
        log "Túnel OK"
    fi
fi
```

### 4.2 Adicionar ao Crontab

```bash
# Editar crontab
crontab -e

# Adicionar (verifica a cada 2 minutos)
*/2 * * * * /caminho/para/monitor-tunnel.sh
```

## 5. Segurança

### 5.1 Usar Chave SSH (Obrigatório)

```bash
# Gerar chave (se não tiver)
ssh-keygen -t ed25519 -C "antigravity-tunnel"

# Copiar para VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@vps.exemplo.com

# Testar
ssh -i ~/.ssh/id_ed25519 usuario@vps.exemplo.com
```

### 5.2 Restringir Usuário do Túnel (VPS)

Crie um usuário dedicado no servidor:

```bash
# Na VPS
sudo adduser tunneluser
sudo usermod -s /bin/false tunneluser  # Sem shell

# Adicionar chave pública
sudo mkdir -p /home/tunneluser/.ssh
sudo echo "ssh-ed25519 AAAA..." > /home/tunneluser/.ssh/authorized_keys
sudo chown -R tunneluser:tunneluser /home/tunneluser/.ssh
sudo chmod 700 /home/tunneluser/.ssh
sudo chmod 600 /home/tunneluser/.ssh/authorized_keys
```

### 5.3 Limitar no sshd_config

```
Match User tunneluser
    AllowTcpForwarding remote
    X11Forwarding no
    PermitTTY no
    ForceCommand /bin/false
```

## 6. Logs e Troubleshooting

### 6.1 Ver Logs do Túnel

```bash
# Logs do script
tail -f ~/logs/antigravity-tunnel.log

# Logs do systemd
sudo journalctl -u antigravity-tunnel -f

# Logs de conexão SSH (modo verbose)
ssh -vvv -N -R 8080:localhost:8080 usuario@vps.exemplo.com
```

### 6.2 Problemas Comuns

| Problema | Solução |
|----------|---------|
| `bind: Address already in use` | Porta 8080 já está em uso na VPS. Use outra porta. |
| `Connection refused` | Verifique se o proxy está rodando localmente na porta 8080 |
| `Permission denied` | Verifique chave SSH e permissões do usuário |
| `Broken pipe` | Aumente ServerAliveInterval e ServerAliveCountMax |

### 6.3 Testar Túnel

```bash
# Do seu computador local
curl http://vps.exemplo.com:8080/health

# Ou via SSH na VPS
curl http://localhost:8080/health
```

## 7. Resumo de Comandos

```bash
# Iniciar túnel manualmente
./tunnel.sh

# Iniciar como serviço
sudo systemctl start antigravity-tunnel

# Ver status
curl http://vps.exemplo.com:8080/health

# Parar túnel
sudo systemctl stop antigravity-tunnel
# ou
pkill -f "ssh.*8080.*8080"
```

## 8. Estrutura de Arquivos Recomendada

```
~/antigravity/
├── docker-compose.yml      # Configuração Docker
├── start-proxy.sh          # Script de inicialização
├── tunnel.sh              # Script do túnel SSH
├── monitor-tunnel.sh      # Script de monitoramento
└── logs/
    ├── antigravity-tunnel.log
    └── tunnel-monitor.log
```