Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "collegium_local_runtime.ps1")

function Get-CollegiumBrowserPath {
  $candidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Mozilla Firefox\firefox.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

Ensure-CollegiumGatewayReady
$AppUrl = Get-CollegiumAppUrl

$BrowserPath = Get-CollegiumBrowserPath
if ($BrowserPath) {
  Start-Process -FilePath $BrowserPath -ArgumentList $AppUrl | Out-Null
} else {
  Start-Process -FilePath "explorer.exe" -ArgumentList $AppUrl | Out-Null
}

Write-Output "[OK] Opened local Collegium app at $AppUrl"
