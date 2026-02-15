# Antigravity Docker Proxy

Configuração Docker otimizada para deploy do Proxy Antigravity em VPS.

## 📦 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `docker-compose.yml` | Configuração Docker Compose com healthcheck e logs rotativos |
| `Dockerfile` | Imagem otimizada Node.js 20 Alpine |
| `start-proxy.sh` | Script de inicialização automática |
| `tunnel-setup.md` | Guia completo de configuração do túnel SSH |

## 🚀 Quick Start

```bash
# 1. Clonar ou copiar os arquivos para a VPS
cd antigravity-docker

# 2. Iniciar o proxy
./start-proxy.sh

# 3. Verificar status
./start-proxy.sh status

# 4. Ver logs
./start-proxy.sh logs
```

## 🔧 Configurações

### Docker Compose
- **Porta**: 8080
- **Restart**: unless-stopped
- **Volume**: Tokens e logs persistentes
- **Healthcheck**: Verifica endpoint `/health` a cada 30s
- **Logs**: Rotação automática (10MB max, 3 arquivos)

### Recursos Limitados
- CPU: 1.0 (limite) / 0.25 (reserva)
- Memória: 512M (limite) / 128M (reserva)

## 🔒 Túnel SSH

Veja o guia completo em [`tunnel-setup.md`](tunnel-setup.md):

- Configuração de auto-reconexão
- Monitoramento com logs
- Segurança com chaves SSH
- Serviço systemd

## 📝 Notas

- A aplicação precisa expor um endpoint `/health` para o healthcheck funcionar
- Tokens são persistidos em volume Docker
- A imagem usa usuário não-root (UID 1000)

## 🐛 Troubleshooting

```bash
# Ver logs do container
docker logs antigravity-proxy

# Verificar health
docker inspect --format='{{.State.Health.Status}}' antigravity-proxy

# Reiniciar serviço
./start-proxy.sh restart

# Parar tudo
./start-proxy.sh stop
```