<#
.SYNOPSIS
Builds the current ESAT analysis bundle and prepares the GitHub Pages checkout.

.DESCRIPTION
This is the canonical bridge between:
  1. PaperDatabases/Esat Categorisation/analysis_v2
  2. ppqviewer source
  3. deploy/esatwallop (the GitHub Desktop checkout)

It validates and rebuilds the deep analysis bundle, assembles the self-contained
website, adds deterministic cache-busting tokens, verifies JavaScript syntax,
and leaves reviewed file changes for GitHub Desktop.

It never stages, commits, pushes, deletes, or changes GitHub settings.

Maintainer: Codex
#>

[CmdletBinding()]
param(
    [string]$PaperDatabasesRoot = "C:\CodexProjects\PaperDatabases",
    [string]$EsatPrepRoot = "C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App",
    [string]$DeployRoot = "",
    [switch]$SkipAnalysisBuild,
    [switch]$SkipAnalysisValidation,
    [switch]$FullAssets
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$DefaultPaperDatabasesRoot = "C:\CodexProjects\PaperDatabases"
$NormalisedPaperDatabasesRoot = $PaperDatabasesRoot.TrimEnd("\", "/")
$NormalisedScriptPath = $PSCommandPath.TrimEnd("\", "/")
if ($NormalisedPaperDatabasesRoot.Equals(
        $NormalisedScriptPath,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
    Write-Host "Ignoring an accidental script-path argument and using the default PaperDatabases location." -ForegroundColor DarkYellow
    $PaperDatabasesRoot = $DefaultPaperDatabasesRoot
}

$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
if (-not $DeployRoot) {
    $DeployRoot = Join-Path $ProjectRoot "deploy\esatwallop"
}

$AnalysisRoot = Join-Path $PaperDatabasesRoot "Esat Categorisation\analysis_v2"
$AnalysisBundle = Join-Path $AnalysisRoot "dist\esat_analysis_v2.js"
$ClassificationBundle = Join-Path $AnalysisRoot "dist\esat_classification.js"
$AnalysisValidator = Join-Path $AnalysisRoot "scripts\validate_analysis_v2.py"
$FeedbackStatusBuilder = Join-Path $AnalysisRoot "scripts\build_feedback_status_ledger.py"
$AnalysisBuilder = Join-Path $AnalysisRoot "scripts\build_ppqviewer_bundle.py"
$ClassificationBuilder = Join-Path $AnalysisRoot "scripts\build_viewer_classification_bundle.py"
$BundledPython = Join-Path $PaperDatabasesRoot "tools\python\python.exe"

$ViewerJs = Join-Path $ProjectRoot "engine\ppqviewer.js"
$ViewerCss = Join-Path $ProjectRoot "engine\ppqviewer.css"
$SourceHtml = Join-Path $ProjectRoot "example\esat-compare.html"
$LoginJs = Join-Path $ProjectRoot "example\ppq-login.js"
$PresentationTest = Join-Path $ProjectRoot "test\verify_analysis_presentation.js"

$CatalogueJs = Join-Path $EsatPrepRoot "app\data\esat_catalogue.js"
$LegacyAnalysisRoot = Join-Path $EsatPrepRoot "data\analysis"
$CropRoot = Join-Path $EsatPrepRoot "app\assets\crops"

$DistRoot = Join-Path $ProjectRoot "dist\esat-compare"

function Assert-Exists {
    param([string]$LiteralPath, [string]$Label)
    if (-not (Test-Path -LiteralPath $LiteralPath)) {
        throw "$Label was not found: $LiteralPath"
    }
}

function Ensure-Directory {
    param([string]$LiteralPath)
    if (-not (Test-Path -LiteralPath $LiteralPath)) {
        New-Item -ItemType Directory -Path $LiteralPath -Force | Out-Null
    }
}

function Copy-ExactFile {
    param([string]$Source, [string]$Destination)
    Assert-Exists -LiteralPath $Source -Label "Source file"
    Ensure-Directory -LiteralPath (Split-Path -Parent $Destination)
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

function Get-ShortHash {
    param([string]$LiteralPath, [int]$Length = 12)
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $LiteralPath).Hash.Substring(0, $Length).ToLowerInvariant()
}

function Write-Utf8NoBom {
    param([string]$LiteralPath, [string]$Content)
    $Encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($LiteralPath, $Content, $Encoding)
}

Write-Host ""
Write-Host "ESAT website sync - maintained by Codex" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot"
Write-Host "Analysis: $AnalysisRoot"
Write-Host "GitHub Desktop checkout: $DeployRoot"
Write-Host ""

@(
    @{ Path = $AnalysisRoot; Label = "Analysis project" },
    @{ Path = $BundledPython; Label = "PaperDatabases Python runtime" },
    @{ Path = $FeedbackStatusBuilder; Label = "Feedback-status ledger builder" },
    @{ Path = $ClassificationBuilder; Label = "Classification bundle builder" },
    @{ Path = $ViewerJs; Label = "Viewer JavaScript" },
    @{ Path = $ViewerCss; Label = "Viewer stylesheet" },
    @{ Path = $SourceHtml; Label = "ESAT page source" },
    @{ Path = $LoginJs; Label = "Login module" },
    @{ Path = $PresentationTest; Label = "Analysis presentation test" },
    @{ Path = $CatalogueJs; Label = "ESAT catalogue" },
    @{ Path = $LegacyAnalysisRoot; Label = "Legacy analysis folder" },
    @{ Path = $CropRoot; Label = "Question crop folder" },
    @{ Path = (Join-Path $DeployRoot ".git"); Label = "GitHub Pages checkout" }
) | ForEach-Object {
    Assert-Exists -LiteralPath $_.Path -Label $_.Label
}

if (-not $SkipAnalysisBuild) {
    if (-not $SkipAnalysisValidation) {
        Write-Host "[1/7] Validating PaperDatabases analysis..." -ForegroundColor Yellow
        & $BundledPython $AnalysisValidator
        if ($LASTEXITCODE -ne 0) {
            throw "Analysis validation failed with exit code $LASTEXITCODE. No website files were changed."
        }
    }
    else {
        Write-Host "[1/7] Analysis validation skipped by request." -ForegroundColor DarkYellow
    }

    Write-Host "[1b/7] Rebuilding the authoritative feedback-status ledger..." -ForegroundColor Yellow
    & $BundledPython $FeedbackStatusBuilder
    if ($LASTEXITCODE -ne 0) {
        throw "Feedback-status ledger build failed with exit code $LASTEXITCODE. No website files were changed."
    }

    Write-Host "[2/7] Rebuilding the browser analysis bundle..." -ForegroundColor Yellow
    & $BundledPython $AnalysisBuilder
    if ($LASTEXITCODE -ne 0) {
        throw "Analysis bundle build failed with exit code $LASTEXITCODE. No website files were changed."
    }
}
else {
    Write-Host "[1/7] Analysis validation skipped with -SkipAnalysisBuild." -ForegroundColor DarkYellow
    Write-Host "[2/7] Using the existing analysis bundle." -ForegroundColor DarkYellow
}

Write-Host "[2b/7] Rebuilding the provisional subtopic bundle..." -ForegroundColor Yellow
& $BundledPython $ClassificationBuilder
if ($LASTEXITCODE -ne 0) {
    throw "Classification bundle build failed with exit code $LASTEXITCODE. No website files were changed."
}

Assert-Exists -LiteralPath $AnalysisBundle -Label "Built analysis bundle"
Assert-Exists -LiteralPath $ClassificationBundle -Label "Built classification bundle"

Write-Host "[3/7] Checking source JavaScript syntax..." -ForegroundColor Yellow
& node --check $ViewerJs
if ($LASTEXITCODE -ne 0) {
    throw "Viewer JavaScript syntax check failed."
}
& node --check $AnalysisBundle
if ($LASTEXITCODE -ne 0) {
    throw "Analysis bundle JavaScript syntax check failed."
}
& node --check $ClassificationBundle
if ($LASTEXITCODE -ne 0) {
    throw "Classification bundle JavaScript syntax check failed."
}

$DistEngine = Join-Path $DistRoot "engine"
$DistData = Join-Path $DistRoot "data"
$DistLegacy = Join-Path $DistData "analysis"
$DistCrops = Join-Path $DistRoot "assets\crops"
$DeployEngine = Join-Path $DeployRoot "engine"
$DeployData = Join-Path $DeployRoot "data"
$DeployLegacy = Join-Path $DeployData "analysis"
$DeployCrops = Join-Path $DeployRoot "assets\crops"

@(
    $DistRoot, $DistEngine, $DistData, $DistLegacy, $DistCrops,
    $DeployRoot, $DeployEngine, $DeployData, $DeployLegacy, $DeployCrops
) | ForEach-Object { Ensure-Directory -LiteralPath $_ }

Write-Host "[4/7] Copying current engine and analysis inputs..." -ForegroundColor Yellow

$FileCopies = @(
    @{ Source = $ViewerJs; Dist = (Join-Path $DistEngine "ppqviewer.js"); Deploy = (Join-Path $DeployEngine "ppqviewer.js") },
    @{ Source = $ViewerCss; Dist = (Join-Path $DistEngine "ppqviewer.css"); Deploy = (Join-Path $DeployEngine "ppqviewer.css") },
    @{ Source = $LoginJs; Dist = (Join-Path $DistRoot "ppq-login.js"); Deploy = (Join-Path $DeployRoot "ppq-login.js") },
    @{ Source = $CatalogueJs; Dist = (Join-Path $DistData "esat_catalogue.js"); Deploy = (Join-Path $DeployData "esat_catalogue.js") },
    @{ Source = $AnalysisBundle; Dist = (Join-Path $DistData "esat_analysis_v2.js"); Deploy = (Join-Path $DeployData "esat_analysis_v2.js") },
    @{ Source = $ClassificationBundle; Dist = (Join-Path $DistData "esat_classification.js"); Deploy = (Join-Path $DeployData "esat_classification.js") }
)

foreach ($Copy in $FileCopies) {
    Copy-ExactFile -Source $Copy.Source -Destination $Copy.Dist
    Copy-ExactFile -Source $Copy.Source -Destination $Copy.Deploy
}

Get-ChildItem -LiteralPath $LegacyAnalysisRoot -File -Filter "*.js" | ForEach-Object {
    Copy-ExactFile -Source $_.FullName -Destination (Join-Path $DistLegacy $_.Name)
    Copy-ExactFile -Source $_.FullName -Destination (Join-Path $DeployLegacy $_.Name)
}

$DeployCropCount = (Get-ChildItem -LiteralPath $DeployCrops -File -Filter "*.png" -ErrorAction SilentlyContinue).Count
if ($FullAssets -or $DeployCropCount -eq 0) {
    Write-Host "      Copying all question crops (full-assets mode)..."
    Get-ChildItem -LiteralPath $CropRoot -File -Filter "*.png" | ForEach-Object {
        Copy-ExactFile -Source $_.FullName -Destination (Join-Path $DistCrops $_.Name)
        Copy-ExactFile -Source $_.FullName -Destination (Join-Path $DeployCrops $_.Name)
    }
}
else {
    Write-Host "      Reusing $DeployCropCount existing crops. Use -FullAssets after catalogue/crop changes."
}

Write-Host "[5/7] Generating deployable index with cache busting..." -ForegroundColor Yellow

$EngineHash = Get-ShortHash -LiteralPath $ViewerJs
$CssHash = Get-ShortHash -LiteralPath $ViewerCss
$AnalysisHash = Get-ShortHash -LiteralPath $AnalysisBundle
$ClassificationHash = Get-ShortHash -LiteralPath $ClassificationBundle
$CatalogueHash = Get-ShortHash -LiteralPath $CatalogueJs
$LoginHash = Get-ShortHash -LiteralPath $LoginJs
$BuildId = $EngineHash.Substring(0, 4) + $AnalysisHash.Substring(0, 4) + $ClassificationHash.Substring(0, 4)

$Html = [System.IO.File]::ReadAllText($SourceHtml)
$RequiredReplacements = @(
    @{ Old = 'href="../engine/ppqviewer.css"'; New = ('href="engine/ppqviewer.css?v=' + $CssHash + '"') },
    @{ Old = 'src="../../ESAT Prep App/app/data/esat_catalogue.js"'; New = ('src="data/esat_catalogue.js?v=' + $CatalogueHash + '"') },
    @{ Old = 'src="../../ESAT Prep App/data/analysis/'; New = 'src="data/analysis/' },
    @{ Old = 'src="../../../CodexProjects/PaperDatabases/Esat Categorisation/analysis_v2/dist/esat_analysis_v2.js"'; New = ('src="data/esat_analysis_v2.js?v=' + $AnalysisHash + '"') },
    @{ Old = 'src="../../../CodexProjects/PaperDatabases/Esat Categorisation/analysis_v2/dist/esat_classification.js"'; New = ('src="data/esat_classification.js?v=' + $ClassificationHash + '"') },
    @{ Old = 'src="../engine/ppqviewer.js"'; New = ('src="engine/ppqviewer.js?v=' + $EngineHash + '"') },
    @{ Old = 'src="ppq-login.js"'; New = ('src="ppq-login.js?v=' + $LoginHash + '"') },
    @{ Old = 'var ESAT_BASE = "file:///C:/Claude (not on Gdrive, nor OneDrive)/ESAT Prep App/app/";'; New = 'var ESAT_BASE = "";' },
    @{ Old = 'appVersion: "ppqviewer-esat-compare"'; New = ('appVersion: "ppqviewer-esat-compare-' + $BuildId + '"') }
)

foreach ($Replacement in $RequiredReplacements) {
    if (-not $Html.Contains($Replacement.Old)) {
        throw "Website source contract changed; required text was not found: $($Replacement.Old)"
    }
    $Html = $Html.Replace($Replacement.Old, $Replacement.New)
}

# Apply the build token to legacy analysis scripts without changing source names.
$LegacyScriptPattern = 'src="data/analysis/([^"]+\.js)"'
$LegacyScriptReplacement = 'src="data/analysis/$1?v=' + $BuildId + '"'
$Html = [regex]::Replace($Html, $LegacyScriptPattern, $LegacyScriptReplacement)

$Banner = @(
    '<!-- ============================================================'
    '  GENERATED ESAT WEBSITE BUILD'
    ('  Build: ' + $BuildId)
    '  Maintainer: Codex'
    '  Source: ppqviewer/example/esat-compare.html'
    '  Do not hand-edit this deployed index; run SYNC_ESAT_WEBSITE.cmd.'
    '  ============================================================ -->'
) -join "`r`n"
$Html = $Html.Replace("<!DOCTYPE html>", $Banner + "`r`n<!DOCTYPE html>")
$HeadReplacement = '<head>' + "`r`n" +
    '  <meta name="ppq-build" content="' + $BuildId + '">' + "`r`n" +
    '  <meta name="ppq-maintainer" content="Codex">'
$Html = $Html.Replace(
    "<head>",
    $HeadReplacement
)

$DistIndex = Join-Path $DistRoot "index.html"
$DeployIndex = Join-Path $DeployRoot "index.html"
Write-Utf8NoBom -LiteralPath $DistIndex -Content $Html
Copy-ExactFile -Source $DistIndex -Destination $DeployIndex

$RecordCount = (Select-String -LiteralPath $AnalysisBundle -SimpleMatch -Pattern '"identity": {').Count
$ClassificationPrefix = "window.ESAT_CLASSIFICATION = "
$ClassificationText = [System.IO.File]::ReadAllText($ClassificationBundle).Trim()
if (-not $ClassificationText.StartsWith($ClassificationPrefix) -or -not $ClassificationText.EndsWith(";")) {
    throw "Classification bundle wrapper is not in the expected window.ESAT_CLASSIFICATION form."
}
$ClassificationJson = $ClassificationText.Substring(
    $ClassificationPrefix.Length,
    $ClassificationText.Length - $ClassificationPrefix.Length - 1
)
$ClassificationPayload = $ClassificationJson | ConvertFrom-Json
$ClassificationCount = [int]$ClassificationPayload.question_count
$BuildInfo = [ordered]@{
    build_id = $BuildId
    built_at_utc = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
    maintainer = "Codex"
    analysis_records = $RecordCount
    classified_questions = $ClassificationCount
    engine_sha256_12 = $EngineHash
    css_sha256_12 = $CssHash
    analysis_sha256_12 = $AnalysisHash
    classification_sha256_12 = $ClassificationHash
    catalogue_sha256_12 = $CatalogueHash
    source_analysis = "PaperDatabases/Esat Categorisation/analysis_v2"
}
$BuildInfoJson = $BuildInfo | ConvertTo-Json
Write-Utf8NoBom -LiteralPath (Join-Path $DistRoot "build-info.json") -Content ($BuildInfoJson + "`n")
Copy-ExactFile -Source (Join-Path $DistRoot "build-info.json") -Destination (Join-Path $DeployRoot "build-info.json")

Write-Host "[6/7] Verifying assembled deployment JavaScript..." -ForegroundColor Yellow
& node --check (Join-Path $DeployEngine "ppqviewer.js")
if ($LASTEXITCODE -ne 0) { throw "Deployed viewer JavaScript syntax check failed." }
& node --check (Join-Path $DeployData "esat_analysis_v2.js")
if ($LASTEXITCODE -ne 0) { throw "Deployed analysis JavaScript syntax check failed." }
& node --check (Join-Path $DeployData "esat_classification.js")
if ($LASTEXITCODE -ne 0) { throw "Deployed classification JavaScript syntax check failed." }
& node $PresentationTest
if ($LASTEXITCODE -ne 0) { throw "Analysis presentation acceptance test failed." }

Write-Host "[7/7] Website prepared for GitHub Desktop." -ForegroundColor Green
Write-Host ""
Write-Host "Build ID: $BuildId"
Write-Host "Analysis records: $RecordCount"
Write-Host "Classified questions: $ClassificationCount"
Write-Host "Deployment checkout: $DeployRoot"
Write-Host ""

$SafeDeployRoot = $DeployRoot.Replace("\", "/")
& git -c "safe.directory=$SafeDeployRoot" -C $DeployRoot status --short

Write-Host ""
Write-Host "Next: open this repository in GitHub Desktop, review the listed files,"
Write-Host "commit with a clear summary, then click Push origin."
Write-Host "This script deliberately does not stage, commit, or push."
