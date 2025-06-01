# @palas/node-red-myatmosphere

A Node-RED node for subscribing to real-time device measurements from MyAtmosphere.

## Development

Folder `scripts` contains several PowerShell scripts for running Node-RED in a docker container on the locally.

Start Node-RED in development mode with installing MyAtmosphere node from `\src\node-red-myatmosphere` folder:

```sh
.\start-dev.ps1
```

This script uses `nodered-data` folder as a data volume to preserve flows.

Stop Node-RED in development mode (removes running container)

```sh
.\stop-dev.ps1
```

Create tarball (.tgz files) of npm package without publishing it to the npm registry. Stores output into `\dist` folder:

```sh
.\pack.ps1
```
