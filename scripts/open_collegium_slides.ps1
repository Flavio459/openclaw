Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$DefaultTarget = Join-Path $RepoRoot "_preview_artifacts\collegium-slides\collegium-cortex-status-da-construcao-agentica-2026-03-13.pptx"
$TargetPath = $DefaultTarget

if ($args.Count -gt 0 -and $args[0]) {
  $TargetPath = $args[0]
}

if (-not (Test-Path $TargetPath)) {
  Write-Error "Collegium slides target not found: $TargetPath"
}

$ResolvedTarget = (Resolve-Path $TargetPath).Path
Start-Process $ResolvedTarget | Out-Null
Write-Output "[OK] Opened $ResolvedTarget"
