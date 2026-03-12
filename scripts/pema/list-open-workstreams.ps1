[CmdletBinding()]
param(
    [ValidateSet('open', 'all')]
    [string]$Mode = 'open',

    [switch]$AsJson,

    [string]$QueuePath = 'W:\Collegium Cortex\Fila de Workstreams do Collegium Cortex.md'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $QueuePath)) {
    throw "Fila de workstreams não encontrada em '$QueuePath'."
}

$lines = Get-Content -LiteralPath $QueuePath
$entries = @()
$current = $null

foreach ($line in $lines) {
    if ($line -match '^###\s+(WS-\d{8}-\d{2})\s+[-—]\s+(.+)$') {
        if ($null -ne $current) {
            $entries += [pscustomobject]$current
        }
        $current = @{
            Id = $matches[1]
            Title = $matches[2]
            State = ''
            Owner = ''
            Layer = ''
            Surface = ''
            NextAction = ''
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
    if ($line -match '^- Dono:\s+(.+)$') {
        $current.Owner = $matches[1]
        continue
    }
    if ($line -match '^- Camada:\s+(.+)$') {
        $current.Layer = $matches[1]
        continue
    }
    if ($line -match '^- Superfície principal:\s+(.+)$') {
        $current.Surface = $matches[1]
        continue
    }
    if ($line -match '^- Próxima ação dominante:\s+(.+)$') {
        $current.NextAction = $matches[1]
        continue
    }
}

if ($null -ne $current) {
    $entries += [pscustomobject]$current
}

$filtered = if ($Mode -eq 'all') {
    $entries
} else {
    $entries | Where-Object { $_.State -in @('aberto', 'em execução', 'bloqueado', 'em revisão', 'em pré-conselho') }
}

if (-not $filtered -or $filtered.Count -eq 0) {
    if ($AsJson) {
        '[]'
        return
    }
    Write-Output 'NO_OPEN_WORKSTREAMS'
    return
}

if ($AsJson) {
    $filtered | ConvertTo-Json -Depth 4
    return
}

$filtered | Format-Table Id, State, Owner, Title, Surface, NextAction -AutoSize
