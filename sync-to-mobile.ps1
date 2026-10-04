# ─────────────────────────────────────────────────────────────────────────────
# sync-to-mobile.ps1
# Syncs all client source files into mobile/ (Android project)
# Usage:  .\sync-to-mobile.ps1
# ─────────────────────────────────────────────────────────────────────────────

$root    = $PSScriptRoot
$src     = "$root\client\src"
$mobile  = "$root\mobile"

$folders = @(
    @{ from = "$src\pages";      to = "$mobile\pages";      filter = "*.jsx" },
    @{ from = "$src\components"; to = "$mobile\components";  filter = "*.*"   },
    @{ from = "$src\hooks";      to = "$mobile\hooks";       filter = "*.*"   },
    @{ from = "$src\utils";      to = "$mobile\utils";       filter = "*.*"   },
    @{ from = "$src\redux";      to = "$mobile\redux";       filter = "*.*"   },
    @{ from = "$src\data";       to = "$mobile\data";        filter = "*.*"   }
)

$totalCopied = 0

foreach ($f in $folders) {
    Write-Host ""
    Write-Host "  Syncing  $($f.from -replace [regex]::Escape($root),'.')" -ForegroundColor Cyan
    Write-Host "       ->  $($f.to   -replace [regex]::Escape($root),'.')" -ForegroundColor DarkCyan

    $result = robocopy $f.from $f.to $f.filter /IS /E /NP /R:1 /W:1

    # Count "Newer" or "New File" lines (actually copied)
    $copied = ($result | Select-String "(Newer|New File)").Count
    $totalCopied += $copied

    if ($copied -gt 0) {
        Write-Host "  v $copied file(s) updated" -ForegroundColor Green
    } else {
        Write-Host "  v Already up to date" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Sync complete.  $totalCopied file(s) copied to mobile/" -ForegroundColor Green
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
