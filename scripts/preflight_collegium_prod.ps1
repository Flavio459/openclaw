param(
  [string]$SshHost = "openclaw-vps-ts",
  [string]$RemoteHealthUrl = "http://127.0.0.1:18789/health",
  [string]$LocalGatewayUrl = "http://127.0.0.1:18789",
  [string]$GatewayContainer = "openclaw-openclaw-gateway-1",
  [int]$TimeoutSeconds = 8,
  [switch]$AsJson,
  [switch]$NoLog
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$labScript = Join-Path $PSScriptRoot "preflight_collegium_lab.ps1"

& $labScript `
  -SshHost $SshHost `
  -RemoteHealthUrl $RemoteHealthUrl `
  -LocalGatewayUrl $LocalGatewayUrl `
  -GatewayContainer $GatewayContainer `
  -EnvironmentLabel "prod" `
  -EnvironmentDisplay "VPS prod" `
  -LogPrefix "prod-preflight" `
  -TimeoutSeconds $TimeoutSeconds `
  -AsJson:$AsJson `
  -NoLog:$NoLog

exit $LASTEXITCODE
