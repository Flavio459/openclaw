Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Collegium Cortex App.lnk"
$OpenScript = Join-Path $ScriptDir "open_collegium_app.ps1"
$PowerShellExe = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"

if (-not (Test-Path $OpenScript)) {
  throw "Open script not found: $OpenScript"
}

$ResolvedOpenScript = (Resolve-Path $OpenScript).Path

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $PowerShellExe
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ResolvedOpenScript`""
$Shortcut.WorkingDirectory = $RepoRoot
$Shortcut.IconLocation = "$PowerShellExe,0"
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Open the local Collegium Cortex app for testing"
$Shortcut.Save()

Write-Output "[OK] Shortcut created at $ShortcutPath"
