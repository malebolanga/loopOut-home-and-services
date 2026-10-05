$root      = "c:\loopOut-home-and-services"
$clientSrc = "$root\client\src"
$mobile    = "$root\mobile"

$pairs = @(
    @{ from = "$clientSrc\pages";      to = "$mobile\pages";      filter = "*.jsx"; label = "pages"      },
    @{ from = "$clientSrc\components"; to = "$mobile\components"; filter = "*.*";   label = "components" },
    @{ from = "$clientSrc\hooks";      to = "$mobile\hooks";      filter = "*.*";   label = "hooks"      },
    @{ from = "$clientSrc\utils";      to = "$mobile\utils";      filter = "*.*";   label = "utils"      },
    @{ from = "$clientSrc\redux";      to = "$mobile\redux";      filter = "*.*";   label = "redux"      },
    @{ from = "$clientSrc\data";       to = "$mobile\data";       filter = "*.*";   label = "data"       },
    @{ from = "$clientSrc\services";   to = "$mobile\services";   filter = "*.*";   label = "services"   },
    @{ from = "$clientSrc\styles";     to = "$mobile\styles";     filter = "*.*";   label = "styles"     }
)

$allInSync = $true

Write-Host ""
Write-Host "Checking sync status: client/src -> mobile/" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor DarkGray

foreach ($p in $pairs) {
    $label  = $p.label
    $from   = $p.from
    $to     = $p.to
    $filter = $p.filter

    if (-not (Test-Path $from)) {
        Write-Host "  [SKIP]  [$label] source folder not found" -ForegroundColor DarkGray
        continue
    }
    if (-not (Test-Path $to)) {
        Write-Host "  [MISS]  [$label] destination folder missing!" -ForegroundColor Red
        $allInSync = $false
        continue
    }

    $srcFiles = Get-ChildItem $from -Recurse -Filter $filter -File | Sort-Object FullName
    $missing  = @()
    $differs  = @()

    foreach ($sf in $srcFiles) {
        $rel   = $sf.FullName.Substring($from.Length)
        $dPath = Join-Path $to $rel

        if (-not (Test-Path $dPath)) {
            $missing += $rel
            $allInSync = $false
        } elseif ($sf.Length -ne (Get-Item $dPath).Length) {
            $differs += $rel
            $allInSync = $false
        }
    }

    $count = $srcFiles.Count
    if ($missing.Count -eq 0 -and $differs.Count -eq 0) {
        Write-Host "  [OK]    [$label] $count files - in sync" -ForegroundColor Green
    } else {
        Write-Host "  [DIFF]  [$label] issues found:" -ForegroundColor Red
        foreach ($f in $missing) { Write-Host "            MISSING: $f" -ForegroundColor Yellow }
        foreach ($f in $differs) { Write-Host "            DIFFERS: $f" -ForegroundColor Cyan   }
    }
}

Write-Host "--------------------------------------------" -ForegroundColor DarkGray
if ($allInSync) {
    Write-Host "  RESULT: All files are synced to mobile/" -ForegroundColor Green
} else {
    Write-Host "  RESULT: Some files are out of sync!" -ForegroundColor Red
}
Write-Host ""
