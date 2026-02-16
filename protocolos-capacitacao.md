# PROTOCOLOS DE CAPACITAÇÃO - FLAVIUS

## 📋 PROTOCOLO A: CONSULTA DE MEMÓRIA OBRIGATÓRIA

**OBJETIVO:** Evitar repetir soluções já documentadas

**FLUXO (ANTES de qualquer ação complexa):**
```
1. CONSULTAR memory/YYYY-MM-DD.md (últimos 2 dias)
   grep -i "problema|solução|antigravity|proxy" memory/2026-02-*.md

2. CONSULTAR MEMORY.md (lições aprendidas)
   grep -i "#critical-solution|#community-fix" MEMORY.md

3. BUSCAR por tags relevantes
   find . -name "*.md" -exec grep -l "#antigravity\|#proxy\|#oauth" {} \;

4. SÓ ENTÃO propor solução
```

**EXEMPLO PRÁTICO (Antigravity):**
```
Problema: "Conta Google bloqueada"
Consulta memória → Encontra: "#community-fix: usar antigravity-claude-proxy"
Solução: Implementar proxy da comunidade (já documentado)
```

## 📋 PROTOCOLO B: DIAGNÓSTICO ARQUITETURAL

**OBJETIVO:** Identificar ambiente antes de sugerir soluções

**CHECKLIST:**
```
1. AMBIENTE: Container? VPS? Windows local? WSL?
   uname -a; hostname -I; cat /proc/1/cgroup

2. REDE: Quem acessa quem? Portas expostas?
   ss -tlnp; docker ps; netstat -tlnp

3. RESTRIÇÕES: Firewall? Docker networking? SSH?
   iptables -L; docker network ls

4. COMPATIBILIDADE: Solução funciona neste ambiente?
```

**EXEMPLO PRÁTICO (Proxy localhost):**
```
Ambiente: Container Docker em VPS
Rede: localhost:8080 (container) ≠ localhost:8080 (usuário)
Restrição: Porta não exposta para host
Solução compatível: SSH tunnel ou fazer no Windows local
```

## 📋 PROTOCOLO C: VALIDAÇÃO DE SOLUÇÕES EXISTENTES

**OBJETIVO:** Não reinventar a roda

**FLUXO:**
```
1. BUSCAR soluções documentadas
   grep -r "RESOLVIDO|SOLUÇÃO|FUNCIONOU" memory/ docs/

2. VERIFICAR se problema já resolvido
   "Já resolvemos X em data Y com solução Z"

3. USAR solução testada vs inventar nova
   Se solução existe → implementar
   Se não existe → documentar nova solução

4. DOCUMENTAR nova solução se necessária
   Adicionar tags: #new-solution, #tested-YYYY-MM-DD
```

## 📋 PROTOCOLO D: APRENDIZADO CONTÍNUO

**OBJETIVO:** Aprender com cada erro

**FLUXO APÓS ERRO:**
```
1. IDENTIFICAR erro específico
   "Falha: não consultei memória antes de ação X"

2. ANALISAR causa raiz
   "Porque: pressa, não seguir protocolo, desconhecimento"

3. CRIAR correção
   "Protocolo A: consulta de memória obrigatória"

4. IMPLEMENTAR prevenção
   "Checklist antes de cada ação complexa"

5. DOCUMENTAR aprendizado
   Atualizar MEMORY.md com lição aprendida
```

## 🏷️ SISTEMA DE TAGS

**TAGS CRÍTICAS:**
- `#critical-solution` → Solução essencial que funciona
- `#community-fix` → Solução da comunidade testada
- `#tested-YYYY-MM-DD` → Data de teste bem-sucedido
- `#failed-YYYY-MM-DD` → O que não funcionou (evitar)
- `#architecture-issue` → Problema de ambiente/rede
- `#security-note` → Considerações de segurança

**TAGS POR DOMÍNIO:**
- `#antigravity` → Integração Google Antigravity
- `#oauth` → Autenticação OAuth/Google
- `#docker` → Container/Docker issues
- `#networking` → Problemas de rede
- `#proxy` → Soluções via proxy
- `#windows` → Ambiente Windows específico

## 📊 CHECKLIST DE APLICAÇÃO

**ANTES DE QUALQUER AÇÃO COMPLEXA:**
- [ ] Consultar memory/ últimos 2 dias
- [ ] Consultar MEMORY.md
- [ ] Buscar por tags relevantes
- [ ] Identificar ambiente atual
- [ ] Mapear arquitetura de rede
- [ ] Verificar soluções existentes
- [ ] Escolher solução compatível

**APÓS CADA AÇÃO:**
- [ ] Documentar resultado (sucesso/fracasso)
- [ ] Adicionar tags apropriadas
- [ ] Atualizar MEMORY.md se aprendizado novo
- [ ] Refinar protocolos se necessário

## 🎯 EXEMPLO DE APLICAÇÃO (ANTIGRAVITY)

**SITUAÇÃO ATUAL CONGELADA:**
- Problema: Autenticação Antigravity falha
- Ambiente: Container Docker em VPS
- Conta: flavius9ia@gmail.com bloqueada
- Alternativa: eng.flavio.barros@gmail.com preparada
- Solução tentada: Proxy da comunidade (antigravity-claude-proxy)
- Bloqueio: Networking container vs Windows

**APLICAÇÃO DOS PROTOCOLOS:**
1. **Protocolo A:** Consultar memória → Solução proxy já documentada ✅
2. **Protocolo B:** Diagnóstico arquitetural → localhost container ≠ localhost Windows ✅
3. **Protocolo C:** Validação soluções → SSH tunnel ou Windows local ✅
4. **Protocolo D:** Aprendizado → Criar estes protocolos ✅

**SOLUÇÃO COMPATÍVEL:**
- Opção 1: SSH tunnel da VPS para Windows
- Opção 2: Fazer tudo no Windows local (recomendado)
- Opção 3: Expor porta do container via Docker

---

**DATA DE IMPLEMENTAÇÃO:** 2026-02-15  
**STATUS:** Protocolos criados e prontos para teste  
**PRÓXIMO:** Testar com caso real e validar eficácia