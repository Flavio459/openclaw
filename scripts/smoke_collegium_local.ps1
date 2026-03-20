param(
  [switch]$Headed,
  [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "collegium_local_runtime.ps1")

$RepoRoot = Split-Path $PSScriptRoot -Parent
$SmokeScript = Join-Path $RepoRoot "ui\scripts\smoke-local-app.mjs"
$OutputDir = Join-Path $RepoRoot "output\playwright\collegium-local-smoke"
$OverviewUrl = Get-CollegiumAppUrl -Path "/overview"

Ensure-CollegiumGatewayReady

if (-not $SkipBuild) {
  & pnpm --dir $RepoRoot ui:build
  $buildExitCode = $LASTEXITCODE
  if ($buildExitCode -ne 0) {
    exit $buildExitCode
  }
}

$args = @($SmokeScript, "--url", $OverviewUrl, "--output-dir", $OutputDir)
if ($Headed) {
  $args += "--headed"
}

& node @args
$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
  exit $exitCode
}

Write-Output "[OK] Local Collegium smoke passed. Artifacts: $OutputDir"
