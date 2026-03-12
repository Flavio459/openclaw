[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$IdeaId,

    [Parameter(Mandatory = $true)]
    [ValidateSet('spec', 'dec')]
    [string]$PromoteTo,

    [string]$IdeaQueuePath = 'W:\Collegium Cortex\Fila de Ideias do Collegium Cortex.md',

    [string]$DispatchQueuePath = 'W:\Collegium Cortex\Registro de Despachos de Especialistas do Collegium Cortex.md',

    [string]$DecisionQueuePath = 'W:\Collegium Cortex\Fila de Decisões do Collegium Cortex.md',

    [string]$Title = '',
    [string]$Track = '',
    [string]$Surface = '',
    [string]$Workstream = '',
    [string]$Owner = 'a definir',
    [string]$RequestedBy = 'a definir',
    [string]$Substrate = '',
    [string]$Objective = '',
    [string]$ResultExpected = '',
    [string]$Envelope = 'artefato revisavel em Markdown com Estado, Risco, Impacto em superficie e Proxima acao dominante',
    [string]$NextSpec = '',
    [string[]]$DependsOn = @(),
    [string[]]$Skills = @(),
    [string[]]$InputNotes = @(),

    [string]$Layer = '',
    [string]$RoutingNote = '',
    [string]$Context = '',
    [string[]]$Options = @(),
    [string]$Risk = '',
    [string[]]$ReadSet = @(),
    [switch]$EscalateToChairman
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-IdeaBlocks {
    param([string]$Path)

    $lines = @(Get-Content -LiteralPath $Path -Encoding utf8)
    $blocks = @()
    $current = $null

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '^###\s+(IDEA-\d{8}-\d{2})\s+[-—]\s+(.+)$') {
            if ($null -ne $current) {
                $current.EndIndex = $i - 1
                $current.Lines = @($lines[$current.StartIndex..$current.EndIndex])
                $blocks += [pscustomobject]$current
            }
            $current = @{
                Id = $matches[1]
                Title = $matches[2]
                StartIndex = $i
                EndIndex = $null
                Lines = @()
            }
        }
    }

    if ($null -ne $current) {
        $current.EndIndex = $lines.Count - 1
        $current.Lines = @($lines[$current.StartIndex..$current.EndIndex])
        $blocks += [pscustomobject]$current
    }

    return $blocks
}

function Parse-IdeaBlock {
    param([string[]]$Lines)

    $data = @{
        State = ''
        Track = ''
        Surface = ''
        Summary = ''
        ImpactsCurrentWorkstream = ''
        TargetWorkstream = ''
        NextAction = ''
        EvidenceMinimum = ''
        PromotedTo = ''
    }

    foreach ($line in $Lines) {
        if ($line -match '^- Estado:\s+(.+)$') { $data.State = $matches[1]; continue }
        if ($line -match '^- Track:\s+(.+)$') { $data.Track = $matches[1]; continue }
        if ($line -match '^- Surface alvo:\s+(.+)$') { $data.Surface = $matches[1]; continue }
        if ($line -match '^- Superfície alvo:\s+(.+)$') { $data.Surface = $matches[1]; continue }
        if ($line -match '^- Descrição curta:\s+(.+)$') { $data.Summary = $matches[1]; continue }
        if ($line -match '^- Impacta WS atual\?:\s+(.+)$') { $data.ImpactsCurrentWorkstream = $matches[1]; continue }
        if ($line -match '^- WS alvo:\s+(.+)$') { $data.TargetWorkstream = $matches[1]; continue }
        if ($line -match '^- Próxima ação dominante:\s+(.+)$') { $data.NextAction = $matches[1]; continue }
        if ($line -match '^- Proxima acao dominante:\s+(.+)$') { $data.NextAction = $matches[1]; continue }
        if ($line -match '^- Evidência mínima:\s+(.+)$') { $data.EvidenceMinimum = $matches[1]; continue }
        if ($line -match '^- Evidencia minima:\s+(.+)$') { $data.EvidenceMinimum = $matches[1]; continue }
        if ($line -match '^- Promovido para:\s+(.+)$') { $data.PromotedTo = $matches[1]; continue }
    }

    return [pscustomobject]$data
}

function Get-NextSpecId {
    param([string]$Path)

    $today = Get-Date -Format 'yyyyMMdd'
    $content = if (Test-Path -LiteralPath $Path) {
        Get-Content -Raw -LiteralPath $Path -Encoding utf8
    } else {
        ''
    }

    $matches = [regex]::Matches($content, "### SPEC-$today-(\d{2})")
    $nextNumber = 1
    if ($matches.Count -gt 0) {
        $used = $matches | ForEach-Object { [int]$_.Groups[1].Value }
        $nextNumber = (($used | Measure-Object -Maximum).Maximum) + 1
    }
    return "SPEC-$today-" + $nextNumber.ToString('00')
}

function Ensure-AppendableFile {
    param(
        [string]$Path,
        [string[]]$HeaderLines
    )

    if (Test-Path -LiteralPath $Path) {
        return
    }

    $parent = Split-Path -Parent $Path
    if ($parent) {
        $null = New-Item -ItemType Directory -Force -Path $parent
    }
    Set-Content -LiteralPath $Path -Value $HeaderLines -Encoding utf8
}

function Update-IdeaBlock {
    param(
        [string[]]$AllLines,
        [pscustomobject]$IdeaBlock,
        [string]$NewState,
        [string]$PromotionTarget
    )

    $replacement = @()
    $insertedPromotion = $false
    $insertedNextAction = $false

    foreach ($line in $IdeaBlock.Lines) {
        if ($line -match '^- Estado:\s+') {
            $replacement += '- Estado: ' + $NewState
            continue
        }
        if ($line -match '^- Promovido para:\s+') {
            $replacement += '- Promovido para: ' + $PromotionTarget
            $insertedPromotion = $true
            continue
        }
        if ($line -match '^- Próxima ação dominante:\s+' -or $line -match '^- Proxima acao dominante:\s+') {
            $replacement += '- Próxima ação dominante: acompanhar ' + $PromotionTarget
            $insertedNextAction = $true
            continue
        }
        $replacement += $line
    }

    if (-not $insertedPromotion) {
        $replacement += '- Promovido para: ' + $PromotionTarget
    }
    if (-not $insertedNextAction) {
        $replacement += '- Próxima ação dominante: acompanhar ' + $PromotionTarget
    }

    $updatedLines = @()
    if ($IdeaBlock.StartIndex -gt 0) {
        $updatedLines += $AllLines[0..($IdeaBlock.StartIndex - 1)]
    }
    $updatedLines += $replacement
    if ($IdeaBlock.EndIndex -lt ($AllLines.Count - 1)) {
        $updatedLines += $AllLines[($IdeaBlock.EndIndex + 1)..($AllLines.Count - 1)]
    }

    return $updatedLines
}

if (-not (Test-Path -LiteralPath $IdeaQueuePath)) {
    throw "Fila de ideias não encontrada em '$IdeaQueuePath'."
}

$ideaLines = @(Get-Content -LiteralPath $IdeaQueuePath -Encoding utf8)
$ideaBlocks = Get-IdeaBlocks -Path $IdeaQueuePath
$ideaBlock = $ideaBlocks | Where-Object { $_.Id -eq $IdeaId } | Select-Object -First 1
if ($null -eq $ideaBlock) {
    throw "IDEA '$IdeaId' não encontrada em '$IdeaQueuePath'."
}

$ideaMeta = Parse-IdeaBlock -Lines $ideaBlock.Lines

$finalTitle = if ([string]::IsNullOrWhiteSpace($Title)) { $ideaBlock.Title } else { $Title }
$finalTrack = if ([string]::IsNullOrWhiteSpace($Track)) { $ideaMeta.Track } else { $Track }
if ([string]::IsNullOrWhiteSpace($finalTrack)) { $finalTrack = 'hybrid' }

$finalSurface = if ([string]::IsNullOrWhiteSpace($Surface)) { $ideaMeta.Surface } else { $Surface }
if ([string]::IsNullOrWhiteSpace($finalSurface)) { $finalSurface = 'a confirmar' }

if ($PromoteTo -eq 'spec') {
    Ensure-AppendableFile -Path $DispatchQueuePath -HeaderLines @(
        '# Registro de Despachos de Especialistas do Collegium Cortex',
        '',
        'Nenhum despacho registrado ainda.',
        ''
    )

    $specId = Get-NextSpecId -Path $DispatchQueuePath
    $finalWorkstream = if ([string]::IsNullOrWhiteSpace($Workstream)) { $ideaMeta.TargetWorkstream } else { $Workstream }
    if ([string]::IsNullOrWhiteSpace($finalWorkstream)) { $finalWorkstream = 'novo' }

    $finalSubstrate = if ([string]::IsNullOrWhiteSpace($Substrate)) {
        if ($finalTrack -eq 'motor') { 'codex-cli' } else { 'gemini-cli' }
    } else {
        $Substrate
    }

    $finalObjective = if ([string]::IsNullOrWhiteSpace($Objective)) { $ideaMeta.Summary } else { $Objective }
    if ([string]::IsNullOrWhiteSpace($finalObjective)) { $finalObjective = 'estruturar a ideia em artefato revisável' }

    $finalResultExpected = if ([string]::IsNullOrWhiteSpace($ResultExpected)) {
        'produzir uma saída revisável com rastreabilidade entre aplicação, motor e sincronismo'
    } else {
        $ResultExpected
    }

    $finalDependsOn = if (@($DependsOn).Count -gt 0) { @($DependsOn) } elseif (-not [string]::IsNullOrWhiteSpace($IdeaId)) { @($IdeaId) } else { @() }
    $finalInputNotes = if (@($InputNotes).Count -gt 0) { @($InputNotes) } else { @($IdeaId) }

    $skillLines = if (@($Skills).Count -gt 0) {
        $Skills | ForEach-Object { '  - `' + $_ + '`' }
    } else {
        @('  - nenhuma skill nomeada')
    }

    $inputLines = if (@($finalInputNotes).Count -gt 0) {
        $finalInputNotes | ForEach-Object { '  - [[' + $_ + ']]' }
    } else {
        @('  - a definir')
    }

    $dependsText = if (@($finalDependsOn).Count -gt 0) { $finalDependsOn -join ', ' } else { 'nenhum' }
    $nextSpecText = if ([string]::IsNullOrWhiteSpace($NextSpec)) { 'a definir' } else { $NextSpec }

    $workstreamLine = if ($finalWorkstream -match '^\[\[') {
        $finalWorkstream
    } elseif ($finalWorkstream -in @('novo', 'nenhum', 'a definir')) {
        $finalWorkstream
    } else {
        '[[' + $finalWorkstream + ']]'
    }

    $entryLines = @()
    $entryLines += "### $specId - $finalTitle"
    $entryLines += '- Estado: queued'
    $entryLines += '- Track: ' + $finalTrack
    $entryLines += '- Dono C-Level: ' + $Owner
    $entryLines += '- Solicitado por: ' + $RequestedBy
    $entryLines += '- Workstream: ' + $workstreamLine
    $entryLines += '- Superfície alvo: ' + $finalSurface
    $entryLines += '- Substrato sugerido: ' + $finalSubstrate
    $entryLines += '- DependsOn: ' + $dependsText
    $entryLines += '- Skills obrigatórias:'
    $entryLines += $skillLines
    $entryLines += '- Objetivo: ' + $finalObjective
    $entryLines += '- Entradas obrigatórias:'
    $entryLines += $inputLines
    $entryLines += '- Resultado esperado: ' + $finalResultExpected
    $entryLines += '- Envelope de saída esperado: ' + $Envelope
    $entryLines += '- Próximo SPEC derivável em caso de aprovação: ' + $nextSpecText
    $entryLines += ''

    $dispatchLines = @(Get-Content -LiteralPath $DispatchQueuePath -Encoding utf8)
    if ($dispatchLines -contains 'Nenhum despacho registrado ainda.') {
        $updatedDispatchLines = @()
        foreach ($line in $dispatchLines) {
            if ($line -eq 'Nenhum despacho registrado ainda.') {
                $updatedDispatchLines += $entryLines
                continue
            }
            $updatedDispatchLines += $line
        }
    }
    else {
        $updatedDispatchLines = @($dispatchLines)
        if ($updatedDispatchLines.Count -gt 0 -and $updatedDispatchLines[-1] -ne '') {
            $updatedDispatchLines += ''
        }
        $updatedDispatchLines += ''
        $updatedDispatchLines += $entryLines
    }

    $updatedIdeaLines = Update-IdeaBlock -AllLines $ideaLines -IdeaBlock $ideaBlock -NewState 'promoted' -PromotionTarget $specId

    Set-Content -LiteralPath $DispatchQueuePath -Value $updatedDispatchLines -Encoding utf8
    Set-Content -LiteralPath $IdeaQueuePath -Value $updatedIdeaLines -Encoding utf8

    Write-Output ('PROMOTED ' + $IdeaId + ' -> ' + $specId)
    return
}

$registerDecisionScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'register-decision-case.ps1'
if (-not (Test-Path -LiteralPath $registerDecisionScript)) {
    throw "Script de decisão não encontrado em '$registerDecisionScript'."
}

$finalLayer = if ([string]::IsNullOrWhiteSpace($Layer)) {
    switch ($finalTrack) {
        'motor' { 'agentic' }
        'application' { 'aplicação' }
        default { 'institucional' }
    }
} else {
    $Layer
}

$finalRouting = if ([string]::IsNullOrWhiteSpace($RoutingNote)) {
    switch ($finalTrack) {
        'motor' { 'Roteamento - Repo e Implementação' }
        'application' { 'Roteamento - Produto, UI e Superfícies' }
        default { 'Roteamento - Fluxos Operacionais' }
    }
} else {
    $RoutingNote
}

$finalContext = if ([string]::IsNullOrWhiteSpace($Context)) { $ideaMeta.Summary } else { $Context }
if ([string]::IsNullOrWhiteSpace($finalContext)) { $finalContext = 'ideia promovida para deliberação formal' }

$finalOptions = if (@($Options).Count -gt 0) {
    $Options
} else {
    @(
        'promover para SPEC funcional',
        'abrir WS dedicado',
        'estacionar ou rejeitar'
    )
}

$finalRisk = if ([string]::IsNullOrWhiteSpace($Risk)) {
    'ideia ainda sem decisão formal, com potencial de afetar sincronismo entre aplicação e motor'
} else {
    $Risk
}

$finalReadSet = if (@($ReadSet).Count -gt 0) { $ReadSet } else { @($IdeaId) }

$decisionOutput = @(
    & $registerDecisionScript -Title $finalTitle -Layer $finalLayer -RoutingNote $finalRouting -Context $finalContext -Options $finalOptions -Risk $finalRisk -ReadSet $finalReadSet -EscalateToChairman:$EscalateToChairman -QueuePath $DecisionQueuePath
)
$createdLine = $decisionOutput | Where-Object { $_ -match '^CREATED\s+(DEC-\d{8}-\d{2})$' } | Select-Object -First 1
if (-not $createdLine) {
    throw 'Não foi possível identificar o DEC criado.'
}
$decisionId = ($createdLine -split '\s+')[1]

$updatedIdeaLines = Update-IdeaBlock -AllLines $ideaLines -IdeaBlock $ideaBlock -NewState 'promoted' -PromotionTarget $decisionId
Set-Content -LiteralPath $IdeaQueuePath -Value $updatedIdeaLines -Encoding utf8

Write-Output ('PROMOTED ' + $IdeaId + ' -> ' + $decisionId)
