$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$publish = Get-Content -Raw (Join-Path $repoRoot '.github/workflows/publish.yml')
$ci = Get-Content -Raw (Join-Path $repoRoot '.github/workflows/ci.yml')

function Assert-Contains([string] $Content, [string] $Expected) {
    if (-not $Content.Contains($Expected)) {
        throw "Expected workflow content was not found: $Expected"
    }
}

function Assert-NotContains([string] $Content, [string] $Unexpected) {
    if ($Content.Contains($Unexpected)) {
        throw "Unsafe workflow content was found: $Unexpected"
    }
}

Assert-Contains $ci 'pull_request:'
Assert-Contains $ci 'branches: [main]'
Assert-Contains $ci 'npm ci'
Assert-Contains $ci 'npm test'
Assert-Contains $ci 'npm pack --dry-run'
Assert-Contains $publish 'push:'
Assert-Contains $publish 'v*.*.*'
Assert-Contains $publish 'reusable-semantic-tag-source-guard.yml@main'
Assert-Contains $publish 'permissions: {}'
Assert-Contains $publish 'persist-credentials: false'
Assert-Contains $publish 'npm publish "$PACKAGE_FILE" --provenance --access public'
Assert-Contains $publish 'npm already has ${package_name}@${package_version} with different bytes.'
Assert-Contains $publish 'gh release create'
Assert-Contains $publish 'git rev-parse "${GITHUB_REF_NAME}^{commit}"'
Assert-NotContains $publish 'targetCommitish'
Assert-NotContains $publish 'workflow_dispatch:'
Assert-NotContains $publish 'release:'
Assert-NotContains $publish 'NODE_AUTH_TOKEN'

Write-Host 'Node-RED workflow contract checks passed.'
