Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Antigravity IDE\anti\kount\public\kount-app-logo.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)

$mipmapDirs = @(
    @{ Dir = "mipmap-mdpi";    IconSize = 48;  ForeSize = 108 },
    @{ Dir = "mipmap-hdpi";    IconSize = 72;  ForeSize = 162 },
    @{ Dir = "mipmap-xhdpi";   IconSize = 96;  ForeSize = 216 },
    @{ Dir = "mipmap-xxhdpi";  IconSize = 144; ForeSize = 324 },
    @{ Dir = "mipmap-xxxhdpi"; IconSize = 192; ForeSize = 432 }
)

$baseRes = "C:\Antigravity IDE\anti\kount\android\app\src\main\res"

foreach ($item in $mipmapDirs) {
    $targetDir = Join-Path $baseRes $item.Dir
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir | Out-Null
    }

    # 1. Generate ic_launcher.png (Legacy launcher icon: 75% scale centered with soft rounded white background)
    $icSize = $item.IconSize
    $bmpLegacy = New-Object System.Drawing.Bitmap($icSize, $icSize)
    $gLegacy = [System.Drawing.Graphics]::FromImage($bmpLegacy)
    $gLegacy.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gLegacy.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gLegacy.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gLegacy.Clear([System.Drawing.Color]::White)

    # Scale logo to ~80% of legacy canvas so it doesn't touch borders
    $logoLegacyWidth = [int]($icSize * 0.82)
    $logoLegacyHeight = [int]($icSize * 0.82)
    $logoLegacyX = [int](($icSize - $logoLegacyWidth) / 2)
    $logoLegacyY = [int](($icSize - $logoLegacyHeight) / 2)

    $gLegacy.DrawImage($srcImage, $logoLegacyX, $logoLegacyY, $logoLegacyWidth, $logoLegacyHeight)
    $legacyPath = Join-Path $targetDir "ic_launcher.png"
    $roundPath = Join-Path $targetDir "ic_launcher_round.png"
    $bmpLegacy.Save($legacyPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpLegacy.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gLegacy.Dispose()
    $bmpLegacy.Dispose()

    # 2. Generate ic_launcher_foreground.png (Adaptive icon foreground: 58% scale centered so Android safe circle doesn't crop it)
    $foreSize = $item.ForeSize
    $bmpFore = New-Object System.Drawing.Bitmap($foreSize, $foreSize)
    $gFore = [System.Drawing.Graphics]::FromImage($bmpFore)
    $gFore.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gFore.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gFore.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gFore.Clear([System.Drawing.Color]::Transparent)

    $logoForeWidth = [int]($foreSize * 0.58)
    $logoForeHeight = [int]($foreSize * 0.58)
    $logoForeX = [int](($foreSize - $logoForeWidth) / 2)
    $logoForeY = [int](($foreSize - $logoForeHeight) / 2)

    $gFore.DrawImage($srcImage, $logoForeX, $logoForeY, $logoForeWidth, $logoForeHeight)
    $forePath = Join-Path $targetDir "ic_launcher_foreground.png"
    $bmpFore.Save($forePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gFore.Dispose()
    $bmpFore.Dispose()

    Write-Host "Generated icons for $($item.Dir)"
}

$srcImage.Dispose()
Write-Host "All Android launcher icons regenerated successfully!"
