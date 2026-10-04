$env:NODE_OPTIONS = "--max-old-space-size=4096"

$mobile     = "c:\loopOut-home-and-services\mobile"
$assetsDir  = "$mobile\android\app\src\main\assets"
$bundleOut  = "$assetsDir\index.android.bundle"
$assetsOut  = "$mobile\android\app\src\main\res"

Set-Location $mobile

Write-Host ""
Write-Host "[ Bundle ] Expo Metro -> Android (NODE_OPTIONS: $env:NODE_OPTIONS)" -ForegroundColor Yellow
Write-Host "  Output: $bundleOut" -ForegroundColor DarkGray
Write-Host ""

npx expo export:embed --platform android --entry-file index.js --bundle-output $bundleOut --assets-dest $assetsOut --dev false --reset-cache 2>&1

Write-Host ""
if (Test-Path $bundleOut) {
    $sizeMB = [math]::Round((Get-Item $bundleOut).Length / 1MB, 2)
    Write-Host "  SUCCESS: index.android.bundle ($sizeMB MB)" -ForegroundColor Green
    Write-Host "  Path: $bundleOut" -ForegroundColor Cyan
} else {
    Write-Host "  ERROR: Bundle not created. Check errors above." -ForegroundColor Red
}
