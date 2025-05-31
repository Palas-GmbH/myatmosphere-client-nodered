# Activate Node.js from fnm
fnm env --use-on-cd --shell power-shell | Out-String | Invoke-Expression

Push-Location ..\src\node-red-myatmosphere

# Clean up old tgz files BEFORE packing
Remove-Item palas-node-red-myatmosphere-*.tgz -ErrorAction SilentlyContinue

npm pack
$tgz = Get-ChildItem -Filter "palas-node-red-myatmosphere-*.tgz" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $tgz.FullName -Destination "palas-node-red-myatmosphere-latest.tgz" -Force
Pop-Location

# Remove any existing container
if (docker ps -a --format '{{.Names}}' | Select-String -Pattern '^node-red-client$') {
    docker rm -f node-red-client
}

docker-compose -f ..\docker-compose.yml -f ..\docker-compose.dev.yml up -d --build
