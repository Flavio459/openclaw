Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Collegium Cortex App.lnk"
$AliasShortcutPath = Join-Path $DesktopPath "Collegium Cortex.lnk"
$OpenScript = Join-Path $ScriptDir "open_collegium_app.ps1"
$PowerShellExe = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"
$ChromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (-not (Test-Path $OpenScript)) {
  throw "Open script not found: $OpenScript"
}

$ResolvedOpenScript = (Resolve-Path $OpenScript).Path
$IconLocation = "$PowerShellExe,0"
if (Test-Path $ChromeExe) {
  $IconLocation = "$ChromeExe,0"
}

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $PowerShellExe
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ResolvedOpenScript`""
$Shortcut.WorkingDirectory = $RepoRoot
$Shortcut.IconLocation = $IconLocation
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Open the local Collegium Cortex app for testing"
$Shortcut.Save()

$AliasShortcut = $Shell.CreateShortcut($AliasShortcutPath)
$AliasShortcut.TargetPath = $PowerShellExe
$AliasShortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ResolvedOpenScript`""
$AliasShortcut.WorkingDirectory = $RepoRoot
$AliasShortcut.IconLocation = $IconLocation
$AliasShortcut.WindowStyle = 1
$AliasShortcut.Description = "Open the local Collegium Cortex app"
$AliasShortcut.Save()

Write-Output "[OK] Shortcut created at $ShortcutPath"
Write-Output "[OK] Shortcut created at $AliasShortcutPath"
