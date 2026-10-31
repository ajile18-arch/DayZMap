# DayZ Chernarus Tile Downloader
param(
  [int]$ZoomLevel = 5,
  [int]$BatchSize = 128
)

$baseDir = "$PSScriptRoot/tiles/topographic/$ZoomLevel"
$max = [Math]::Pow(2, $ZoomLevel) - 1

Write-Host "Scanning Zoom Level $ZoomLevel (Total grid: $(($max+1)*($max+1)) tiles)..."

$missing = [System.Collections.Generic.List[PSCustomObject]]::new()

for ($x = 0; $x -le $max; $x++) {
  $xDir = "$baseDir/$x"
  if (-not (Test-Path $xDir)) { New-Item -ItemType Directory -Force -Path $xDir | Out-Null }
  for ($y = 0; $y -le $max; $y++) {
    $outFile = "$xDir/$y.webp".Replace('\', '/')
    if (-not (Test-Path $outFile)) {
      $missing.Add([PSCustomObject]@{
        Url = "https://static.xam.nu/dayz/maps/chernarusplus/1.27/topographic/$ZoomLevel/$x/$y.webp"
        Out = $outFile
      })
    }
  }
}

if ($missing.Count -eq 0) {
  Write-Host "All tiles for Zoom Level $ZoomLevel are already downloaded!"
  exit 0
}

Write-Host "Downloading $($missing.Count) missing tiles for Zoom Level $ZoomLevel in batches of $BatchSize..."

$batchFile = "$PSScriptRoot/curl_batch.txt"
$totalBatches = [Math]::Ceiling($missing.Count / $BatchSize)

for ($b = 0; $b -lt $totalBatches; $b++) {
  $start = $b * $BatchSize
  $count = [Math]::Min($BatchSize, $missing.Count - $start)
  $chunk = $missing.GetRange($start, $count)

  $sb = [System.Text.StringBuilder]::new()
  for ($i = 0; $i -lt $chunk.Count; $i++) {
    $item = $chunk[$i]
    if ($i -gt 0) { [void]$sb.AppendLine("--next") }
    [void]$sb.AppendLine("create-dirs")
    [void]$sb.AppendLine('-H "Referer: https://dayz.xam.nu/"')
    [void]$sb.AppendLine('-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"')
    [void]$sb.AppendLine("url = `"$($item.Url)`"")
    [void]$sb.AppendLine("output = `"$($item.Out)`"")
  }

  [System.IO.File]::WriteAllText($batchFile, $sb.ToString())
  & curl.exe -s --config $batchFile
  Remove-Item -Force $batchFile -ErrorAction SilentlyContinue

  $pct = [Math]::Round((($b + 1) / $totalBatches) * 100)
  Write-Host "Progress: $pct% (Batch $($b+1)/$totalBatches complete)"
}

$finalCount = (Get-ChildItem -Recurse $baseDir -Filter "*.webp" | Measure-Object).Count
Write-Host "Zoom Level $ZoomLevel complete! Total tiles on disk: $finalCount"
