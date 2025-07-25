# @palasde/node-red-myatmosphere

[![platform](https://img.shields.io/badge/platform-Node--RED-red?logo=nodered)](https://nodered.org)
[![Min Node Version](https://img.shields.io/node/v/@palasde/node-red-myatmosphere.svg)](https://nodejs.org/en/)
[![GitHub version](https://img.shields.io/github/package-json/v/Palas-GmbH/myatmosphere-client-nodered?filename=src/node-red-myatmosphere/package.json&logo=npm)](https://www.npmjs.com/package/@palasde/node-red-myatmosphere)
![GitHub last commit](https://img.shields.io/github/last-commit/Palas-GmbH/myatmosphere-client-nodered)
![NPM Total Downloads](https://img.shields.io/npm/dt/@palasde/node-red-myatmosphere.svg)
![NPM Downloads per month](https://img.shields.io/npm/dm/@palasde/node-red-myatmosphere)

## Overview

This project provides a Node-RED node `@palasde/node-red-myatmosphere` for subscribing to the latest measurements from devices connected to the [MyAtmosphere](https://my-atmosphere.net/) air quality monitoring system. It enables users to seamlessly integrate air quality and environmental data into their Node-RED workflows.

## Installation

To install the Node-RED node, run the following command in your Node-RED user directory (typically `~/.node-red`):

```sh
npm install @palasde/node-red-myatmosphere
```

## Usage

Once installed, you can find the MyAtmosphere nodes in the Node-RED palette. The following nodes are available:

- **myatmo measurement** (MyAtmosphere Measurements): This node processes and outputs the latest measurements from the devices.

- **Connection**: This configuration node handles the connection to the MyAtmosphere API, and available from the other MyAtmosphere nodes. Usually set per AQ Network.

## Configuration

To configure the nodes, you will need to provide the connection details for your MyAtmosphere device:

- **API Key**: Private or public API key set as part of connection config.
- **Serial Numbers**: Comma-separated device serial numbers.
- **Measurement Types**: Comma-separated measurement types (e.g., `pm2_5,pm10`). When not set, all types supported by the device are included. The exact names of the measurement types can be found in the [MyAtmosphere API docs](https://my-atmosphere.cloud/measurements/network/api) and related section of the [API explorer](https://api.my-atmosphere.cloud/streams).

## Output

**myatmo measurement** (MyAtmosphere Measurements) node emits the most recent measurement on initial connection and on every real-time update. Message content:

- **payload**: The exact data contract for the measurement can be found in the [MyAtmosphere API docs](https://my-atmosphere.cloud/measurements/network/api) and related section of the [API explorer](https://api.my-atmosphere.cloud/streams).
- **device**: Device serial number.
- **dataSet**: The constant name of the "Measurements" data set.

## Example Flow

Here is an example of how to use the MyAtmosphere nodes in a Node-RED flow:

1. Drag the **myatmo measurement** node onto your workspace and configure it with your connection and device details.
2. Use the output from the **myatmo measurement** node to trigger other nodes in your flow, such as saving the data or sending alerts.

![Connection config](https://github.com/Palas-GmbH/myatmosphere-client-nodered/blob/main/readme/config.png?raw=true)

![MyAtmosphere node config for a single device](https://github.com/Palas-GmbH/myatmosphere-client-nodered/blob/main/readme/13256-config.png?raw=true)

### Single Device with only PM2.5 and PM10

![Single device config](https://github.com/Palas-GmbH/myatmosphere-client-nodered/blob/main/readme/single-config.png?raw=true)

### Setting Alert

![Alert](https://github.com/Palas-GmbH/myatmosphere-client-nodered/blob/main/readme/alert.png?raw=true)

### Multiple Device with All Types

![Multi devices config](https://github.com/Palas-GmbH/myatmosphere-client-nodered/blob/main/readme/multi-config.png?raw=true)

![Multi devices flow](https://github.com/Palas-GmbH/myatmosphere-client-nodered/blob/main/readme/multi.png?raw=true)

## License

This project is licensed under the MIT License. See the LICENSE file in the GitHub repository for more details.

## Changelog

### [1.1.4] - 2025-07-02

- Added screenshots to the readme.

### [1.1.3] - 2025-06-21

- Use short name `myatmo measurement` for palette label.

### [1.1.2] - 2025-06-20

- MyATMO renamed to MyAtmosphere in the node names.
- Changed MyAtmosphere Measurements node category to environment.
- Replaced icon.

### [1.1.1] - 2025-06-20

- Changelog included into readme file.

### [1.1.0] - 2025-06-20

- Added example flows (`examples/`) for:
  - Single device measurements
  - Multiple devices measurements
  - Alerts based on measurements
  - Error handling
- Declared minimum supported Node.js version (`>=14.0.0`)
- Declared minimum required Node-RED version (`>=3.0.0`)

### [1.0.0] - 2025-06-01

- Initial release with:
  - MyAtmosphere Measurements node
  - Connection configuration node
  - Real-time SignalR-based data streaming
