# Context Routing

Use este diretório quando a tarefa já estiver clara no Obsidian e precisar virar leitura técnica mínima no repo.

## Bloqueio canônico

Se a leitura do vault ainda não aconteceu, pare aqui.

Antes de qualquer análise, status, review, proposta de arquitetura ou implementação ligada ao `Collegium Cortex`, ler no Obsidian:

1. `ESTATUTO CNP - O Protocolo e a Matemática do SPV`
2. `Collegium Cortex - Documento Mestre (Revisão Zero)`
3. `Fonte de Verdade do Collegium Cortex`
4. a nota `Roteamento - ...` dominante do tema

Sem isso, o repo não é contexto suficiente.

## Ordem de uso

1. abra a nota temática no vault `W:\Collegium Cortex`
2. confirme o read set mínimo
3. abra o arquivo deste diretório correspondente ao tema
4. só então navegue para os paths técnicos listados

## Mapas disponíveis

- `governanca.md`
- `agentes-deliberacao.md`
- `economia-protocolo.md`
- `fluxos-operacionais.md`
- `dados-memoria-auditoria.md`
- `produto-superficies.md`

## Regra prática

Estes arquivos não substituem o vault.
Eles existem para reduzir reabertura de contexto e apontar a entrada técnica mínima no repo.

## Regra de autonomia progressiva

Depois que a trilha dominante e o read set mínimo estiverem claros:

- o sistema deve continuar sozinho dentro do `workstream` quando o próximo passo for derivável;
- o sistema só deve parar em gatilhos fortes de decisão, risco ou falta de dado não derivável;
- todo checkpoint curto deve usar:
  - `Estado`
  - `Risco`
  - `Próxima ação dominante`

Execução descentralizada por CLI só entra quando houver `SPEC` delimitado, dono claro, read set mínimo, skills nomeadas quando necessário e revisão posterior.

Entrada técnica mínima para isso:

- `scripts/pema/list-open-specialist-dispatches.ps1`
- `scripts/pema/dispatch-open-cli-specs.ps1`
- `scripts/pema/run-motor-agentico-checkpoint.ps1`
- `scripts/pema/run-motor-agentico-cron.ps1` (`read-only` por padrão; despacho CLI só com `-LaunchOpenCliSpecs`)
- `scripts/pema/new-specialist-response-template.ps1`
- `scripts/pema/import-specialist-output.ps1`
