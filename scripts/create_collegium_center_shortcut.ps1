Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Collegium Cortex Center.lnk"
$LegacyShortcutPath = Join-Path $DesktopPath "Collegium Cortex Status.lnk"
$OpenScript = Join-Path $ScriptDir "open_collegium_center.ps1"
$DefaultHtml = Join-Path $RepoRoot "_preview_artifacts\\collegium-status\\index.html"
$HtmlPath = $DefaultHtml

if ($args.Count -gt 0 -and $args[0]) {
  $HtmlPath = $args[0]
}

if (-not (Test-Path $OpenScript)) {
  throw "Open script not found: $OpenScript"
}

if (-not (Test-Path $HtmlPath)) {
  throw "Status HTML not found: $HtmlPath"
}

$ResolvedOpenScript = (Resolve-Path $OpenScript).Path
$ResolvedHtml = (Resolve-Path $HtmlPath).Path
$PowerShellExe = Join-Path $env:WINDIR "System32\\WindowsPowerShell\\v1.0\\powershell.exe"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $PowerShellExe
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ResolvedOpenScript`" `"$ResolvedHtml`""
$Shortcut.WorkingDirectory = $RepoRoot
$Shortcut.IconLocation = "$PowerShellExe,0"
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Open Collegium Cortex operational center"
$Shortcut.Save()

if (($LegacyShortcutPath -ne $ShortcutPath) -and (Test-Path $LegacyShortcutPath)) {
  Remove-Item -LiteralPath $LegacyShortcutPath -Force
}

Write-Output "[OK] Shortcut created at $ShortcutPath"
