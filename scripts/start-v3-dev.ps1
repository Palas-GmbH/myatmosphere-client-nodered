# Remove any existing container
if (docker ps -a --format '{{.Names}}' | Select-String -Pattern '^node-red-v3-client-dev$') {
    docker rm -f node-red-v3-client-dev
}

docker-compose -f ..\docker-compose.v3.dev.yml up -d --build
