Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Collegium Cortex Slides.lnk"
$OpenScript = Join-Path $ScriptDir "open_collegium_slides.ps1"
$DefaultTarget = Join-Path $RepoRoot "_preview_artifacts\collegium-slides\collegium-cortex-status-da-construcao-agentica-2026-03-13.pptx"
$TargetPath = $DefaultTarget

if ($args.Count -gt 0 -and $args[0]) {
  $TargetPath = $args[0]
}

if (-not (Test-Path $OpenScript)) {
  throw "Open script not found: $OpenScript"
}

if (-not (Test-Path $TargetPath)) {
  throw "Slides target not found: $TargetPath"
}

$ResolvedOpenScript = (Resolve-Path $OpenScript).Path
$ResolvedTarget = (Resolve-Path $TargetPath).Path
$PowerShellExe = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $PowerShellExe
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ResolvedOpenScript`" `"$ResolvedTarget`""
$Shortcut.WorkingDirectory = $RepoRoot
$Shortcut.IconLocation = "$PowerShellExe,0"
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Open Collegium Cortex slides deck"
$Shortcut.Save()

Write-Output "[OK] Shortcut created at $ShortcutPath"
