[CmdletBinding()]
param(
    [ValidateSet('project-status', 'product-ui', 'governance', 'economy', 'flows', 'data-audit', 'agents-deliberation')]
    [string]$Track = 'project-status',

    [string]$VaultPath = 'W:\Collegium Cortex',

    [string]$ReceiptDirectory = 'C:\Pico-Open\openclaw-push\scripts\pema\.bootstrap',

    [switch]$WriteReceipt,

    [switch]$AsJson
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Test-Path -LiteralPath $VaultPath)) {
    throw "Vault não encontrado em '$VaultPath'."
}

function Normalize-NoteKey {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $formD = $Value.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder
    foreach ($char in $formD.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($char)
        }
    }

    return $builder.ToString().Normalize([Text.NormalizationForm]::FormC).ToLowerInvariant()
}

function Resolve-VaultNotePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [Parameter(Mandatory = $true)]
        [string]$NoteName
    )

    $literalCandidate = Join-Path $BasePath ($NoteName + '.md')
    if (Test-Path -LiteralPath $literalCandidate) {
        return $literalCandidate
    }

    $expectedKey = Normalize-NoteKey -Value $NoteName
    $match = $null
    foreach ($file in Get-ChildItem -LiteralPath $BasePath -File) {
        if ([string]::IsNullOrWhiteSpace($file.BaseName)) {
            continue
        }

        if ((Normalize-NoteKey -Value $file.BaseName) -eq $expectedKey) {
            $match = $file
            break
        }
    }

    if ($null -ne $match) {
        return $match.FullName
    }

    return $literalCandidate
}

$baselineNotes = @(
    'ESTATUTO CNP - O Protocolo e a Matematica do SPV',
    'Collegium Cortex - Documento Mestre (Revisao Zero)',
    'Fonte de Verdade do Collegium Cortex'
)

$trackMap = @{
    'project-status' = @{
        RoutingNote = 'Roteamento - Produto, UI e Superficies'
        Reason = 'status geral do projeto e leitura macro de produto'
        ReadSet = @(
            'Visao do Projeto',
            'Fluxos de Trabalho do Collegium',
            'Collegium Cortex - Documento Mestre (Revisao Zero)'
        )
    }
    'product-ui' = @{
        RoutingNote = 'Roteamento - Produto, UI e Superficies'
        Reason = 'superfícies, UI e tradução visual da visão'
        ReadSet = @(
            'Visao do Projeto',
            'Fluxos de Trabalho do Collegium',
            'Collegium Cortex - Documento Mestre (Revisao Zero)'
        )
    }
    'governance' = @{
        RoutingNote = 'Roteamento - Governanca e Mandatos'
        Reason = 'mandato, escalonamento e decisão institucional'
        ReadSet = @(
            'ESTATUTO CNP - O Protocolo e a Matematica do SPV',
            'Matriz de Mandatos e Escalonamento dos C-Levels',
            'Motor Agentico do Collegium Cortex',
            'Contratos de Saida e Horizontes de Resultado do Collegium Cortex'
        )
    }
    'economy' = @{
        RoutingNote = 'Roteamento - Economia do Protocolo'
        Reason = 'regras econômicas, SPV e sustentabilidade'
        ReadSet = @(
            'ESTATUTO CNP - O Protocolo e a Matematica do SPV',
            'Prompt do CFO Digital - Matematica do Protocolo, Auditoria e Sustentabilidade',
            'Modelo Inicial de Dados do Collegium Cortex',
            'Matriz de Mandatos e Escalonamento dos C-Levels'
        )
    }
    'flows' = @{
        RoutingNote = 'Roteamento - Fluxos Operacionais'
        Reason = 'encadeamento entre WS, SPEC, REV e DEC'
        ReadSet = @(
            'Fluxos de Trabalho do Collegium',
            'Visao do Projeto',
            'ESTATUTO CNP - O Protocolo e a Matematica do SPV'
        )
    }
    'data-audit' = @{
        RoutingNote = 'Roteamento - Dados, Memoria e Auditoria'
        Reason = 'fonte factual, memória, auditoria e escala'
        ReadSet = @(
            'Arquitetura de Memoria e Execucao do Collegium Cortex',
            'Modelo Inicial de Dados do Collegium Cortex',
            'ESTATUTO CNP - O Protocolo e a Matematica do SPV'
        )
    }
    'agents-deliberation' = @{
        RoutingNote = 'Roteamento - Agentes e Deliberacao'
        Reason = 'motor agentico, despachos, revisões e conselho'
        ReadSet = @(
            'Motor Agentico do Collegium Cortex',
            'Protocolo Operacional do Motor Agentico',
            'Contratos de Saida e Horizontes de Resultado do Collegium Cortex',
            'Matriz de Mandatos e Escalonamento dos C-Levels',
            'Fluxos de Trabalho do Collegium'
        )
    }
}

$selected = $trackMap[$Track]
$requiredNotes = @($baselineNotes + @($selected.RoutingNote) + $selected.ReadSet) | Select-Object -Unique

$results = foreach ($note in $requiredNotes) {
    $path = Resolve-VaultNotePath -BasePath $VaultPath -NoteName $note
    [pscustomobject]@{
        Note = $note
        Path = $path
        Exists = Test-Path -LiteralPath $path
    }
}

$missing = @($results | Where-Object { -not $_.Exists })
$passed = $missing.Count -eq 0
$missingNames = @($missing | ForEach-Object { $_.Note })

$payload = [pscustomobject]@{
    Track = $Track
    Reason = $selected.Reason
    VaultPath = $VaultPath
    RoutingNote = $selected.RoutingNote
    RequiredNotes = $results
    Passed = $passed
    MissingNotes = $missingNames
    Timestamp = (Get-Date).ToString('o')
}

if ($WriteReceipt) {
    if (-not (Test-Path -LiteralPath $ReceiptDirectory)) {
        New-Item -ItemType Directory -Path $ReceiptDirectory | Out-Null
    }

    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $receiptPath = Join-Path $ReceiptDirectory ("bootstrap-$Track-$stamp.json")
    $payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
    $payload | Add-Member -NotePropertyName ReceiptPath -NotePropertyValue $receiptPath
}

if ($AsJson) {
    $payload | ConvertTo-Json -Depth 6
    return
}

Write-Output ("TRACK {0}" -f $payload.Track)
Write-Output ("REASON {0}" -f $payload.Reason)
Write-Output ("ROUTING_NOTE {0}" -f $payload.RoutingNote)

foreach ($entry in $results) {
    $status = if ($entry.Exists) { 'OK' } else { 'MISSING' }
    Write-Output ("{0} {1}" -f $status, $entry.Path)
}

if ($WriteReceipt) {
    Write-Output ("RECEIPT {0}" -f $payload.ReceiptPath)
}

if (-not $passed) {
    throw ("Bootstrap canônico incompleto. Notas ausentes: {0}" -f ($missingNames -join ', '))
}

Write-Output 'BOOTSTRAP_OK'
