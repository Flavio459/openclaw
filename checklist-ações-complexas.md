# CHECKLIST - AÇÕES COMPLEXAS

## 📋 CHECKLIST PRÉ-AÇÃO (OBRIGATÓRIO)

### ETAPA 1: CONSULTA DE MEMÓRIA
- [ ] **memory/YYYY-MM-DD.md** (últimos 2 dias)
  ```bash
  grep -i "problema|solução|$TAG" memory/2026-02-*.md | head -5
  ```
- [ ] **MEMORY.md** (lições aprendidas)
  ```bash
  grep -i "#critical-solution|#community-fix|$DOMINIO" MEMORY.md | head -5
  ```
- [ ] **Busca por tags** no workspace
  ```bash
  find . -name "*.md" -exec grep -l "#$TAG" {} \; 2>/dev/null | head -3
  ```

### ETAPA 2: DIAGNÓSTICO ARQUITETURAL
- [ ] **Identificar ambiente:**
  ```bash
  echo "Hostname: $(hostname)"
  echo "OS: $(uname -a)"
  echo "Container: $(cat /proc/1/cgroup 2>/dev/null | grep docker || echo 'Não container')"
  ```
- [ ] **Mapear rede:**
  ```bash
  echo "IPs: $(hostname -I)"
  echo "Gateway: http://localhost:18789"
  ```
- [ ] **Verificar portas/services:**
  ```bash
  ss -tlnp 2>/dev/null | grep ":80\|:8080\|:18789" || echo "ss não disponível"
  ```

### ETAPA 3: VALIDAÇÃO SOLUÇÕES
- [ ] **Problema já resolvido?**
  - Buscar por "RESOLVIDO|FUNCIONOU|SOLUÇÃO" + problema
- [ ] **Solução documentada existe?**
  - Verificar protocolos-capacitacao.md
  - Verificar skills/ documentação
- [ ] **Compatibilidade com ambiente?**
  - Solução funciona neste ambiente específico?

## 📋 CHECKLIST PÓS-AÇÃO (DOCUMENTAÇÃO)

### ETAPA 4: REGISTRO DE RESULTADO
- [ ] **Documentar em memory/YYYY-MM-DD.md:**
  ```
  ## [DATA] AÇÃO: [DESCRIÇÃO]
  - Problema: [descrição]
  - Solução tentada: [descrição]
  - Resultado: ✅ Sucesso / ❌ Falha
  - Aprendizado: [lição]
  - Tags: #[tag1] #[tag2]
  ```
- [ ] **Atualizar MEMORY.md se aprendizado novo:**
  - Adicionar lição aprendida
  - Atualizar protocolos se necessário
  - Adicionar tags relevantes

### ETAPA 5: REFINAMENTO DE PROTOCOLOS
- [ ] **Protocolo funcionou?**
  - O que poderia ser melhorado?
  - Adicionar passo faltante?
  - Simplificar algum passo?
- [ ] **Atualizar protocolos-capacitacao.md**
  - Adicionar novo caso de uso
  - Refinar checklist baseado em experiência

## 🎯 EXEMPLO PRÁTICO: ANTIGRAVITY PROXY

### PRÉ-AÇÃO (EXECUTADO):
```
✅ ETAPA 1 - CONSULTA MEMÓRIA:
  - memory/2026-02-15.md: "Solução proxy da comunidade documentada"
  - MEMORY.md: "#community-fix: antigravity-claude-proxy"
  - Tags encontradas: #antigravity #proxy #community-fix

✅ ETAPA 2 - DIAGNÓSTICO:
  - Ambiente: Container Docker em VPS
  - Hostname: b68eb2cebb31
  - IPs: 172.18.0.3
  - Gateway: http://localhost:18789

✅ ETAPA 3 - VALIDAÇÃO:
  - Problema: Conta Google bloqueada
  - Solução existente: Proxy da comunidade (documentada)
  - Compatibilidade: ❌ (localhost container ≠ localhost Windows)
```

### PÓS-AÇÃO (A EXECUTAR APÓS TESTE):
```
[ ] ETAPA 4 - REGISTRO:
  - Documentar resultado do teste
  - Atualizar MEMORY.md com aprendizado

[ ] ETAPA 5 - REFINAMENTO:
  - Verificar se protocolos ajudaram
  - Refinar baseado em experiência real
```

## ⚡ CHECKLIST RÁPIDO (PARA COPIA/COLA)

```bash
# PRÉ-AÇÃO RÁPIDO
echo "=== CHECKLIST PRÉ-AÇÃO ==="
echo "1. Memória:"
grep -i "$PROBLEMA" memory/2026-02-*.md 2>/dev/null | head -2
echo "2. Ambiente:"
echo "   Hostname: $(hostname)"
echo "   Container: $(cat /proc/1/cgroup 2>/dev/null | grep -o docker || echo 'Não')"
echo "3. Soluções existentes:"
grep -r "#$(echo $PROBLEMA | tr '[:upper:]' '[:lower:]')" . 2>/dev/null | head -2
```

## 📊 MÉTRICAS DE SUCESSO

**EFICÁCIA DO CHECKLIST:**
- Redução de erros repetitivos: Alvo 80%
- Tempo de resolução: Reduzir 50%
- Consulta de memória: 100% das ações complexas
- Documentação: 100% dos resultados

**INDICADORES:**
- ✅ Checklist completo antes de ação
- ✅ Memória consultada
- ✅ Solução compatível com ambiente
- ✅ Resultado documentado
- ✅ Aprendizado registrado

---

**VERSÃO:** 1.0  
**DATA:** 2026-02-15  
**STATUS:** Implementado e pronto para teste  
**PRÓXIMO:** Testar com caso real e medir eficácia