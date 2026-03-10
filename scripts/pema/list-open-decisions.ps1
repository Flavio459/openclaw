[CmdletBinding()]
param(
    [ValidateSet('open', 'all')]
    [string]$Mode = 'open',

    [switch]$AsJson,

    [string]$QueuePath = 'W:\Collegium Cortex\Fila de Decisões do Collegium Cortex.md'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $QueuePath)) {
    throw "Fila de decisões não encontrada em '$QueuePath'."
}

$lines = Get-Content -LiteralPath $QueuePath
$entries = @()
$current = $null

foreach ($line in $lines) {
    if ($line -match '^###\s+(DEC-\d{8}-\d{2})\s+[-—]\s+(.+)$') {
        if ($null -ne $current) {
            $entries += [pscustomobject]$current
        }
        $current = @{
            Id = $matches[1]
            Title = $matches[2]
            State = ''
            Layer = ''
            Routing = ''
            Risk = ''
            EscalateToChairman = ''
        }
        continue
    }

    if ($null -eq $current) {
        continue
    }

    if ($line -match '^- Estado:\s+(.+)$') {
        $current.State = $matches[1]
        continue
    }
    if ($line -match '^- Camada:\s+(.+)$') {
        $current.Layer = $matches[1]
        continue
    }
    if ($line -match '^- Trilha dominante:\s+\[\[(.+)\]\]$') {
        $current.Routing = $matches[1]
        continue
    }
    if ($line -match '^- Risco dominante:\s+(.+)$') {
        $current.Risk = $matches[1]
        continue
    }
    if ($line -match '^- Escalonar ao Chairman:\s+(.+)$') {
        $current.EscalateToChairman = $matches[1]
        continue
    }
}

if ($null -ne $current) {
    $entries += [pscustomobject]$current
}

$filtered = if ($Mode -eq 'all') {
    $entries
} else {
    $entries | Where-Object { $_.State -in @('aberto', 'em análise', 'escalado ao Chairman') }
}

if (-not $filtered -or $filtered.Count -eq 0) {
    if ($AsJson) {
        '[]'
        return
    }
    Write-Output 'NO_OPEN_DECISIONS'
    return
}

if ($AsJson) {
    $filtered | ConvertTo-Json -Depth 4
    return
}

$filtered | Format-Table Id, State, Layer, Title, Routing -AutoSize
