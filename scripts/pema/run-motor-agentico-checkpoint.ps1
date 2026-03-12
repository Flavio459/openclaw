[CmdletBinding()]
param(
    [string]$VaultPath = 'W:\Collegium Cortex',

    [string]$DecisionQueuePath = '',

    [string]$WorkstreamQueuePath = '',

    [string]$IdeaQueuePath = '',

    [string]$DispatchQueuePath = '',

    [switch]$AsJson
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$decisionQueue = if ([string]::IsNullOrWhiteSpace($DecisionQueuePath)) {
    Get-ChildItem -LiteralPath $VaultPath -File | Where-Object { $_.Name -like 'Fila de Decis* do Collegium Cortex.md' } | Select-Object -First 1 -ExpandProperty FullName
} else {
    $DecisionQueuePath
}
$workstreamQueue = if ([string]::IsNullOrWhiteSpace($WorkstreamQueuePath)) {
    Join-Path $VaultPath 'Fila de Workstreams do Collegium Cortex.md'
} else {
    $WorkstreamQueuePath
}
$ideaQueue = if ([string]::IsNullOrWhiteSpace($IdeaQueuePath)) {
    Join-Path $VaultPath 'Fila de Ideias do Collegium Cortex.md'
} else {
    $IdeaQueuePath
}
$dispatchQueue = if ([string]::IsNullOrWhiteSpace($DispatchQueuePath)) {
    Join-Path $VaultPath 'Registro de Despachos de Especialistas do Collegium Cortex.md'
} else {
    $DispatchQueuePath
}

if (-not $decisionQueue) {
    throw 'Decision queue file not found in Collegium vault.'
}

$workstreamsRaw = & (Join-Path $scriptDir 'list-open-workstreams.ps1') -QueuePath $workstreamQueue -AsJson
$decisionsRaw = & (Join-Path $scriptDir 'list-open-decisions.ps1') -QueuePath $decisionQueue -AsJson
$ideasRaw = if (Test-Path -LiteralPath (Join-Path $scriptDir 'list-open-ideas.ps1')) {
    & (Join-Path $scriptDir 'list-open-ideas.ps1') -QueuePath $ideaQueue -AsJson
} else {
    '[]'
}
$dispatchesRaw = if (Test-Path -LiteralPath (Join-Path $scriptDir 'list-open-specialist-dispatches.ps1')) {
    & (Join-Path $scriptDir 'list-open-specialist-dispatches.ps1') -QueuePath $dispatchQueue -AsJson
} else {
    '[]'
}

$workstreams = if ([string]::IsNullOrWhiteSpace($workstreamsRaw) -or $workstreamsRaw -eq '[]') {
    @()
} else {
    @($workstreamsRaw | ConvertFrom-Json)
}

$decisions = if ([string]::IsNullOrWhiteSpace($decisionsRaw) -or $decisionsRaw -eq '[]') {
    @()
} else {
    @($decisionsRaw | ConvertFrom-Json)
}
$ideas = if ([string]::IsNullOrWhiteSpace($ideasRaw) -or $ideasRaw -eq '[]') {
    @()
} else {
    @($ideasRaw | ConvertFrom-Json)
}
$dispatches = if ([string]::IsNullOrWhiteSpace($dispatchesRaw) -or $dispatchesRaw -eq '[]') {
    @()
} else {
    @($dispatchesRaw | ConvertFrom-Json)
}

$workstreamList = @()
foreach ($item in $workstreams) {
    $workstreamList += [pscustomobject]@{
        Id = $item.Id
        State = $item.State
        Owner = $item.Owner
        Title = $item.Title
        Surface = $item.Surface
        NextAction = $item.NextAction
        Layer = $item.Layer
    }
}

$decisionList = @()
foreach ($item in $decisions) {
    $decisionList += [pscustomobject]@{
        Id = $item.Id
        State = $item.State
        Layer = $item.Layer
        Title = $item.Title
        Routing = $item.Routing
        Risk = $item.Risk
        EscalateToChairman = $item.EscalateToChairman
    }
}

$ideaList = @()
foreach ($item in $ideas) {
    $ideaList += [pscustomobject]@{
        Id = $item.Id
        State = $item.State
        Track = $item.Track
        Surface = $item.Surface
        Title = $item.Title
        NextAction = $item.NextAction
    }
}

$dispatchList = @()
foreach ($item in $dispatches) {
    $dispatchList += [pscustomobject]@{
        Id = $item.Id
        State = $item.State
        Owner = $item.Owner
        Substrate = $item.Substrate
        Title = $item.Title
        Workstream = $item.Workstream
    }
}

$nextActions = @()
foreach ($item in $workstreamList) {
    $nextActions += [pscustomobject]@{
        Kind = 'workstream'
        Id = $item.Id
        Owner = $item.Owner
        Title = $item.Title
        NextAction = $item.NextAction
    }
}
foreach ($item in $ideaList) {
    $nextActions += [pscustomobject]@{
        Kind = 'idea'
        Id = $item.Id
        Owner = $item.Track
        Title = $item.Title
        NextAction = $item.NextAction
    }
}
foreach ($item in $dispatchList) {
    $nextActions += [pscustomobject]@{
        Kind = 'dispatch'
        Id = $item.Id
        Owner = $item.Owner
        Title = $item.Title
        NextAction = ('executar ' + $item.Id + ' via ' + $item.Substrate)
    }
}

$summary = [pscustomobject]@{
    GeneratedAt = (Get-Date).ToString('s')
    OpenIdeaCount = $ideaList.Count
    OpenWorkstreamCount = $workstreamList.Count
    OpenDecisionCount = $decisionList.Count
    OpenSpecialistDispatchCount = $dispatchList.Count
    OpenIdeas = $ideaList
    OpenWorkstreams = $workstreamList
    OpenDecisions = $decisionList
    OpenSpecialistDispatches = $dispatchList
    NextActions = $nextActions
}

if ($AsJson) {
    $summary | ConvertTo-Json -Depth 6
    return
}

Write-Output ('GeneratedAt: ' + $summary.GeneratedAt)
Write-Output ('OpenIdeas: ' + $summary.OpenIdeaCount)
Write-Output ('OpenWorkstreams: ' + $summary.OpenWorkstreamCount)
Write-Output ('OpenDecisions: ' + $summary.OpenDecisionCount)
Write-Output ('OpenSpecialistDispatches: ' + $summary.OpenSpecialistDispatchCount)
Write-Output ''

if ($summary.OpenIdeaCount -gt 0) {
    Write-Output 'Ideas'
    $ideaList | Format-Table Id, State, Track, Surface, Title, NextAction -AutoSize
    Write-Output ''
}

if ($summary.OpenWorkstreamCount -gt 0) {
    Write-Output 'Workstreams'
    $workstreamList | Format-Table Id, State, Owner, Title, NextAction -AutoSize
    Write-Output ''
}

if ($summary.OpenDecisionCount -gt 0) {
    Write-Output 'Decisions'
    $decisionList | Format-Table Id, State, Layer, Title, Routing -AutoSize
    Write-Output ''
}

if ($summary.OpenSpecialistDispatchCount -gt 0) {
    Write-Output 'SpecialistDispatches'
    $dispatchList | Format-Table Id, State, Owner, Substrate, Title -AutoSize
}
