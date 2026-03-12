[CmdletBinding()]
param(
    [ValidateSet('open', 'all')]
    [string]$Mode = 'open',

    [switch]$AsJson,

    [string]$QueuePath = 'W:\Collegium Cortex\Registro de Despachos de Especialistas do Collegium Cortex.md'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $QueuePath)) {
    throw "Registro de despachos não encontrado em '$QueuePath'."
}

$lines = Get-Content -LiteralPath $QueuePath -Encoding utf8
$entries = @()
$current = $null
$captureSkills = $false

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
            NextSpec = ''
            DependsOn = @()
            Skills = @()
        }
        $captureSkills = $false
        continue
    }

    if ($null -eq $current) {
        continue
    }

    if ($captureSkills) {
        if ($line -match '^\s{2,}-\s+(.+?)\s*$') {
            $skill = $matches[1].Trim()
            $skill = $skill.Trim('`')
            if (-not [string]::IsNullOrWhiteSpace($skill)) {
                $current.Skills += $skill
            }
            continue
        }

        $captureSkills = $false
    }

    if ($line -match '^- Estado:\s+(.+)$') {
        $current.State = $matches[1]
        continue
    }
    if ($line -match '^- Track:\s+(.+)$') {
        $current.Track = $matches[1]
        continue
    }
    if ($line -match '^- Dono C-Level:\s+(.+)$') {
        $current.Owner = $matches[1]
        continue
    }
    if ($line -match '^- Solicitado por:\s+(.+)$') {
        $current.RequestedBy = $matches[1]
        continue
    }
    if ($line -match '^- Workstream:\s+\[\[(.+?)(?:\|.+)?\]\]$') {
        $current.Workstream = $matches[1]
        continue
    }
    if ($line -match '^- Workstream:\s+(.+)$') {
        $current.Workstream = $matches[1]
        continue
    }
    if ($line -match '^- Superfície alvo:\s+(.+)$') {
        $current.Surface = $matches[1]
        continue
    }
    if ($line -match '^- Substrato sugerido:\s+(.+)$') {
        $current.Substrate = $matches[1]
        continue
    }
    if ($line -match '^- DependsOn:\s+(.+)$') {
        $dependsValue = $matches[1].Trim()
        if (-not [string]::IsNullOrWhiteSpace($dependsValue) -and $dependsValue -ne 'nenhum') {
            $current.DependsOn = @(
                $dependsValue.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            )
        }
        continue
    }
    if ($line -match '^- Skills obrigat.+:\s*$') {
        $captureSkills = $true
        continue
    }
    if ($line -match '^- Objetivo:\s+(.+)$') {
        $current.Objective = $matches[1]
        continue
    }
    if ($line -match '^- Resultado esperado:\s+(.+)$') {
        $current.ResultExpected = $matches[1]
        continue
    }
    if ($line -match '^- Pr.+ximo SPEC deriv.+ em caso de aprova.+:\s+(.+)$') {
        $current.NextSpec = $matches[1]
        continue
    }
}

if ($null -ne $current) {
    $entries += [pscustomobject]$current
}

$filtered = @(
if ($Mode -eq 'all') {
    $entries
} else {
    $entries | Where-Object { $_.State -in @('aberto', 'em execução', 'bloqueado', 'entregue', 'queued') }
}
)

if (-not $filtered -or $filtered.Count -eq 0) {
    if ($AsJson) {
        '[]'
        return
    }

    Write-Output 'NO_OPEN_SPECIALIST_DISPATCHES'
    return
}

if ($AsJson) {
    $filtered | ConvertTo-Json -Depth 6
    return
}

$filtered | Format-Table Id, State, Track, Owner, RequestedBy, Substrate, Title -AutoSize
