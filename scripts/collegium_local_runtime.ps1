Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:CollegiumGatewayUrl = "http://127.0.0.1:19000"
$script:CollegiumHealthUrl = "$script:CollegiumGatewayUrl/health"
$script:CollegiumGatewayCmd = Join-Path $env:USERPROFILE ".openclaw\gateway.cmd"
$script:CollegiumOpenClawConfig = Join-Path $env:USERPROFILE ".openclaw\openclaw.json"
$script:CollegiumStartupTimeoutSeconds = 25
$script:CollegiumPollIntervalMilliseconds = 1200

function Test-CollegiumGatewayHealth {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300)
  } catch {
    return $false
  }
}

function Get-CollegiumGatewayToken {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ConfigPath
  )

  if (-not (Test-Path $ConfigPath)) {
    return $null
  }

  try {
    $config = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json
    $token = [string]$config.gateway.auth.token
    if ($token.Trim()) {
      return $token.Trim()
    }
  } catch {
    return $null
  }

  return $null
}

function Ensure-CollegiumGatewayReady {
  param(
    [string]$HealthUrl = $script:CollegiumHealthUrl,
    [string]$GatewayCmd = $script:CollegiumGatewayCmd,
    [int]$StartupTimeoutSeconds = $script:CollegiumStartupTimeoutSeconds,
    [int]$PollIntervalMilliseconds = $script:CollegiumPollIntervalMilliseconds
  )

  if (-not (Test-CollegiumGatewayHealth -Url $HealthUrl)) {
    if (-not (Test-Path $GatewayCmd)) {
      throw "Gateway launcher not found: $GatewayCmd"
    }

    Start-Process -FilePath $GatewayCmd | Out-Null

    $deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
      Start-Sleep -Milliseconds $PollIntervalMilliseconds
      if (Test-CollegiumGatewayHealth -Url $HealthUrl) {
        break
      }
    }
  }

  if (-not (Test-CollegiumGatewayHealth -Url $HealthUrl)) {
    throw "Local Collegium app did not become healthy at $HealthUrl within $StartupTimeoutSeconds seconds."
  }
}

function Get-CollegiumAppUrl {
  param(
    [string]$GatewayUrl = $script:CollegiumGatewayUrl,
    [string]$ConfigPath = $script:CollegiumOpenClawConfig,
    [string]$Path = "/"
  )

  $gatewayToken = Get-CollegiumGatewayToken -ConfigPath $ConfigPath
  $baseUrl = '{0}{1}' -f $GatewayUrl.TrimEnd('/'), $Path

  if (-not $gatewayToken) {
    return $baseUrl
  }

  return '{0}#token={1}' -f $baseUrl, [uri]::EscapeDataString($gatewayToken)
}
