[CmdletBinding()]
param(
    [ValidateSet('open', 'all')]
    [string]$Mode = 'open',

    [switch]$AsJson,

    [string]$QueuePath = 'W:\Collegium Cortex\Fila de Ideias do Collegium Cortex.md'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $QueuePath)) {
    if ($AsJson) {
        '[]'
        return
    }

    Write-Output 'NO_OPEN_IDEAS'
    return
}

$lines = @(Get-Content -LiteralPath $QueuePath -Encoding utf8)
$entries = @()
$current = $null

foreach ($line in $lines) {
    if ($line -match '^###\s+(IDEA-\d{8}-\d{2})\s+[-—]\s+(.+)$') {
        if ($null -ne $current) {
            $entries += [pscustomobject]$current
        }

        $current = @{
            Id = $matches[1]
            Title = $matches[2]
            State = ''
            Track = ''
            Surface = ''
            Summary = ''
            ImpactsCurrentWorkstream = ''
            TargetWorkstream = ''
            NextAction = ''
            EvidenceMinimum = ''
            PromotedTo = ''
        }
        continue
    }

    if ($null -eq $current) {
        continue
    }

    if ($line -match '^- Estado:\s+(.+)$') { $current.State = $matches[1]; continue }
    if ($line -match '^- Track:\s+(.+)$') { $current.Track = $matches[1]; continue }
    if ($line -match '^- Surface alvo:\s+(.+)$') { $current.Surface = $matches[1]; continue }
    if ($line -match '^- Superfície alvo:\s+(.+)$') { $current.Surface = $matches[1]; continue }
    if ($line -match '^- Descrição curta:\s+(.+)$') { $current.Summary = $matches[1]; continue }
    if ($line -match '^- Impacta WS atual\?:\s+(.+)$') { $current.ImpactsCurrentWorkstream = $matches[1]; continue }
    if ($line -match '^- WS alvo:\s+(.+)$') { $current.TargetWorkstream = $matches[1]; continue }
    if ($line -match '^- Próxima ação dominante:\s+(.+)$') { $current.NextAction = $matches[1]; continue }
    if ($line -match '^- Proxima acao dominante:\s+(.+)$') { $current.NextAction = $matches[1]; continue }
    if ($line -match '^- Evidência mínima:\s+(.+)$') { $current.EvidenceMinimum = $matches[1]; continue }
    if ($line -match '^- Evidencia minima:\s+(.+)$') { $current.EvidenceMinimum = $matches[1]; continue }
    if ($line -match '^- Promovido para:\s+(.+)$') { $current.PromotedTo = $matches[1]; continue }
}

if ($null -ne $current) {
    $entries += [pscustomobject]$current
}

$filtered = @(
if ($Mode -eq 'all') {
    $entries
}
else {
    $entries | Where-Object { $_.State -notin @('promoted', 'rejected', 'parked') }
}
)

if (-not $filtered -or $filtered.Count -eq 0) {
    if ($AsJson) {
        '[]'
        return
    }

    Write-Output 'NO_OPEN_IDEAS'
    return
}

if ($AsJson) {
    $filtered | ConvertTo-Json -Depth 5
    return
}

$filtered | Format-Table Id, State, Track, Surface, Title, NextAction -AutoSize
