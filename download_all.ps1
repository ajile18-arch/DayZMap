# DayZ Master Tile Downloader & Status Tracker
param(
  [int[]]$ZoomLevels = @(6, 7),
  [int]$BatchSize = 256
)

$statusFile = "$PSScriptRoot/download_status.json"
$totalExpected = 1 + 4 + 16 + 64 + 256 + 1024 + 4096 + 16384 # 21,845 tiles

function Update-Status ($currentZoom, $zoomCurrent, $zoomTotal, $isFinished=$false) {
  $totalOnDisk = (Get-ChildItem -Recurse "$PSScriptRoot/tiles/topographic" -Filter "*.webp" -ErrorAction SilentlyContinue | Measure-Object).Count
  $overallPercent = [Math]::Round(($totalOnDisk / $totalExpected) * 100, 1)

  $status = @{
    active = (-not $isFinished)
    currentZoom = $currentZoom
    zoomProgress = "$zoomCurrent / $zoomTotal"
    totalOnDisk = $totalOnDisk
    totalExpected = $totalExpected
    overallPercent = $overallPercent
    updated = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  } | ConvertTo-Json

  [System.IO.File]::WriteAllText($statusFile, $status)
}

foreach ($z in $ZoomLevels) {
  $baseDir = "$PSScriptRoot/tiles/topographic/$z"
  $max = [Math]::Pow(2, $z) - 1
  $totalInZoom = ($max + 1) * ($max + 1)

  Write-Host "Checking Zoom Level $z ($totalInZoom tiles)..."

  $missing = [System.Collections.Generic.List[PSCustomObject]]::new()
  for ($x = 0; $x -le $max; $x++) {
    $xDir = "$baseDir/$x"
    if (-not (Test-Path $xDir)) { New-Item -ItemType Directory -Force -Path $xDir | Out-Null }
    for ($y = 0; $y -le $max; $y++) {
      $outFile = "$xDir/$y.webp".Replace('\', '/')
      if (-not (Test-Path $outFile)) {
        $missing.Add([PSCustomObject]@{
          Url = "https://static.xam.nu/dayz/maps/chernarusplus/1.27/topographic/$z/$x/$y.webp"
          Out = $outFile
        })
      }
    }
  }

  $alreadyHave = $totalInZoom - $missing.Count
  Update-Status $z $alreadyHave $totalInZoom

  if ($missing.Count -eq 0) {
    Write-Host "Zoom Level $z already 100% complete."
    continue
  }

  Write-Host "Downloading $($missing.Count) remaining tiles for Zoom Level $z..."
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

    $nowDone = $alreadyHave + $start + $count
    Update-Status $z $nowDone $totalInZoom
    Write-Host "Zoom $z Progress: $nowDone / $totalInZoom ($([Math]::Round(($nowDone/$totalInZoom)*100))%)"
  }
}

Update-Status "All" $totalExpected $totalExpected $true
Write-Host "All Zoom Levels 0 through 7 are 100% downloaded and saved locally!"
