Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DelegateScript = Join-Path $ScriptDir "open_collegium_center.ps1"

if (-not (Test-Path $DelegateScript)) {
  throw "Delegate script not found: $DelegateScript"
}

& $DelegateScript @args
