# build.ps1 - Copy shared content files and icons into each browser extension subfolder.

$sourceContent = Join-Path $PSScriptRoot "content/scripts"
$sourceIcons   = Join-Path $PSScriptRoot "content/icons"
$buildRoot     = Join-Path $PSScriptRoot "build"
$targets       = @("chrome", "msedge", "mzfirefox")
$contentFiles  = @("inject.js", "inject.css")

foreach ($target in $targets) {
    # content files
    $destContent = Join-Path (Join-Path $buildRoot $target) "content"
    New-Item -ItemType Directory -Force -Path $destContent | Out-Null

    foreach ($file in $contentFiles) {
        $src = Join-Path $sourceContent $file
        $dst = Join-Path $destContent   $file
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  copied  content/$file -> $target/content/$file"
    }

    # icons
    $destIcons = Join-Path (Join-Path $buildRoot $target) "icons"
    New-Item -ItemType Directory -Force -Path $destIcons | Out-Null

    if (Test-Path $sourceIcons) {
        foreach ($icon in (Get-ChildItem -File $sourceIcons)) {
            $dst = Join-Path $destIcons $icon.Name
            Copy-Item -Path $icon.FullName -Destination $dst -Force
            Write-Host "  copied  icons/$($icon.Name) -> $target/icons/$($icon.Name)"
        }
    } else {
        Write-Host "  (skipped icons - icons/ folder not found)"
    }
}

Write-Host "`nBuild complete."
