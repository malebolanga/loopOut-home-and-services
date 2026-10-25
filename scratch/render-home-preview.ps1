Add-Type -AssemblyName System.Drawing

$outputPath = Join-Path $PSScriptRoot 'home-category-preview.png'
$bitmap = [System.Drawing.Bitmap]::new(430, 760)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(7, 11, 22))

function New-Brush([int]$r,[int]$g,[int]$b) { return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($r,$g,$b)) }
function Fill-RoundRect($g,[float]$x,[float]$y,[float]$w,[float]$h,[float]$radius,$brush) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $path.AddArc($x,$y,$d,$d,180,90); $path.AddArc($x+$w-$d,$y,$d,$d,270,90)
  $path.AddArc($x+$w-$d,$y+$h-$d,$d,$d,0,90); $path.AddArc($x,$y+$h-$d,$d,$d,90,90)
  $path.CloseFigure(); $g.FillPath($brush,$path); $path.Dispose()
}
function Draw-Text($g,[string]$text,[float]$x,[float]$y,[float]$size,$brush,[string]$face='Segoe UI',[System.Drawing.FontStyle]$style=[System.Drawing.FontStyle]::Regular) {
  $font = [System.Drawing.Font]::new($face,$size,$style,[System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString($text,$font,$brush,$x,$y); $font.Dispose()
}
function Draw-Emoji($g,[string]$text,[float]$x,[float]$y,[float]$size) {
  $font = [System.Drawing.Font]::new('Segoe UI Emoji',$size,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new(); $format.Alignment=[System.Drawing.StringAlignment]::Center; $format.LineAlignment=[System.Drawing.StringAlignment]::Center
  $g.DrawString($text,$font,(New-Brush 255 255 255),[System.Drawing.RectangleF]::new($x,$y,$size+5,$size+5),$format)
  $font.Dispose(); $format.Dispose()
}

$white = New-Brush 248 250 252; $muted = New-Brush 157 169 187; $soft = New-Brush 39 49 67
$pink = New-Brush 239 49 87; $roseBg = New-Brush 54 25 42; $iconBg = New-Brush 20 29 44
$amber = New-Brush 245 159 0

# Search bar
Fill-RoundRect $graphics 24 24 382 58 29 (New-Brush 20 29 44)
Fill-RoundRect $graphics 37 36 36 36 18 $pink
Draw-Text $graphics 'O' 48 42 19 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
Draw-Text $graphics 'Where to?' 84 43 17 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)

# Horizontally scrollable category belt preview
$icons = @(
  @{ Emoji=[char]::ConvertFromUtf32(0x1F195); Label='New'; Selected=$true },
  @{ Emoji=[char]::ConvertFromUtf32(0x1F3E0); Label='Homes'; Selected=$false },
  @{ Emoji=[char]::ConvertFromUtf32(0x1F6E0); Label='Services'; Selected=$false },
  @{ Emoji=[char]::ConvertFromUtf32(0x1F9F9); Label='Helpers'; Selected=$false },
  @{ Emoji=[char]::ConvertFromUtf32(0x1F372); Label='Food'; Selected=$false },
  @{ Emoji=[char]::ConvertFromUtf32(0x1F6CD); Label='Sell'; Selected=$false },
  @{ Emoji=[char]::ConvertFromUtf32(0x1F5C2); Label='More'; Selected=$false }
)
$x = 11
foreach ($entry in $icons) {
  Fill-RoundRect $graphics $x 106 56 82 18 $(if($entry.Selected){New-Brush 49 24 42}else{New-Brush 13 19 31})
  Draw-Emoji $graphics $entry.Emoji ($x+10) 110 31
  $labelBrush = if($entry.Selected){New-Brush 255 190 205}else{New-Brush 206 214 226}
  $font = [System.Drawing.Font]::new('Segoe UI',9,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
  $fmt = [System.Drawing.StringFormat]::new(); $fmt.Alignment=[System.Drawing.StringAlignment]::Center
  $graphics.DrawString($entry.Label,$font,$labelBrush,[System.Drawing.RectangleF]::new($x-2,157,60,18),$fmt)
  $font.Dispose(); $fmt.Dispose(); $x += 58
}

# Food section heading and actions
Draw-Text $graphics 'Food near you' 22 222 22 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
Draw-Text $graphics 'Local favourites, ready to order' 22 249 13 $muted
Fill-RoundRect $graphics 262 218 91 38 19 $amber
Draw-Text $graphics 'My Orders' 280 230 12 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
Fill-RoundRect $graphics 360 218 54 38 19 $soft
Draw-Text $graphics 'All >' 372 230 12 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)

# Shorter borderless food cards with price over the photo
$cards = @(
  @{Name='Beef and pap'; Shop='Kota Joint'; Price='R85'; Emoji=[char]::ConvertFromUtf32(0x1F35B); Color=(New-Brush 161 81 43); Tag='HOT'},
  @{Name='Fresh bowl'; Shop='Green Table'; Price='R80'; Emoji=[char]::ConvertFromUtf32(0x1F957); Color=(New-Brush 54 104 72); Tag='TOP'},
  @{Name='Crispy chips'; Shop='Lungile and Son'; Price='R45'; Emoji=[char]::ConvertFromUtf32(0x1F35F); Color=(New-Brush 178 112 45); Tag='TOP'}
)
$x=17
foreach($card in $cards){
  Fill-RoundRect $graphics $x 278 124 183 19 (New-Brush 20 29 43)
  Fill-RoundRect $graphics ($x+7) 285 110 96 14 $card.Color
  Draw-Emoji $graphics $card.Emoji ($x+35) 297 48
  Fill-RoundRect $graphics ($x+12) 290 38 20 7 $pink
  Draw-Text $graphics $card.Tag ($x+18) 294 9 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
  Fill-RoundRect $graphics ($x+12) 350 49 24 12 (New-Brush 255 255 255)
  Draw-Text $graphics $card.Price ($x+20) 355 12 (New-Brush 17 24 39) 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
  Draw-Text $graphics $card.Name ($x+9) 389 12 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
  Draw-Text $graphics $card.Shop ($x+9) 408 10 $muted
  Draw-Text $graphics 'Tap to view  |  + to add' ($x+9) 439 9 (New-Brush 107 120 141)
  $x += 134
}
Draw-Text $graphics 'THE REST OF THE HOME FEED CONTINUES BELOW' 22 500 10 (New-Brush 107 120 141) 'Segoe UI' ([System.Drawing.FontStyle]::Bold)

# Bottom app navigation hint
Fill-RoundRect $graphics 17 702 396 46 23 (New-Brush 10 16 28)
Draw-Text $graphics 'H        S        +        I        P' 70 711 22 $white 'Segoe UI' ([System.Drawing.FontStyle]::Bold)
Draw-Text $graphics 'HOME        SAVED        CREATE        INBOX        PROFILE' 41 735 8 (New-Brush 174 183 198) 'Segoe UI' ([System.Drawing.FontStyle]::Bold)

$bitmap.Save($outputPath,[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $bitmap.Dispose()
Write-Output $outputPath
