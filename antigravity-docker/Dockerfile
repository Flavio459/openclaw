FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Criar usuário não-root
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

# Diretório de trabalho
WORKDIR /app

# Copiar package.json primeiro (cache de camadas)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p /app/tokens /app/logs /app/config && \
    chown -R appuser:appgroup /app

# Mudar para usuário não-root
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expor porta
EXPOSE 8080

# Comando de inicialização
CMD ["node", "server.js"]