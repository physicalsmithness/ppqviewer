$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$integration = Join-Path $workspace 'integration/teacher-clarifications'
$teacherRoot = 'C:\Claude (not on Gdrive, nor OneDrive)\TeacherViewer'
$receipt = Get-Content -LiteralPath (Join-Path $integration 'staging-receipt.json') -Raw | ConvertFrom-Json
$baseline = $receipt.receipts | Where-Object target -eq 'canonical-proposed'
function Get-TextHash([string]$path) {
  $bytes = [Text.Encoding]::UTF8.GetBytes([IO.File]::ReadAllText($path).Replace("`r`n", "`n"))
  return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
}
$writes = @(
  @{ source='Code.js'; target='shared_script/teacher-tracking.gs'; expected=$baseline.sourceCodeSha256 },
  @{ source='teacherviewer.html'; target='app/teacherviewer.html'; expected=$baseline.sourceHtmlSha256 },
  @{ source='appsscript.json'; target='shared_script/appsscript_manifest.json'; expected=(Get-TextHash (Join-Path $integration 'remote-before/appsscript.json')) }
)
foreach ($entry in $writes) {
  $target = [IO.Path]::GetFullPath((Join-Path $teacherRoot $entry.target))
  if (-not $target.StartsWith($teacherRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Target outside TeacherViewer' }
  if ((Get-TextHash $target) -ne $entry.expected) { throw "TeacherViewer source changed: $($entry.target)" }
}
$backup = Join-Path $integration ('canonical-before-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backup | Out-Null
foreach ($entry in $writes) {
  $target = Join-Path $teacherRoot $entry.target
  Copy-Item -LiteralPath $target -Destination (Join-Path $backup ($entry.source + '.before'))
  $proposed = Join-Path $integration ('canonical-proposed/' + $entry.source)
  [IO.File]::WriteAllText($target, [IO.File]::ReadAllText($proposed).Replace("`r`n","`n").Replace("`n","`r`n"), [Text.UTF8Encoding]::new($false))
  if ((Get-TextHash $target) -ne (Get-TextHash $proposed)) { throw 'Post-copy verification failed' }
  Write-Output ('Updated and verified ' + $entry.target)
}
Write-Output ('Prior files retained in ' + $backup)
