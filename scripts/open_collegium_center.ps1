Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$DefaultHtml = Join-Path $RepoRoot "_preview_artifacts\\collegium-status\\index.html"
$HtmlPath = $DefaultHtml

Push-Location $RepoRoot
try {
  & pnpm collegium:status
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to refresh Collegium status."
  }
} finally {
  Pop-Location
}

if ($args.Count -gt 0 -and $args[0]) {
  $HtmlPath = $args[0]
}

if (-not (Test-Path $HtmlPath)) {
  Write-Error "Status HTML not found: $HtmlPath"
}

$ResolvedHtml = (Resolve-Path $HtmlPath).Path
Start-Process $ResolvedHtml | Out-Null
Write-Output "[OK] Opened $ResolvedHtml"
