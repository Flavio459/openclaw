[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SpecId,

    [string]$DispatchQueuePath = 'W:\Collegium Cortex\Registro de Despachos de Especialistas do Collegium Cortex.md',

    [string]$OutputDirectory = 'C:\Pico-Open\openclaw-push\scripts\pema\.runs'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

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
            if ($line -match '^\s{2,}-\s+(.+)$') {
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

if (-not (Test-Path -LiteralPath $DispatchQueuePath)) {
    throw "Registro de despachos nao encontrado em '$DispatchQueuePath'."
}

$spec = Get-DispatchSpecs -DispatchQueuePath $DispatchQueuePath | Where-Object { $_.Id -eq $SpecId } | Select-Object -First 1
if ($null -eq $spec) {
    throw "SPEC '$SpecId' nao encontrado em '$DispatchQueuePath'."
}

$null = New-Item -ItemType Directory -Force -Path $OutputDirectory
$outputPath = Join-Path $OutputDirectory ($SpecId + '.response.md')

$inputLines = @()
if ($spec.InputNotes.Count -gt 0) {
    $inputLines = $spec.InputNotes | ForEach-Object { '- [[' + $_ + ']]' }
} else {
    $inputLines = @('- a definir')
}

$skillLines = @()
if ($spec.Skills.Count -gt 0) {
    $skillLines = $spec.Skills | ForEach-Object { '- `' + $_ + '`' }
} else {
    $skillLines = @('- nenhuma skill nomeada')
}

$content = @()
$content += '# ' + $spec.Id + ' - ' + $spec.Title
$content += ''
$content += '## Contexto rapido'
$content += '- Track: ' + $(if ([string]::IsNullOrWhiteSpace($spec.Track)) { 'a confirmar' } else { $spec.Track })
$content += '- Dono C-Level: ' + $spec.Owner
$content += '- Solicitado por: ' + $spec.RequestedBy
$content += '- Workstream: ' + $spec.Workstream
$content += '- Superfície alvo: ' + $(if ([string]::IsNullOrWhiteSpace($spec.Surface)) { 'a confirmar' } else { $spec.Surface })
$content += '- Resultado esperado: ' + $spec.ResultExpected
$content += '- Envelope de saida aceito: ' + $spec.Envelope
$content += '- DependsOn: ' + $(if ($spec.DependsOn.Count -gt 0) { $spec.DependsOn -join ', ' } else { 'nenhum' })
$content += ''
$content += '## Entradas obrigatorias'
$content += $inputLines
$content += ''
$content += '## Skills obrigatorias'
$content += $skillLines
$content += ''
$content += '## O que foi tentado'
$content += ''
$content += '## O que foi produzido ou descoberto'
$content += ''
$content += '## Estado atual'
$content += ''
$content += '## Principal risco ou limite'
$content += ''
$content += '## Impacto em superficie'
$content += ''
$content += '## Proxima acao dominante'
$content += ''
$content += '## Proximo responsavel'
$content += ''

Set-Content -LiteralPath $outputPath -Value $content -Encoding utf8
Write-Output $outputPath
