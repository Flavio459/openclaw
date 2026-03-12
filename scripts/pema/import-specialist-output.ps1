[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SpecId,

    [Parameter(Mandatory = $true)]
    [string]$OutputFile,

    [ValidateSet('artefato', 'proposta', 'revisão', 'bloqueio', 'escalonamento', 'aprendizado', 'oportunidade')]
    [string]$OutputType = 'artefato',

    [ValidateSet('aprovado', 'retrabalho', 'rejeitado', 'escalado')]
    [string]$ReviewResult = 'aprovado',

    [string]$DispatchQueuePath = '',

    [string]$ReviewRegisterPath = '',

    [string]$VaultPath = 'W:\Collegium Cortex',

    [switch]$WhatIfOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Normalize-ForAnchor {
    param([string]$Value)

    $formD = $Value.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder
    foreach ($char in $formD.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($char)
        }
    }
    $normalized = $builder.ToString().Normalize([Text.NormalizationForm]::FormC).ToLowerInvariant()
    $normalized = [regex]::Replace($normalized, '[^\p{L}\p{Nd}\s-]', '')
    $normalized = [regex]::Replace($normalized, '\s+', '-')
    $normalized = [regex]::Replace($normalized, '-{2,}', '-')
    return $normalized.Trim('-')
}

function Normalize-PlainText {
    param([string]$Value)

    $formD = $Value.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder
    foreach ($char in $formD.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($char)
        }
    }
    return $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function Sanitize-FileComponent {
    param([string]$Value)

    $invalid = [IO.Path]::GetInvalidFileNameChars()
    $chars = $Value.ToCharArray() | ForEach-Object {
        if ($invalid -contains $_) { '-' } else { $_ }
    }
    return (-join $chars).Trim()
}

function Resolve-VaultFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedBaseName
    )

    $direct = Join-Path $BasePath ($ExpectedBaseName + '.md')
    if (Test-Path -LiteralPath $direct) {
        return $direct
    }

    $expectedNormalized = (Normalize-PlainText -Value $ExpectedBaseName).ToLowerInvariant()
    $match = Get-ChildItem -LiteralPath $BasePath -File -Filter *.md | Where-Object {
        (Normalize-PlainText -Value $_.BaseName).ToLowerInvariant() -eq $expectedNormalized
    } | Select-Object -First 1

    if ($null -ne $match) {
        return $match.FullName
    }

    return $null
}

function Get-DispatchSpecBlocks {
    param([string]$Path)

    $lines = Get-Content -LiteralPath $Path -Encoding utf8
    $blocks = @()
    $current = $null

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '^###\s+(SPEC-\d{8}-\d{2})\s+[-—]\s+(.+)$') {
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

function Parse-DispatchBlock {
    param([string[]]$Lines)

    $data = @{
        State = ''
        Track = ''
        Owner = ''
        RequestedBy = ''
        Workstream = ''
        Surface = ''
        DependsOn = @()
        NextSpec = ''
    }

    foreach ($line in $Lines) {
        if ($line -match '^- Estado:\s+(.+)$') { $data.State = $matches[1]; continue }
        if ($line -match '^- Track:\s+(.+)$') { $data.Track = $matches[1]; continue }
        if ($line -match '^- Dono C-Level:\s+(.+)$') { $data.Owner = $matches[1]; continue }
        if ($line -match '^- Solicitado por:\s+(.+)$') { $data.RequestedBy = $matches[1]; continue }
        if ($line -match '^- Workstream:\s+\[\[(.+?)(?:\|.+)?\]\]$') { $data.Workstream = $matches[1]; continue }
        if ($line -match '^- Workstream:\s+(.+)$') { $data.Workstream = $matches[1]; continue }
        if ($line -match '^- Superfície alvo:\s+(.+)$') { $data.Surface = $matches[1]; continue }
        if ($line -match '^- DependsOn:\s+(.+)$') {
            $dependsValue = $matches[1].Trim()
            if (-not [string]::IsNullOrWhiteSpace($dependsValue) -and $dependsValue -ne 'nenhum') {
                $data.DependsOn = @(
                    $dependsValue.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
                )
            }
            continue
        }
        if ($line -match '^- Pr.+ximo SPEC deriv.+ em caso de aprova.+:\s+(.+)$') { $data.NextSpec = $matches[1]; continue }
    }

    return [pscustomobject]$data
}

function Get-NextReviewId {
    param([string]$ReviewContent)

    $today = Get-Date -Format 'yyyyMMdd'
    $matches = [regex]::Matches($ReviewContent, "### REV-$today-(\d{2})")
    $nextNumber = 1
    if ($matches.Count -gt 0) {
        $used = $matches | ForEach-Object { [int]$_.Groups[1].Value }
        $nextNumber = (($used | Measure-Object -Maximum).Maximum) + 1
    }
    return "REV-$today-" + $nextNumber.ToString('00')
}

function Extract-SectionText {
    param(
        [string]$Content,
        [string[]]$Headings
    )

    foreach ($heading in $Headings) {
        $escapedHeading = [regex]::Escape($heading)
        $pattern = '(?ms)^##\s+' + $escapedHeading + '\s*\r?\n(.*?)(?=^##\s+|\z)'
        $match = [regex]::Match($Content, $pattern)
        if ($match.Success) {
            return $match.Groups[1].Value.Trim()
        }
    }

    return ''
}

if ([string]::IsNullOrWhiteSpace($DispatchQueuePath)) {
    $DispatchQueuePath = Resolve-VaultFile -BasePath $VaultPath -ExpectedBaseName 'Registro de Despachos de Especialistas do Collegium Cortex'
}
if ([string]::IsNullOrWhiteSpace($ReviewRegisterPath)) {
    $ReviewRegisterPath = Resolve-VaultFile -BasePath $VaultPath -ExpectedBaseName 'Registro de Revisoes e Fechamentos do Collegium Cortex'
}

if (-not $DispatchQueuePath -or -not (Test-Path -LiteralPath $DispatchQueuePath)) {
    throw "Registro de despachos nao encontrado em '$DispatchQueuePath'."
}
if (-not $ReviewRegisterPath -or -not (Test-Path -LiteralPath $ReviewRegisterPath)) {
    throw "Registro de revisoes nao encontrado em '$ReviewRegisterPath'."
}
if (-not (Test-Path -LiteralPath $OutputFile)) {
    throw "Arquivo de saida nao encontrado em '$OutputFile'."
}

$importMutex = [System.Threading.Mutex]::new($false, 'Global\CollegiumCortexImportSpecialistOutput')
$lockTaken = $false

try {
    $lockTaken = $importMutex.WaitOne([TimeSpan]::FromSeconds(30))
    if (-not $lockTaken) {
        throw 'Nao foi possivel obter o lock de importacao do Collegium Cortex em 30 segundos.'
    }

    $dispatchBlocks = Get-DispatchSpecBlocks -Path $DispatchQueuePath
    $specBlock = $dispatchBlocks | Where-Object { $_.Id -eq $SpecId } | Select-Object -First 1
    if ($null -eq $specBlock) {
        throw "SPEC '$SpecId' nao encontrado em '$DispatchQueuePath'."
    }

    $specMeta = Parse-DispatchBlock -Lines $specBlock.Lines
    $reviewOwner = if ($specMeta.RequestedBy -in @('CEO', 'CTO', 'CFO', 'Legal', 'CMO', 'Chairman')) { $specMeta.RequestedBy } else { $specMeta.Owner }
    $importedBody = Get-Content -Raw -LiteralPath $OutputFile -Encoding utf8
    $importedBody = $importedBody.Trim()
    $importedBody = [regex]::Replace($importedBody, '^#\s+' + [regex]::Escape($SpecId) + '.*?(\r?\n)+', '', 'Singleline')

    $produced = Extract-SectionText -Content $importedBody -Headings @('O que foi produzido ou descoberto')
    $currentState = Extract-SectionText -Content $importedBody -Headings @('Estado atual')
    $risk = Extract-SectionText -Content $importedBody -Headings @('Principal risco ou limite')
    $impactSurface = Extract-SectionText -Content $importedBody -Headings @('Impacto em superficie', 'Impacto em superfície')
    $nextAction = Extract-SectionText -Content $importedBody -Headings @('Proxima acao dominante', 'Próxima ação dominante')
    $nextOwner = Extract-SectionText -Content $importedBody -Headings @('Proximo responsavel', 'Próximo responsável')

    if ([string]::IsNullOrWhiteSpace($produced)) { $produced = 'ver entrega importada' }
    if ([string]::IsNullOrWhiteSpace($currentState)) { $currentState = 'entrega importada para revisao formal' }
    if ([string]::IsNullOrWhiteSpace($risk)) { $risk = 'ainda nao resumido no envelope importado' }
    if ([string]::IsNullOrWhiteSpace($impactSurface)) {
        $impactSurface = if (-not [string]::IsNullOrWhiteSpace($specMeta.Surface)) {
            'sem conflito material reportado; manter superficie alvo em ' + $specMeta.Surface
        } else {
            'a confirmar no sync entre aplicacao e motor'
        }
    }
    if ([string]::IsNullOrWhiteSpace($nextAction)) {
        if (-not [string]::IsNullOrWhiteSpace($specMeta.NextSpec)) {
            $nextAction = $specMeta.NextSpec
        }
        else {
            $nextAction = 'definir proximo ciclo do workstream'
        }
    }
    if ([string]::IsNullOrWhiteSpace($nextOwner)) { $nextOwner = $reviewOwner }

    $safeTitle = Sanitize-FileComponent -Value $specBlock.Title
    $deliveryNoteName = "Entrega $SpecId - $safeTitle"
    $deliveryFilePath = Join-Path $VaultPath ($deliveryNoteName + '.md')
    $reviewNoteName = [IO.Path]::GetFileNameWithoutExtension($ReviewRegisterPath)
    $dispatchNoteName = [IO.Path]::GetFileNameWithoutExtension($DispatchQueuePath)
    $workstreamLabel = if ([string]::IsNullOrWhiteSpace($specMeta.Workstream)) { 'a definir' } else { $specMeta.Workstream }

    $deliveryLines = @()
    $deliveryLines += '# ' + $deliveryNoteName
    $deliveryLines += ''
    $deliveryLines += '## Metadados Operacionais'
    $deliveryLines += ''
    $deliveryLines += '- Tipo: entrega'
    $deliveryLines += '- Camada: agentic'
    $deliveryLines += '- Ler quando: houver necessidade de revisar formalmente a resposta do especialista ' + $SpecId + '.'
    $deliveryLines += '- Depende de: [[' + $dispatchNoteName + '|' + $SpecId + ']], ' + $(if ($workstreamLabel -eq 'a definir') { 'a definir' } else { '[[' + $workstreamLabel + ']]' })
    $deliveryLines += '- Destrava: [[' + $reviewNoteName + ']]'
    $deliveryLines += '- Repo relacionado: openclaw-push/docs/parallel-workflow.md'
    $deliveryLines += '- Status: ativo'
    $deliveryLines += ''
    $deliveryLines += '## Contexto do despacho'
    $deliveryLines += ''
    $deliveryLines += '- SPEC: ' + $SpecId
    $deliveryLines += '- Track: ' + $(if ([string]::IsNullOrWhiteSpace($specMeta.Track)) { 'a confirmar' } else { $specMeta.Track })
    $deliveryLines += '- Dono C-Level: ' + $specMeta.Owner
    $deliveryLines += '- Solicitado por: ' + $specMeta.RequestedBy
    $deliveryLines += '- Workstream: ' + $(if ($workstreamLabel -eq 'a definir') { 'a definir' } else { '[[' + $workstreamLabel + ']]' })
    $deliveryLines += '- Superfície alvo: ' + $(if ([string]::IsNullOrWhiteSpace($specMeta.Surface)) { 'a confirmar' } else { $specMeta.Surface })
    $deliveryLines += '- DependsOn: ' + $(if ($specMeta.DependsOn.Count -gt 0) { $specMeta.DependsOn -join ', ' } else { 'nenhum' })
    $deliveryLines += ''
    $deliveryLines += ($importedBody -split "`r?`n")
    $deliveryLines += ''

    $reviewContent = Get-Content -Raw -LiteralPath $ReviewRegisterPath -Encoding utf8
    $reviewId = Get-NextReviewId -ReviewContent $reviewContent
    $reviewTitle = 'Revisão de ' + $specBlock.Title
    $reviewAnchor = Normalize-ForAnchor -Value ($reviewId + ' - ' + $reviewTitle)
    $specAnchor = Normalize-ForAnchor -Value ($specBlock.Id + ' - ' + $specBlock.Title)

    $reviewEntryLines = @()
    $reviewEntryLines += '### ' + $reviewId + ' - ' + $reviewTitle
    $reviewEntryLines += '- Origem: [[' + $dispatchNoteName + '#' + $specAnchor + '|' + $SpecId + ']]'
    $reviewEntryLines += '- Dono revisor: ' + $reviewOwner
    $reviewEntryLines += '- Resultado: ' + $ReviewResult
    $reviewEntryLines += '- Track: ' + $(if ([string]::IsNullOrWhiteSpace($specMeta.Track)) { 'a confirmar' } else { $specMeta.Track })
    $reviewEntryLines += '- Tipo de saída recebida: ' + $OutputType
    $reviewEntryLines += '- Principal valor entregue: ' + $produced
    $reviewEntryLines += '- Risco dominante: ' + $risk
    $reviewEntryLines += '- ImpactsSurface: ' + $impactSurface
    $reviewEntryLines += '- Próxima ação dominante: ' + $nextAction
    $reviewEntryLines += '- Próximo responsável: ' + $nextOwner
    $reviewEntryLines += ''
    $reviewEntry = $reviewEntryLines -join [Environment]::NewLine

    $dispatchLines = Get-Content -LiteralPath $DispatchQueuePath -Encoding utf8
    $replacement = @()
    $insertedDelivery = $false
    $insertedClosing = $false
    foreach ($line in $specBlock.Lines) {
        if ($line -match '^- Estado:\s+') {
            $replacement += '- Estado: fechado'
            continue
        }
        if ($line -match '^- Saída entregue:\s+') {
            if (-not $insertedDelivery) {
                $replacement += '- Saída entregue: [[' + $deliveryNoteName + ']]'
                $insertedDelivery = $true
            }
            continue
        }
        if ($line -match '^- Fechamento:\s+') {
            if (-not $insertedClosing) {
                $replacement += '- Fechamento: [[' + $reviewNoteName + '#' + $reviewAnchor + '|' + $reviewId + ']]'
                $insertedClosing = $true
            }
            continue
        }
        $replacement += $line
    }
    if (-not $insertedDelivery) {
        $replacement += '- Saída entregue: [[' + $deliveryNoteName + ']]'
    }
    if (-not $insertedClosing) {
        $replacement += '- Fechamento: [[' + $reviewNoteName + '#' + $reviewAnchor + '|' + $reviewId + ']]'
    }

    $updatedDispatchLines = @()
    if ($specBlock.StartIndex -gt 0) {
        $updatedDispatchLines += $dispatchLines[0..($specBlock.StartIndex - 1)]
    }
    $updatedDispatchLines += $replacement
    if ($specBlock.EndIndex -lt ($dispatchLines.Count - 1)) {
        $updatedDispatchLines += $dispatchLines[($specBlock.EndIndex + 1)..($dispatchLines.Count - 1)]
    }

    $updatedReviewContent = $reviewContent.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $reviewEntry.TrimEnd() + [Environment]::NewLine

    if ($WhatIfOnly) {
        [pscustomobject]@{
            SpecId = $SpecId
            DeliveryFile = $deliveryFilePath
            ReviewId = $reviewId
            ReviewOwner = $reviewOwner
            OutputType = $OutputType
            ReviewResult = $ReviewResult
            ImpactSurface = $impactSurface
            NextAction = $nextAction
            NextOwner = $nextOwner
        } | ConvertTo-Json -Depth 4
        return
    }

    Set-Content -LiteralPath $deliveryFilePath -Value $deliveryLines -Encoding utf8
    Set-Content -LiteralPath $DispatchQueuePath -Value $updatedDispatchLines -Encoding utf8
    Set-Content -LiteralPath $ReviewRegisterPath -Value $updatedReviewContent -Encoding utf8

    Write-Output ('DELIVERY ' + $deliveryFilePath)
    Write-Output ('REVIEW ' + $reviewId)
}
finally {
    if ($lockTaken) {
        [void]$importMutex.ReleaseMutex()
    }
    $importMutex.Dispose()
}
