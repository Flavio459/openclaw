Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Port = 8940
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ServerScript = Join-Path $RepoRoot "scripts\collegium-discussions-server.mjs"
$Url = "http://127.0.0.1:$Port"

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
  Start-Process -FilePath "node" -ArgumentList @($ServerScript) -WorkingDirectory $RepoRoot -WindowStyle Hidden | Out-Null
  Start-Sleep -Seconds 2
}

Start-Process $Url | Out-Null
Write-Output "[OK] Opened $Url"
