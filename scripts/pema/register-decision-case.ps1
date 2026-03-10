[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Title,

    [Parameter(Mandatory = $true)]
    [ValidateSet('institucional', 'protocolo', 'agentic', 'aplicação', 'dados-auditoria')]
    [string]$Layer,

    [Parameter(Mandatory = $true)]
    [string]$RoutingNote,

    [Parameter(Mandatory = $true)]
    [string]$Context,

    [Parameter(Mandatory = $true)]
    [string[]]$Options,

    [Parameter(Mandatory = $true)]
    [string]$Risk,

    [string[]]$ReadSet = @(),

    [switch]$EscalateToChairman,

    [string]$QueuePath = 'W:\Collegium Cortex\Fila de Decisões do Collegium Cortex.md'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $QueuePath)) {
    throw "Fila de decisões não encontrada em '$QueuePath'."
}

$content = Get-Content -Raw -LiteralPath $QueuePath
$today = Get-Date -Format 'yyyyMMdd'
$pattern = "### DEC-$today-(\d{2})"
$matches = [regex]::Matches($content, $pattern)
$nextNumber = 1
if ($matches.Count -gt 0) {
    $used = $matches | ForEach-Object { [int]$_.Groups[1].Value }
    $nextNumber = (($used | Measure-Object -Maximum).Maximum) + 1
}

$decisionId = "DEC-$today-" + $nextNumber.ToString('00')
$readSetLines = if ($ReadSet.Count -gt 0) {
    $ReadSet | ForEach-Object { "  - [[$_]]" }
} else {
    @('  - a definir')
}
$optionLines = $Options | ForEach-Object { "  - $_" }
$escalation = if ($EscalateToChairman.IsPresent) { 'sim' } else { 'não' }

$entryLines = @(
    "### $decisionId - $Title",
    "- Estado: aberto",
    "- Camada: $Layer",
    "- Trilha dominante: [[${RoutingNote}]]",
    "- Read set mínimo:"
) + $readSetLines + @(
    "- Contexto curto: $Context",
    "- Opções plausíveis:"
) + $optionLines + @(
    "- Risco dominante: $Risk",
    "- Decisão do agente: pendente",
    "- Escalonar ao Chairman: $escalation",
    "- Próxima ação dominante: submeter ao Agente de Decisão",
    ''
)
$entry = ($entryLines -join [Environment]::NewLine)

if ($content -match 'Nenhum caso em aberto no momento\.') {
    $newContent = $content -replace 'Nenhum caso em aberto no momento\.', $entry.TrimEnd()
} else {
    $newContent = $content.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $entry.TrimEnd() + [Environment]::NewLine
}

Set-Content -LiteralPath $QueuePath -Value $newContent -Encoding UTF8

Write-Output "CREATED $decisionId"
Write-Output $QueuePath
