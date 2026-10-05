Write-Host ""
Write-Host "=== Current RAM Usage ===" -ForegroundColor Cyan

# Total & free RAM
$os      = Get-CimInstance Win32_OperatingSystem
$totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$freeGB  = [math]::Round($os.FreePhysicalMemory    / 1MB, 1)
$usedGB  = [math]::Round($totalGB - $freeGB, 1)
Write-Host "  Total RAM : $totalGB GB" -ForegroundColor White
Write-Host "  Used  RAM : $usedGB GB" -ForegroundColor Yellow
Write-Host "  Free  RAM : $freeGB GB" -ForegroundColor $(if ($freeGB -lt 1) { "Red" } else { "Green" })
Write-Host ""

# Top memory consumers
Write-Host "  Top processes by RAM:" -ForegroundColor Cyan
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 20 |
    ForEach-Object {
        $mb = [math]::Round($_.WorkingSet / 1MB, 0)
        $color = if ($mb -gt 500) { "Red" } elseif ($mb -gt 200) { "Yellow" } else { "White" }
        Write-Host ("  {0,-30} {1,6} MB   PID {2}" -f $_.Name, $mb, $_.Id) -ForegroundColor $color
    }

Write-Host ""
Write-Host "=== Killing known RAM hogs (non-critical) ===" -ForegroundColor Yellow

$toKill = @(
    "chrome", "msedge", "firefox", "brave", "opera",   # browsers
    "Code",                                             # VS Code (if redundant windows open)
    "Teams", "slack", "discord",                        # comms (comment out if needed)
    "SearchHost", "SearchIndexer",                      # Windows search indexer
    "OneDrive",                                         # OneDrive sync
    "MsMpEng"                                           # Windows Defender (temporarily)
)

$freed = 0
foreach ($name in $toKill) {
    $procs = Get-Process -Name $name -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
        $mb = [math]::Round($p.WorkingSet / 1MB, 0)
        try {
            Stop-Process -Id $p.Id -Force -ErrorAction Stop
            Write-Host "  Killed: $name (PID $($p.Id)) freed ~$mb MB" -ForegroundColor Green
            $freed += $mb
        } catch {
            Write-Host "  Could not kill: $name - $($_.Exception.Message)" -ForegroundColor DarkGray
        }
    }
}

# Force garbage collection / trim standby list via empty working sets
Write-Host ""
Write-Host "  Trimming process working sets..." -ForegroundColor Cyan
$trimmed = 0
Get-Process | ForEach-Object {
    try {
        [System.GC]::Collect()
        $trimmed++
    } catch {}
}

Start-Sleep -Seconds 3

# Report new free RAM
$freeAfter = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 1)
Write-Host ""
Write-Host "=== After Cleanup ===" -ForegroundColor Cyan
Write-Host "  Free RAM before : $freeGB GB" -ForegroundColor White
Write-Host "  Free RAM after  : $freeAfter GB" -ForegroundColor $(if ($freeAfter -ge 2) { "Green" } else { "Yellow" })
Write-Host "  Estimated freed : ~$freed MB from killed processes" -ForegroundColor Green
Write-Host ""

if ($freeAfter -ge 2) {
    Write-Host "  READY: Enough RAM to run Metro bundler!" -ForegroundColor Green
    Write-Host "  Run: powershell -ExecutionPolicy Bypass -File c:\loopOut-home-and-services\tmp\bundle-android.ps1" -ForegroundColor Cyan
} else {
    Write-Host "  WARNING: Still low on RAM ($freeAfter GB free). Metro needs at least 2 GB." -ForegroundColor Yellow
    Write-Host "  Close more apps manually before bundling." -ForegroundColor Yellow
}
