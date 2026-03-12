[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('antigravity-cli', 'gemini-cli', 'codex-cli')]
    [string]$Substrate,

    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    [ValidateSet('agent', 'ask', 'edit')]
    [string]$Mode = 'agent',

    [string[]]$AddFile = @(),

    [string]$WorkspacePath = 'C:\Pico-Open\openclaw-push',

    [switch]$PreviewOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Quote-Args {
    param([string[]]$Values)

    return $Values | ForEach-Object {
        if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
    }
}

function Add-WorkspaceFilesToPrompt {
    param(
        [string]$BasePrompt,
        [string[]]$Files
    )

    if (@($Files).Count -eq 0) {
        return $BasePrompt
    }

    $fileLines = @($Files | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { '- ' + $_ })
    if (@($fileLines).Count -eq 0) {
        return $BasePrompt
    }

    return @"
Arquivos de apoio disponíveis no workspace:
$($fileLines -join [Environment]::NewLine)

$BasePrompt
"@
}

if (-not (Test-Path -LiteralPath $WorkspacePath)) {
    throw "Workspace não encontrado em '$WorkspacePath'."
}

switch ($Substrate) {
    'antigravity-cli' {
        $cmd = Get-Command antigravity -ErrorAction SilentlyContinue
        if ($null -eq $cmd) {
            throw 'Antigravity CLI não encontrado no PATH.'
        }

        $args = @('chat', '--mode', $Mode)
        foreach ($file in $AddFile) {
            $args += '--add-file'
            $args += $file
        }
        $args += $Prompt

        if ($PreviewOnly) {
            $quoted = Quote-Args -Values $args
            Write-Output ('antigravity ' + ($quoted -join ' '))
            return
        }

        Push-Location -LiteralPath $WorkspacePath
        try {
            & $cmd.Source @args
        }
        finally {
            Pop-Location
        }
    }

    'gemini-cli' {
        $cmd = Get-Command gemini -ErrorAction SilentlyContinue
        if ($null -eq $cmd) {
            throw 'Gemini CLI não encontrado no PATH.'
        }

        $effectivePrompt = Add-WorkspaceFilesToPrompt -BasePrompt $Prompt -Files $AddFile

        if ($PreviewOnly) {
            Write-Output ('gemini "' + $effectivePrompt + '"')
            return
        }

        Push-Location -LiteralPath $WorkspacePath
        try {
            & $cmd.Source $effectivePrompt
        }
        finally {
            Pop-Location
        }
    }

    'codex-cli' {
        $cmd = Get-Command codex -ErrorAction SilentlyContinue
        if ($null -eq $cmd) {
            throw 'Codex CLI não encontrado no PATH.'
        }

        $effectivePrompt = Add-WorkspaceFilesToPrompt -BasePrompt $Prompt -Files $AddFile
        $args = @(
            'exec',
            '--json',
            '--color', 'never',
            '--sandbox', 'read-only',
            '--skip-git-repo-check',
            $effectivePrompt
        )

        if ($PreviewOnly) {
            $quoted = Quote-Args -Values $args
            Write-Output ('codex ' + ($quoted -join ' '))
            return
        }

        Push-Location -LiteralPath $WorkspacePath
        try {
            & $cmd.Source @args
        }
        finally {
            Pop-Location
        }
    }
}
