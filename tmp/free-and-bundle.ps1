$currentPid = $PID

function Kill-Proc($name) {
    $procs = Get-Process -Name $name -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
        if ($p.Id -eq $currentPid) { continue }
        $mb = [math]::Round($p.WorkingSet / 1MB, 0)
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Killed $name PID $($p.Id) ($mb MB)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Freeing RAM for Metro bundler..." -ForegroundColor Yellow

Kill-Proc "node"
Kill-Proc "Spotify"
Kill-Proc "java"
Kill-Proc "language_server_windows_x64"
Kill-Proc "studio64"

Start-Sleep -Seconds 4

$freeNow = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
Write-Host ""
Write-Host "Free RAM now: $freeNow GB" -ForegroundColor $(if ($freeNow -ge 2) { "Green" } else { "Yellow" })

if ($freeNow -ge 2) {
    Write-Host "READY - Running Metro bundler now..." -ForegroundColor Green
    Write-Host ""

    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    Set-Location "c:\loopOut-home-and-services\mobile"

    $bundleOut = "c:\loopOut-home-and-services\mobile\android\app\src\main\assets\index.android.bundle"
    $assetsOut = "c:\loopOut-home-and-services\mobile\android\app\src\main\res"

    npx expo export:embed --platform android --entry-file index.js --bundle-output $bundleOut --assets-dest $assetsOut --dev false --reset-cache 2>&1

    if (Test-Path $bundleOut) {
        $sizeMB = [math]::Round((Get-Item $bundleOut).Length / 1MB, 2)
        Write-Host ""
        Write-Host "SUCCESS: index.android.bundle created ($sizeMB MB)" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "ERROR: Bundle not created. Check errors above." -ForegroundColor Red
    }
} else {
    Write-Host "Still not enough RAM ($freeNow GB). Please close Android Studio or other apps manually." -ForegroundColor Red
}
