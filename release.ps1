param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Version,

    [string]$BuildRoot = (Join-Path $PSScriptRoot "build"),
    [string]$OutputRoot = (Join-Path $PSScriptRoot "release"),
    [string]$KeyRoot = $PSScriptRoot,
    [switch]$SkipCrx,
    [string]$ChromeExe,
    [string]$EdgeExe
)

function Resolve-PackagingBrowser {
    param(
        [string]$PreferredPath,
        [string[]]$CandidatePaths
    )

    if ($PreferredPath -and (Test-Path -Path $PreferredPath -PathType Leaf)) {
        return $PreferredPath
    }

    foreach ($candidate in $CandidatePaths) {
        if (Test-Path -Path $candidate -PathType Leaf) {
            return $candidate
        }
    }

    return $null
}

function New-Crx {
    param(
        [string]$BrowserExe,
        [string]$TargetPath,
        [string]$PemPath,
        [string]$CrxOutputPath
    )

    if (-not $BrowserExe) {
        return $false
    }

    $targetFileName = Split-Path -Path $TargetPath -Leaf
    $sourceCrx = Join-Path (Split-Path -Path $TargetPath -Parent) ("{0}.crx" -f $targetFileName)

    if (Test-Path -Path $sourceCrx) {
        Remove-Item -Path $sourceCrx -Force
    }

    & $BrowserExe "--pack-extension=$TargetPath" "--pack-extension-key=$PemPath"

    $maxAttempts = 40
    $sleepMilliseconds = 250
    $found = $false
    for ($i = 0; $i -lt $maxAttempts; $i++) {
        if (Test-Path -Path $sourceCrx -PathType Leaf) {
            $found = $true
            break
        }

        Start-Sleep -Milliseconds $sleepMilliseconds
    }

    if (-not $found) {
        return $false
    }

    if (Test-Path -Path $CrxOutputPath -PathType Leaf) {
        Remove-Item -Path $CrxOutputPath -Force
    }

    Move-Item -Path $sourceCrx -Destination $CrxOutputPath
    return $true
}

function Update-ManifestVersion {
    param(
        [string]$ManifestPath,
        [string]$NewVersion
    )

    if (-not (Test-Path -Path $ManifestPath -PathType Leaf)) {
        Write-Warning "Manifest not found: $ManifestPath"
        return $false
    }

    try {
        $content = Get-Content -Path $ManifestPath -Raw -Encoding UTF8
        $manifest = $content | ConvertFrom-Json

        $manifest.version = $NewVersion

        $updatedContent = $manifest | ConvertTo-Json -Depth 10
        Set-Content -Path $ManifestPath -Value $updatedContent -Encoding UTF8 -NoNewline
        Write-Host "Updated version to $NewVersion in: $ManifestPath"
        return $true
    }
    catch {
        Write-Warning "Failed to update manifest: $ManifestPath - $_"
        return $false
    }
}

if (-not (Test-Path -Path $BuildRoot -PathType Container)) {
    throw "Build folder not found: $BuildRoot"
}

$targets = Get-ChildItem -Path $BuildRoot -Directory
if (-not $targets) {
    throw "No build targets found in: $BuildRoot"
}

# Update manifest versions in all build targets
Write-Host "Updating manifest versions to $Version..."
foreach ($target in $targets) {
    $manifestPath = Join-Path $target.FullName "manifest.json"
    Update-ManifestVersion -ManifestPath $manifestPath -NewVersion $Version
}
Write-Host ""

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
New-Item -ItemType Directory -Path $KeyRoot -Force | Out-Null

$legacyKeyNames = @("chrome.pem", "msedge.pem")
foreach ($legacyKey in $legacyKeyNames) {
    $legacyPath = Join-Path $OutputRoot $legacyKey
    $securePath = Join-Path $KeyRoot $legacyKey

    if ((Test-Path -Path $legacyPath -PathType Leaf) -and (-not (Test-Path -Path $securePath -PathType Leaf))) {
        Move-Item -Path $legacyPath -Destination $securePath
        Write-Host "Moved private key to secure key folder: $securePath"
    }
}

$resolvedChrome = Resolve-PackagingBrowser -PreferredPath $ChromeExe -CandidatePaths @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$resolvedEdge = Resolve-PackagingBrowser -PreferredPath $EdgeExe -CandidatePaths @(
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

$crxTargets = @{
    "chrome" = @{
        Browser = $resolvedChrome
        Key     = (Join-Path $KeyRoot "chrome.pem")
    }
    "msedge" = @{
        Browser = $resolvedEdge
        Key     = (Join-Path $KeyRoot "msedge.pem")
    }
}

foreach ($target in $targets) {
    $archiveName = "{0}-{1}.zip" -f $target.Name, $Version
    $archivePath = Join-Path $OutputRoot $archiveName

    if (Test-Path -Path $archivePath) {
        Remove-Item -Path $archivePath -Force
    }

    $sourcePath = Join-Path $target.FullName "*"
    Compress-Archive -Path $sourcePath -DestinationPath $archivePath -Force
    Write-Host "Created $archivePath"

    if ($SkipCrx) {
        continue
    }

    if (-not $crxTargets.ContainsKey($target.Name)) {
        continue
    }

    $crxConfig = $crxTargets[$target.Name]
    if (-not $crxConfig.Browser) {
        Write-Warning "Skipping $($target.Name) CRX: browser executable not found."
        continue
    }

    if (-not (Test-Path -Path $crxConfig.Key -PathType Leaf)) {
        Write-Warning "Skipping $($target.Name) CRX: key not found at $($crxConfig.Key)."
        continue
    }

    $crxName = "{0}-{1}.crx" -f $target.Name, $Version
    $crxPath = Join-Path $OutputRoot $crxName
    $created = New-Crx -BrowserExe $crxConfig.Browser -TargetPath $target.FullName -PemPath $crxConfig.Key -CrxOutputPath $crxPath
    if ($created) {
        Write-Host "Created $crxPath"
    } else {
        Write-Warning "Failed to create CRX for $($target.Name)."
    }
}

Write-Host "`nRelease packaging complete."
Write-Host "Private keys are expected in: $KeyRoot"
