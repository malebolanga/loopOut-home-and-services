$root        = "c:\loopOut-home-and-services"
$clientSrc   = "$root\client\src"
$mobile      = "$root\mobile"
$assetsDir   = "$mobile\android\app\src\main\assets"
$bundleOut   = "$assetsDir\index.android.bundle"
$assetsOut   = "$mobile\android\app\src\main\res"

# --- Step 1: Sync JS source files ---
Write-Host ""
Write-Host "[ Step 1 ] Syncing JS source -> mobile/" -ForegroundColor Yellow

$pairs = @(
    @{ from = "$clientSrc\pages";      to = "$mobile\pages";      filter = "*.jsx" },
    @{ from = "$clientSrc\components"; to = "$mobile\components"; filter = "*.*"   },
    @{ from = "$clientSrc\hooks";      to = "$mobile\hooks";      filter = "*.*"   },
    @{ from = "$clientSrc\utils";      to = "$mobile\utils";      filter = "*.*"   },
    @{ from = "$clientSrc\redux";      to = "$mobile\redux";      filter = "*.*"   },
    @{ from = "$clientSrc\data";       to = "$mobile\data";       filter = "*.*"   }
)

$totalSynced = 0
foreach ($p in $pairs) {
    $label = $p.from -replace [regex]::Escape($root), "."
    Write-Host "  Syncing $label" -ForegroundColor Cyan
    $out    = robocopy $p.from $p.to $p.filter /IS /IT /E /NP /R:1 /W:1
    $copied = ($out | Select-String "(Newer|New File)").Count
    $totalSynced += $copied
    if ($copied -gt 0) {
        Write-Host "    OK: $copied file(s) updated" -ForegroundColor Green
    } else {
        Write-Host "    -- Already in sync" -ForegroundColor DarkGray
    }
}
Write-Host "  Sync done: $totalSynced file(s) copied" -ForegroundColor Green

# --- Step 2: Ensure assets directory exists ---
Write-Host ""
Write-Host "[ Step 2 ] Preparing Android assets dir" -ForegroundColor Yellow
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
    Write-Host "  Created: $assetsDir" -ForegroundColor Green
} else {
    Write-Host "  Exists: $assetsDir" -ForegroundColor DarkGray
}

# --- Step 3: Bundle JS via Expo Metro ---
Write-Host ""
Write-Host "[ Step 3 ] Bundling JS for Android (Expo Metro)" -ForegroundColor Yellow
Write-Host "  Entry: index.js" -ForegroundColor DarkGray
Write-Host "  Output: $bundleOut" -ForegroundColor DarkGray
Write-Host "  This may take 1-3 minutes..." -ForegroundColor DarkGray
Write-Host ""

Set-Location $mobile

npx expo export:embed --platform android --entry-file index.js --bundle-output $bundleOut --assets-dest $assetsOut --dev false --reset-cache 2>&1 | ForEach-Object { Write-Host "  $_" }

Write-Host ""
if (Test-Path $bundleOut) {
    $size = [math]::Round((Get-Item $bundleOut).Length / 1KB)
    Write-Host "  SUCCESS: index.android.bundle created ($size KB)" -ForegroundColor Green
    Write-Host "  Path: $bundleOut" -ForegroundColor Cyan
} else {
    Write-Host "  ERROR: Bundle not found. Check errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "--- All done ---" -ForegroundColor Green
