# Remove any existing container
if (docker ps -a --format '{{.Names}}' | Select-String -Pattern '^node-red-client$') {
    docker rm -f node-red-client
}

docker-compose -f ..\docker-compose.dev.yml up -d --build
