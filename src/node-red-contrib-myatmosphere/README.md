# @palas/node-red-contrib-myatmosphere

A Node-RED node for subscribing to real-time device measurements from MyAtmosphere.

## Configuration

- **API Endpoint:** MyAtmosphere API root URL (e.g., `https://api.my-atmosphere.cloud`)
- **API Key:** Your API key for authentication
- **Serial Numbers:** Comma-separated device serial numbers
- **Measurement Types:** Comma-separated measurement types (e.g., `pm2_5,pm10`)

Outputs a message with `{ payload, device }` on every real-time update.
