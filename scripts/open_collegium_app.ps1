Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "collegium_local_runtime.ps1")

Ensure-CollegiumGatewayReady
$AppUrl = Get-CollegiumAppUrl

Start-Process $AppUrl | Out-Null
Write-Output "[OK] Opened local Collegium app at $AppUrl"
