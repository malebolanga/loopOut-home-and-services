$root = "c:\loopOut-home-and-services"
$src  = "$root\client\src"
$mob  = "$root\mobile"

$pairs = @(
  @{ from = "$src\pages";      to = "$mob\pages";      filter = "*.jsx" },
  @{ from = "$src\components"; to = "$mob\components"; filter = "*.*"   },
  @{ from = "$src\hooks";      to = "$mob\hooks";      filter = "*.*"   },
  @{ from = "$src\utils";      to = "$mob\utils";      filter = "*.*"   },
  @{ from = "$src\redux";      to = "$mob\redux";      filter = "*.*"   },
  @{ from = "$src\data";       to = "$mob\data";       filter = "*.*"   }
)

$total = 0

foreach ($p in $pairs) {
    $label = $p.from -replace [regex]::Escape($root), "."
    Write-Host ""
    Write-Host "  Syncing  $label" -ForegroundColor Cyan
    Write-Host "       ->  $($p.to -replace [regex]::Escape($root),'.')" -ForegroundColor DarkCyan

    $out = robocopy $p.from $p.to $p.filter /IS /IT /E /NP /R:1 /W:1
    $copied = ($out | Select-String "(Newer|New File)").Count
    $total += $copied

    if ($copied -gt 0) {
        Write-Host "  v $copied file(s) updated" -ForegroundColor Green
    } else {
        Write-Host "  - Already in sync" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Sync complete. $total file(s) written to mobile/" -ForegroundColor Green
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
