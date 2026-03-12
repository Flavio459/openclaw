[CmdletBinding()]
param(
    [string]$VaultPath = 'W:\Collegium Cortex',

    [string]$DecisionQueuePath = '',

    [string]$WorkstreamQueuePath = '',

    [string]$IdeaQueuePath = '',

    [string]$DispatchQueuePath = '',

    [string]$WorkspacePath = 'C:\Pico-Open\openclaw-push',

    [string]$LogsDirectory = 'C:\Pico-Open\openclaw-push\scripts\pema\.logs',

    [string]$RunsDirectory = 'C:\Pico-Open\openclaw-push\scripts\pema\.runs',

    [switch]$LaunchOpenCliSpecs = $true,

    [switch]$ForceRelaunch,

    [switch]$AsJson
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$checkpointScript = Join-Path $scriptDir 'run-motor-agentico-checkpoint.ps1'
$listSpecsScript = Join-Path $scriptDir 'list-open-specialist-dispatches.ps1'
$dispatchScript = Join-Path $scriptDir 'dispatch-open-cli-specs.ps1'

foreach ($required in @($checkpointScript, $listSpecsScript, $dispatchScript)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Script obrigatório não encontrado em '$required'."
    }
}

$null = New-Item -ItemType Directory -Force -Path $LogsDirectory
$null = New-Item -ItemType Directory -Force -Path $RunsDirectory

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$checkpoint = & $checkpointScript -VaultPath $VaultPath -DecisionQueuePath $DecisionQueuePath -WorkstreamQueuePath $WorkstreamQueuePath -IdeaQueuePath $IdeaQueuePath -DispatchQueuePath $DispatchQueuePath -AsJson | ConvertFrom-Json
$checkpointPath = Join-Path $LogsDirectory ("motor-checkpoint-" + $timestamp + ".json")
$checkpoint | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $checkpointPath -Encoding utf8

$dispatchListQueuePath = if ([string]::IsNullOrWhiteSpace($DispatchQueuePath)) {
    Join-Path $VaultPath 'Registro de Despachos de Especialistas do Collegium Cortex.md'
} else {
    $DispatchQueuePath
}

$dispatches = @(& $listSpecsScript -QueuePath $dispatchListQueuePath -AsJson | ConvertFrom-Json)
$dispatches = @($dispatches | Where-Object { $_.Substrate -in @('antigravity-cli', 'gemini-cli', 'codex-cli') })

$launchResults = @()

if ($LaunchOpenCliSpecs) {
    foreach ($dispatch in $dispatches) {
        $receiptPath = Join-Path $RunsDirectory ($dispatch.Id + '.md')
        if ((-not $ForceRelaunch) -and (Test-Path -LiteralPath $receiptPath)) {
            $launchResults += [pscustomobject]@{
                SpecId = $dispatch.Id
                Status = 'skipped-existing-receipt'
                ReceiptPath = $receiptPath
            }
            continue
        }

        $result = & $dispatchScript -Mode run -SpecId $dispatch.Id -QueuePath $dispatchListQueuePath -VaultPath $VaultPath -WorkspacePath $WorkspacePath -OutputDirectory $RunsDirectory -AsJson | ConvertFrom-Json
        $launchResults += $result
    }
}

$summary = [pscustomobject]@{
    Timestamp = $timestamp
    CheckpointPath = $checkpointPath
    OpenIdeaCount = $checkpoint.OpenIdeaCount
    OpenWorkstreamCount = $checkpoint.OpenWorkstreamCount
    OpenDecisionCount = $checkpoint.OpenDecisionCount
    OpenSpecialistDispatchCount = $checkpoint.OpenSpecialistDispatchCount
    LaunchOpenCliSpecs = [bool]$LaunchOpenCliSpecs
    ForceRelaunch = [bool]$ForceRelaunch
    LaunchResults = @($launchResults)
}

$summaryPath = Join-Path $LogsDirectory ("motor-cron-summary-" + $timestamp + ".json")
$summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding utf8

if ($AsJson) {
    $summary | ConvertTo-Json -Depth 8
    return
}

Write-Output ('Motor Agentico cron checkpoint: ' + $timestamp)
Write-Output ('  CheckpointPath: ' + $checkpointPath)
Write-Output ('  OpenIdeas: ' + $checkpoint.OpenIdeaCount)
Write-Output ('  OpenWorkstreams: ' + $checkpoint.OpenWorkstreamCount)
Write-Output ('  OpenDecisions: ' + $checkpoint.OpenDecisionCount)
Write-Output ('  OpenSpecialistDispatches: ' + $checkpoint.OpenSpecialistDispatchCount)
Write-Output ('  SummaryPath: ' + $summaryPath)
foreach ($launch in $launchResults) {
    Write-Output ('  LaunchResult: ' + $launch.SpecId + ' [' + $launch.Status + ']')
}
