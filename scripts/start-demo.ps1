# Remove any existing container
if (docker ps -a --format '{{.Names}}' | Select-String -Pattern '^node-red-client-demo$') {
    docker rm -f node-red-client-demo
}

docker-compose -f ..\docker-compose.demo.yml up -d --build
