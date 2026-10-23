# @palasde/node-red-myatmosphere

A Node-RED node for subscribing to real-time device measurements from MyAtmosphere.

## Development

All development and demo configurations use the same locked source image: Node-RED
5.0.9, Node.js 24.22.0 LTS and npm 12.2.1. Demo now exercises this checkout's client
instead of installing a separately published `@latest` package. Node-RED 5 is the
sole qualification target. The obsolete Node-RED 3 startup configuration is retired;
existing saved flow directories remain untouched.
Back up existing Node-RED data before first starting the newer runtime. Local
qualification uses an empty disposable user directory, never existing flows or credentials.

Use `.nvmrc` and the declared package manager for host commands. The runtime lock
also updates Node-RED's private npm CLI. npm 12.2.1 still bundles the moderate
`GHSA-rxp7-6hxx-x8q5` advisory; do not describe the complete runtime audit as clean.

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

## Publishing

Publishing is intentionally tag-driven. Push an exact `vX.Y.Z` tag only after
the package version has been updated to the matching `X.Y.Z` value in
`src/node-red-myatmosphere/package.json`. The release workflow runs the locked
dependency install, focused tests, and package validation before publishing
with npm provenance.

The workflow is safe to rerun: when npm already contains that version, it
continues only if the registry checksum exactly matches the package built from
the tag. It then creates or verifies the GitHub Release for the same commit.
It never permits manual publishing or a GitHub Release to publish a different
source revision.

Configure npm trusted publishing for this repository and the `publish.yml`
workflow before the first tag-based release. No `NPM_TOKEN` GitHub secret is
used or required by this workflow.

### Updating node in Node-RED library

> To update an existing node, you can either resubmit it the same way as you would for a new node, or request a refresh from the node’s page on the flow library through the ‘request refresh’ link. This is only visible to logged in users.
