param(
  [string]$SshHost = "openclaw-vps-ts",
  [string]$RemoteHealthUrl = "http://127.0.0.1:28789/health",
  [string]$LocalGatewayUrl = "http://127.0.0.1:28789",
  [string]$GatewayContainer = "openclaw-openclaw-gateway-lab-1",
  [string]$EnvironmentLabel = "lab",
  [string]$EnvironmentDisplay = "VPS lab",
  [string]$LogPrefix = "lab-preflight",
  [int]$TimeoutSeconds = 8,
  [switch]$AsJson,
  [switch]$NoLog
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$LogDir = Join-Path $RepoRoot "scripts\pema\.logs"
$Timestamp = Get-Date

$LocalGatewayUri = [Uri]$LocalGatewayUrl
$RemoteHealthUri = [Uri]$RemoteHealthUrl
$LocalHealthUrl = "{0}/health" -f $LocalGatewayUrl.TrimEnd("/")
$TunnelCommand = "ssh -N -L $($LocalGatewayUri.Port):127.0.0.1:$($RemoteHealthUri.Port) $SshHost"

function New-CheckResult {
  param(
    [string]$Name,
    [bool]$Ok,
    [string]$Detail,
    [string]$Hint = ""
  )

  return [pscustomobject]@{
    Name   = $Name
    Ok     = $Ok
    Detail = $Detail
    Hint   = $Hint
  }
}

function Test-CommandAvailable {
  param([string]$CommandName)
  return $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

function Invoke-SshCommand {
  param([string]$CommandText)

  $output = & ssh -o BatchMode=yes -o "ConnectTimeout=$TimeoutSeconds" $SshHost $CommandText 2>&1
  $exitCode = $LASTEXITCODE
  $text = ($output | ForEach-Object { "$_" }) -join "`n"

  return [pscustomobject]@{
    ExitCode = $exitCode
    Output   = $text.Trim()
  }
}

function Invoke-JsonRequest {
  param([string]$Url)

  $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds
  return $response
}

function Invoke-TextRequest {
  param([string]$Url)

  $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds -UseBasicParsing
  return $response
}

$checks = New-Object System.Collections.Generic.List[object]
$recommendedActions = New-Object System.Collections.Generic.List[string]

$sshAvailable = Test-CommandAvailable "ssh"
$checks.Add(
  (New-CheckResult -Name "ssh" -Ok $sshAvailable -Detail ($(if ($sshAvailable) { "ssh available on the local host." } else { "ssh was not found on the local host." })) -Hint "Install OpenSSH Client before running the preflight.")
)

$remoteContainerOk = $false
$remoteHealthOk = $false
$localHealthOk = $false
$controlUiOk = $false
$remoteHealthMs = $null
$localHealthMs = $null
$localHealthStopwatch = $null

if ($sshAvailable) {
  try {
    $containerProbe = Invoke-SshCommand "docker inspect --format '{{.State.Running}}' $GatewayContainer"
    $remoteContainerOk = ($containerProbe.ExitCode -eq 0 -and $containerProbe.Output -match "^true$")
    $checks.Add(
      (New-CheckResult -Name "remote-container" -Ok $remoteContainerOk -Detail ($(if ($remoteContainerOk) {
              "Container running in ${EnvironmentDisplay}: ${GatewayContainer}."
            } elseif ($containerProbe.ExitCode -eq 0) {
              "Container was found, but it is not running: $($containerProbe.Output)"
            } else {
              "Failed to inspect container in ${EnvironmentDisplay}: $($containerProbe.Output)"
            })) -Hint "Check the compose stack and container ${GatewayContainer} in ${EnvironmentDisplay}.")
    )
    if (-not $remoteContainerOk) {
      $recommendedActions.Add("Confirm the container in ${EnvironmentDisplay}: docker ps -a | findstr openclaw-gateway")
    }
  } catch {
    $checks.Add(
      (New-CheckResult -Name "remote-container" -Ok $false -Detail "Failed to inspect the remote container over SSH: $($_.Exception.Message)" -Hint "Check Tailscale/SSH connectivity before promoting to ${EnvironmentDisplay}.")
    )
    $recommendedActions.Add("Revalidar acesso SSH/Tailscale para ${SshHost}.")
  }

  try {
    $remoteHealthStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $healthProbe = Invoke-SshCommand "curl -fsS --max-time $TimeoutSeconds $RemoteHealthUrl"
    $remoteHealthStopwatch.Stop()
    $remoteHealthMs = [int][Math]::Round($remoteHealthStopwatch.Elapsed.TotalMilliseconds)
    if ($healthProbe.ExitCode -eq 0) {
      $healthJson = $healthProbe.Output | ConvertFrom-Json
      $remoteHealthOk = ($healthJson.status -eq "ok")
      $checks.Add(
        (New-CheckResult -Name "remote-health" -Ok $remoteHealthOk -Detail "Remote /health response: $($healthProbe.Output)" -Hint "If this fails, inspect gateway logs and bootstrap dependencies in ${EnvironmentDisplay}.")
      )
    } else {
      $checks.Add(
        (New-CheckResult -Name "remote-health" -Ok $false -Detail "Remote /health check failed: $($healthProbe.Output)" -Hint "Check the remote endpoint ${RemoteHealthUrl} inside ${EnvironmentDisplay}.")
      )
      $recommendedActions.Add("Run remotely: curl -fsS ${RemoteHealthUrl}")
    }
  } catch {
    $checks.Add(
      (New-CheckResult -Name "remote-health" -Ok $false -Detail "Failed to query the remote /health endpoint: $($_.Exception.Message)" -Hint "Check SSH, container, and remote health endpoint for ${EnvironmentDisplay}.")
    )
    $recommendedActions.Add("Run the remote health check before promoting any runtime.")
  }
}

try {
  $localHealthStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
  $localHealth = Invoke-JsonRequest -Url $LocalHealthUrl
  $localHealthStopwatch.Stop()
  $localHealthMs = [int][Math]::Round($localHealthStopwatch.Elapsed.TotalMilliseconds)
  $localHealthOk = ($localHealth.status -eq "ok")
  $localHealthCheck = New-CheckResult `
    -Name "local-tunnel-health" `
    -Ok $localHealthOk `
    -Detail "Local /health response via tunnel: $($localHealth | ConvertTo-Json -Compress -Depth 6)" `
    -Hint "If this fails, open the SSH tunnel for ${EnvironmentDisplay} before continuing."
  $checks.Add($localHealthCheck)
} catch {
  if ($localHealthStopwatch) {
    $localHealthStopwatch.Stop()
  }
  $localHealthCheck = New-CheckResult `
    -Name "local-tunnel-health" `
    -Ok $false `
    -Detail "Tunnel/local health is unavailable at ${LocalHealthUrl}: $($_.Exception.Message)" `
    -Hint "Open the SSH tunnel for ${EnvironmentDisplay} before the local smoke."
  $checks.Add($localHealthCheck)
  $recommendedActions.Add("Open the ${EnvironmentDisplay} tunnel: ${TunnelCommand}")
}

try {
  $controlUi = Invoke-TextRequest -Url $LocalGatewayUrl
  $title = ""
  if ($controlUi.Content -match "<title>([^<]+)</title>") {
    $title = $Matches[1].Trim()
  }
  $controlUiOk = ($controlUi.StatusCode -eq 200 -and [string]::IsNullOrWhiteSpace($title) -eq $false)
  $controlUiCheck = New-CheckResult `
    -Name "control-ui" `
    -Ok $controlUiOk `
    -Detail "Control UI respondeu com HTTP $($controlUi.StatusCode); title='$title'." `
    -Hint "If this fails, validate the tunnel and embedded frontend for ${EnvironmentDisplay}."
  $checks.Add($controlUiCheck)
} catch {
  $controlUiCheck = New-CheckResult `
    -Name "control-ui" `
    -Ok $false `
    -Detail "Control UI is unavailable at ${LocalGatewayUrl}: $($_.Exception.Message)" `
    -Hint "Open the tunnel and confirm that the gateway UI is reachable in ${EnvironmentDisplay}."
  $checks.Add($controlUiCheck)
  $recommendedActions.Add("Revalidate local access to the Control UI for ${EnvironmentDisplay}: ${LocalGatewayUrl}")
}

$failedChecks = @($checks | Where-Object { $_.Ok -eq $false })
$allChecksOk = ($failedChecks.Count -eq 0)
$overallStatus = if ($allChecksOk) { "pass" } else { "fail" }
$checkArray = @($checks | ForEach-Object { $_ })
$recommendedActionArray = @($recommendedActions | ForEach-Object { $_ })

if ($recommendedActions.Count -eq 0 -and -not $allChecksOk) {
  $recommendedActions.Add("Rerun the preflight after restoring the failing checks.")
}

$summary = @{}
$summary["environment"] = $EnvironmentLabel
$summary["mode"] = "read-only"
$summary["ssh"] = $(if ($sshAvailable) { "pass" } else { "fail" })
$summary["container"] = $(if ($remoteContainerOk) { "pass" } else { "fail" })
$summary["remoteHealth"] = $(if ($remoteHealthOk) { "pass" } else { "fail" })
$summary["localTunnelHealth"] = $(if ($localHealthOk) { "pass" } else { "fail" })
$summary["controlUi"] = $(if ($controlUiOk) { "pass" } else { "fail" })
$summary["measuredMs"] = @{
  remoteHealth = $remoteHealthMs
  localHealth  = $localHealthMs
}
$summary["logPath"] = $null
$summary["timestamp"] = $Timestamp.ToString("o")
$summary["overall"] = $overallStatus
$summary["surface"] = "OpenClaw Runtime"
$summary["environmentDisplay"] = $EnvironmentDisplay
$summary["sshHost"] = $SshHost
$summary["localGatewayUrl"] = $LocalGatewayUrl
$summary["remoteHealthUrl"] = $RemoteHealthUrl
$summary["gatewayContainer"] = $GatewayContainer
$summary["tunnelCommand"] = $TunnelCommand
$summary["checks"] = $checkArray
$summary["recommendedActions"] = $recommendedActionArray

$logPath = $null
if (-not $NoLog) {
  New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
  $logPath = Join-Path $LogDir ("{0}-{1}.json" -f $LogPrefix, $Timestamp.ToString("yyyyMMdd-HHmmss"))
  $summary | ConvertTo-Json -Depth 8 | Set-Content -Path $logPath -Encoding UTF8
  $summary["logPath"] = $logPath
}

if ($AsJson) {
  $summary | ConvertTo-Json -Depth 8
  exit $(if ($allChecksOk) { 0 } else { 1 })
}

Write-Output ""
Write-Output ("{0} preflight" -f $EnvironmentLabel.ToUpperInvariant())
Write-Output "-------------"
Write-Output ("Surface: {0}" -f $summary["surface"])
Write-Output ("Environment: {0}" -f $summary["environmentDisplay"])
Write-Output ("Overall: {0}" -f $summary["overall"].ToUpperInvariant())
Write-Output ("SSH host: {0}" -f $summary["sshHost"])
Write-Output ("Remote health: {0}" -f $summary["remoteHealthUrl"])
Write-Output ("Local gateway: {0}" -f $summary["localGatewayUrl"])
Write-Output ""

foreach ($check in $checks) {
  $prefix = if ($check.Ok) { "[OK]" } else { "[X]" }
  Write-Output ("{0} {1} - {2}" -f $prefix, $check.Name, $check.Detail)
  if ($check.Hint) {
    Write-Output ("     Hint: {0}" -f $check.Hint)
  }
}

if ($recommendedActions.Count -gt 0) {
  Write-Output ""
  Write-Output "Recommended actions"
  Write-Output "-------------------"
  foreach ($action in $recommendedActions) {
    Write-Output ("- {0}" -f $action)
  }
}

if ($logPath) {
  Write-Output ""
  Write-Output ("Log: {0}" -f $summary["logPath"])
}

exit $(if ($allChecksOk) { 0 } else { 1 })
