# Activate Node.js from fnm
fnm env --use-on-cd --shell power-shell | Out-String | Invoke-Expression

$srcPath = Resolve-Path "..\src\node-red-myatmosphere"
$distPath = Join-Path $PSScriptRoot "..\dist"

# Ensure dist directory exists
if (-not (Test-Path $distPath)) {
    Write-Host "Creating dist directory at $distPath"
    New-Item -ItemType Directory -Path $distPath | Out-Null
}

$distPath = Resolve-Path $distPath

Push-Location $srcPath

# Clean up old tgz files BEFORE packing
Write-Host "Removing old package files..."
Remove-Item "$distPath\palasde-node-red-myatmosphere-*.tgz" -ErrorAction SilentlyContinue

Write-Host "Packing npm package..."
if (-not (npm pack --pack-destination $distPath)) {
    Write-Error "npm pack failed"
    Pop-Location
    exit 1
}

$tgz = Get-ChildItem -Path $distPath -Filter "palasde-node-red-myatmosphere-*.tgz" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($tgz) {
    Copy-Item $tgz.FullName -Destination "$distPath\palasde-node-red-myatmosphere-latest.tgz" -Force
    Write-Host "Package copied to $distPath\palasde-node-red-myatmosphere-latest.tgz"
}
else {
    Write-Error "No package file found after packing."
}

Pop-Location