[CmdletBinding()]
param(
    [ValidateSet('preview', 'run')]
    [string]$Mode = 'preview',

    [string]$SpecId,

    [switch]$AsJson,

    [string]$VaultPath = 'W:\Collegium Cortex',

    [string]$QueuePath = 'W:\Collegium Cortex\Registro de Despachos de Especialistas do Collegium Cortex.md',

    [string]$WorkspacePath = 'C:\Pico-Open\openclaw-push',

    [string]$OutputDirectory = 'C:\Pico-Open\openclaw-push\scripts\pema\.runs'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bootstrapScript = Join-Path $scriptDir 'collegium-bootstrap-check.ps1'
$startScript = Join-Path $scriptDir 'start-specialist-cli.ps1'

if (-not (Test-Path -LiteralPath $bootstrapScript)) {
    throw "Script obrigatório não encontrado em '$bootstrapScript'."
}
if (-not (Test-Path -LiteralPath $QueuePath)) {
    throw "Registro de despachos não encontrado em '$QueuePath'."
}
if (-not (Test-Path -LiteralPath $VaultPath)) {
    throw "Vault não encontrado em '$VaultPath'."
}
if (-not (Test-Path -LiteralPath $startScript)) {
    throw "Script start-specialist-cli.ps1 não encontrado em '$startScript'."
}

& $bootstrapScript -Track agents-deliberation | Out-Null

function Resolve-ObsidianNotePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [Parameter(Mandatory = $true)]
        [string]$NoteName
    )

    $normalized = $NoteName
    if ($normalized -match '^(.*?)(?:#|\|)') {
        $normalized = $matches[1]
    }

    $candidate = Join-Path $BasePath ($normalized + '.md')
    if (Test-Path -LiteralPath $candidate) {
        return $candidate
    }

    $normalizeKey = {
        param([string]$Value)

        $formD = $Value.Normalize([Text.NormalizationForm]::FormD)
        $builder = New-Object System.Text.StringBuilder
        foreach ($char in $formD.ToCharArray()) {
            if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
                [void]$builder.Append($char)
            }
        }
        return $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
    }

    $normalizedKey = & $normalizeKey $normalized
    $match = Get-ChildItem -LiteralPath $BasePath -File | Where-Object {
        $_.BaseName -eq $normalized -or (& $normalizeKey $_.BaseName) -eq $normalizedKey
    } | Select-Object -First 1

    if ($null -ne $match) {
        return $match.FullName
    }

    return $null
}

function Get-DispatchSpecs {
    param(
        [Parameter(Mandatory = $true)]
        [string]$DispatchQueuePath
    )

    $lines = Get-Content -LiteralPath $DispatchQueuePath -Encoding utf8
    $entries = @()
    $current = $null
    $captureSkills = $false
    $captureInputs = $false

    foreach ($line in $lines) {
        if ($line -match '^###\s+(SPEC-\d{8}-\d{2})\s+[-—]\s+(.+)$') {
            if ($null -ne $current) {
                $entries += [pscustomobject]$current
            }

            $current = @{
                Id = $matches[1]
                Title = $matches[2]
                State = ''
                Track = ''
                Owner = ''
                RequestedBy = ''
                Workstream = ''
                Surface = ''
                Substrate = ''
                Objective = ''
                ResultExpected = ''
                Envelope = ''
                NextSpec = ''
                DependsOn = @()
                Skills = @()
                InputNotes = @()
            }
            $captureSkills = $false
            $captureInputs = $false
            continue
        }

        if ($null -eq $current) {
            continue
        }

        if ($captureSkills) {
            if ($line -match '^\s{2,}-\s+(.+?)\s*$') {
                $skill = $matches[1].Trim().Trim('`')
                if (-not [string]::IsNullOrWhiteSpace($skill)) {
                    $current.Skills += $skill
                }
                continue
            }
            $captureSkills = $false
        }

        if ($captureInputs) {
            if ($line -match '^\s{2,}-\s+\[\[(.+?)(?:\|.+)?\]\]\s*$') {
                $note = $matches[1].Trim()
                if (-not [string]::IsNullOrWhiteSpace($note)) {
                    $current.InputNotes += $note
                }
                continue
            }
            if ($line -match '^\s{2,}-\s+(.+?)\s*$') {
                $note = $matches[1].Trim()
                if (-not [string]::IsNullOrWhiteSpace($note)) {
                    $current.InputNotes += $note
                }
                continue
            }
            $captureInputs = $false
        }

        if ($line -match '^- Estado:\s+(.+)$') { $current.State = $matches[1]; continue }
        if ($line -match '^- Track:\s+(.+)$') { $current.Track = $matches[1]; continue }
        if ($line -match '^- Dono C-Level:\s+(.+)$') { $current.Owner = $matches[1]; continue }
        if ($line -match '^- Solicitado por:\s+(.+)$') { $current.RequestedBy = $matches[1]; continue }
        if ($line -match '^- Workstream:\s+\[\[(.+?)(?:\|.+)?\]\]$') { $current.Workstream = $matches[1]; continue }
        if ($line -match '^- Workstream:\s+(.+)$') { $current.Workstream = $matches[1]; continue }
        if ($line -match '^- Superfície alvo:\s+(.+)$') { $current.Surface = $matches[1]; continue }
        if ($line -match '^- Substrato sugerido:\s+(.+)$') { $current.Substrate = $matches[1]; continue }
        if ($line -match '^- Skills obrigat.+:\s*$') { $captureSkills = $true; continue }
        if ($line -match '^- Objetivo:\s+(.+)$') { $current.Objective = $matches[1]; continue }
        if ($line -match '^- Entradas obrigat.+:\s*$') { $captureInputs = $true; continue }
        if ($line -match '^- Resultado esperado:\s+(.+)$') { $current.ResultExpected = $matches[1]; continue }
        if ($line -match '^- Envelope de sa.+ esperado:\s+(.+)$') { $current.Envelope = $matches[1]; continue }
        if ($line -match '^- DependsOn:\s+(.+)$') {
            $dependsValue = $matches[1].Trim()
            if (-not [string]::IsNullOrWhiteSpace($dependsValue) -and $dependsValue -ne 'nenhum') {
                $current.DependsOn = @(
                    $dependsValue.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
                )
            }
            continue
        }
        if ($line -match '^- Pr.+ximo SPEC deriv.+ em caso de aprova.+:\s+(.+)$') { $current.NextSpec = $matches[1]; continue }
    }

    if ($null -ne $current) {
        $entries += [pscustomobject]$current
    }

    return $entries
}

function Test-SubstrateAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SubstrateName
    )

    switch ($SubstrateName) {
        'antigravity-cli' { return $null -ne (Get-Command antigravity -ErrorAction SilentlyContinue) }
        'gemini-cli' { return $null -ne (Get-Command gemini -ErrorAction SilentlyContinue) }
        'codex-cli' { return $null -ne (Get-Command codex -ErrorAction SilentlyContinue) }
        default { return $false }
    }
}

function Format-BulletBlock {
    param(
        [string[]]$Items,
        [string]$Fallback = '- nenhum'
    )

    if ($null -eq $Items -or $Items.Count -eq 0) {
        return $Fallback
    }

    return ($Items | ForEach-Object { '- ' + $_ }) -join [Environment]::NewLine
}

$specs = Get-DispatchSpecs -DispatchQueuePath $QueuePath |
    Where-Object { $_.State -in @('aberto', 'queued', 'em execução', 'bloqueado') } |
    Where-Object { $_.Substrate -in @('antigravity-cli', 'gemini-cli', 'codex-cli') }

if ($SpecId) {
    $specs = $specs | Where-Object { $_.Id -eq $SpecId }
}

$specs = @($specs)

if (-not $specs -or $specs.Count -eq 0) {
    if ($AsJson) {
        '[]'
        return
    }

    Write-Output 'NO_DISPATCHABLE_SPECS'
    return
}

$results = @()

foreach ($spec in $specs) {
    $noteNames = @()
    if ($null -ne $spec.InputNotes) {
        $noteNames += @($spec.InputNotes)
    }
    if (-not [string]::IsNullOrWhiteSpace($spec.Workstream)) {
        $noteNames += $spec.Workstream
    }
    if ($null -ne $spec.DependsOn) {
        $noteNames += @($spec.DependsOn)
    }

    $addFiles = @($QueuePath)
    $addFiles += @(
        $noteNames |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            ForEach-Object { Resolve-ObsidianNotePath -BasePath $VaultPath -NoteName $_ } |
            Where-Object { $null -ne $_ } |
            Select-Object -Unique
    )
    $addFiles = @($addFiles | Select-Object -Unique)

    $skillsBlock = Format-BulletBlock -Items @($spec.Skills) -Fallback '- nenhuma skill nomeada'
    $inputBlock = Format-BulletBlock -Items @($spec.InputNotes) -Fallback '- a definir'
    $dependsBlock = Format-BulletBlock -Items @($spec.DependsOn) -Fallback '- nenhum'
    $addFilesBlock = Format-BulletBlock -Items @($addFiles) -Fallback '- nenhum arquivo adicional'
    $track = if ([string]::IsNullOrWhiteSpace($spec.Track)) { 'não definido' } else { $spec.Track }
    $surface = if ([string]::IsNullOrWhiteSpace($spec.Surface)) { 'a confirmar' } else { $spec.Surface }

    $prompt = @"
Voce esta executando o despacho $($spec.Id) do Collegium Cortex.

Titulo: $($spec.Title)
Track: $track
Dono C-Level: $($spec.Owner)
Solicitado por: $($spec.RequestedBy)
Workstream: $($spec.Workstream)
Superficie alvo: $surface
Substrato: $($spec.Substrate)

Entradas obrigatorias:
$inputBlock

DependsOn:
$dependsBlock

Arquivos adicionados ao contexto:
$addFilesBlock

Use obrigatoriamente estas skills, se disponiveis:
$skillsBlock

Objetivo:
$($spec.Objective)

Resultado esperado:
$($spec.ResultExpected)

Envelope de saida aceito:
$($spec.Envelope)

Regras obrigatorias:
- respeite a separacao entre trilho aplicacao, trilho motor e trilho de sincronismo;
- nao trate hipotese como decisao estrutural;
- nao ultrapasse o mandato do workstream;
- preserve a separacao de superficies do Collegium Cortex;
- devolva um artefato revisavel em Markdown;
- mantenha rastreabilidade, impacto de superficie e proxima acao clara.

Formato minimo de resposta:
# $($spec.Id) - $($spec.Title)
## O que foi tentado
## O que foi produzido ou descoberto
## Estado atual
## Principal risco ou limite
## Impacto em superficie
## Proxima acao dominante
## Proximo responsavel
"@

    $available = Test-SubstrateAvailable -SubstrateName $spec.Substrate
    $result = [ordered]@{
        SpecId = $spec.Id
        Title = $spec.Title
        State = $spec.State
        Track = $spec.Track
        Owner = $spec.Owner
        RequestedBy = $spec.RequestedBy
        Workstream = $spec.Workstream
        Surface = $spec.Surface
        Substrate = $spec.Substrate
        SubstrateAvailable = $available
        DependsOn = @($spec.DependsOn)
        Skills = @($spec.Skills)
        AddFiles = @($addFiles)
        OutputFile = $null
        Status = if ($Mode -eq 'preview') { 'preview' } else { 'pending' }
        CommandPreview = $null
    }

    if (-not $available) {
        $result.Status = 'skipped-missing-cli'
        $results += [pscustomobject]$result
        continue
    }

    $preview = & $startScript -Substrate $spec.Substrate -Mode agent -Prompt $prompt -AddFile @($addFiles) -WorkspacePath $WorkspacePath -PreviewOnly
    $result.CommandPreview = ($preview | Out-String).Trim()

    if ($Mode -eq 'run') {
        $null = New-Item -ItemType Directory -Force -Path $OutputDirectory
        $outputPath = Join-Path $OutputDirectory ($spec.Id + '.md')
        $result.OutputFile = $outputPath

        try {
            $runOutput = @(
                & $startScript -Substrate $spec.Substrate -Mode agent -Prompt $prompt -AddFile @($addFiles) -WorkspacePath $WorkspacePath 2>&1
            )

            $noStdoutStatus = if ($spec.Substrate -eq 'antigravity-cli') {
                'launched-ui-session'
            } else {
                'executed-no-output'
            }

            $receiptLines = @()
            $receiptLines += '# ' + $spec.Id + ' - Dispatch Receipt'
            $receiptLines += ''
            $receiptLines += '- Status: ' + $(if ($runOutput.Count -gt 0) { 'executed-with-output' } else { $noStdoutStatus })
            $receiptLines += '- Track: ' + $track
            $receiptLines += '- Superfície alvo: ' + $surface
            $receiptLines += '- Substrate: ' + $spec.Substrate
            $receiptLines += '- Owner: ' + $spec.Owner
            $receiptLines += '- RequestedBy: ' + $spec.RequestedBy
            $receiptLines += '- Workstream: ' + $spec.Workstream
            $receiptLines += '- LaunchedAt: ' + (Get-Date).ToString('s')
            $receiptLines += ''
            $receiptLines += '## DependsOn'
            $receiptLines += if ($spec.DependsOn.Count -gt 0) {
                $spec.DependsOn | ForEach-Object { '- ' + $_ }
            } else {
                '- nenhum'
            }
            $receiptLines += ''
            $receiptLines += '## AddFiles'
            $receiptLines += ($addFiles | ForEach-Object { '- ' + $_ })
            $receiptLines += ''
            $receiptLines += '## Command Preview'
            $receiptLines += '```text'
            $receiptLines += $result.CommandPreview
            $receiptLines += '```'
            $receiptLines += ''
            $receiptLines += '## Prompt'
            $receiptLines += '```text'
            $receiptLines += $prompt
            $receiptLines += '```'

            if ($runOutput.Count -gt 0) {
                $receiptLines += ''
                $receiptLines += '## Raw Output'
                $receiptLines += '```text'
                $receiptLines += (($runOutput | Out-String).TrimEnd())
                $receiptLines += '```'
                $result.Status = 'executed-with-output'
            }
            else {
                $receiptLines += ''
                $receiptLines += '## Notes'
                if ($spec.Substrate -eq 'antigravity-cli') {
                    $receiptLines += '- O CLI nao escreveu nada em stdout.'
                    $receiptLines += '- Para `antigravity-cli`, isso normalmente significa que a sessao foi lancada na UI e deve ser acompanhada fora deste processo.'
                }
                else {
                    $receiptLines += '- O CLI nao escreveu nada em stdout.'
                    $receiptLines += '- Para CLIs não interativos como `gemini-cli` ou `codex-cli`, revisar logs e o estado da sessão antes de reenfileirar o SPEC.'
                }
                $result.Status = $noStdoutStatus
            }

            Set-Content -LiteralPath $outputPath -Value $receiptLines -Encoding utf8
        }
        catch {
            $result.Status = 'failed'
            $result.Error = $_.Exception.Message
        }
    }

    $results += [pscustomobject]$result
}

if ($AsJson) {
    $results | ConvertTo-Json -Depth 6
    return
}

foreach ($result in $results) {
    Write-Output ('SPEC: ' + $result.SpecId + ' [' + $result.Status + ']')
    Write-Output ('  Track: ' + $result.Track)
    Write-Output ('  Surface: ' + $result.Surface)
    Write-Output ('  Substrate: ' + $result.Substrate)
    Write-Output ('  Title: ' + $result.Title)
    Write-Output ('  Workstream: ' + $result.Workstream)
    if ($result.DependsOn.Count -gt 0) {
        Write-Output ('  DependsOn: ' + ($result.DependsOn -join '; '))
    }
    if ($result.AddFiles.Count -gt 0) {
        Write-Output ('  AddFiles: ' + ($result.AddFiles -join '; '))
    }
    if ($result.CommandPreview) {
        Write-Output ('  Preview: ' + $result.CommandPreview)
    }
    if ($result.OutputFile) {
        Write-Output ('  OutputFile: ' + $result.OutputFile)
    }
    if ($result.PSObject.Properties.Name -contains 'Error') {
        Write-Output ('  Error: ' + $result.Error)
    }
    Write-Output ''
}
