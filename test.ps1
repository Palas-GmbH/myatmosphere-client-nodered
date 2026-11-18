#Requires -Version 7.4
[CmdletBinding()]
param([Parameter(Position=0)][ValidateSet('ci','all')][string]$Command = 'ci')
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$started = [DateTimeOffset]::UtcNow
$id = '{0:yyyyMMddTHHmmssfffZ}-{1}-{2}' -f $started, $Command, [guid]::NewGuid().ToString('N')
$directory = [IO.Directory]::CreateDirectory((Join-Path $PSScriptRoot '.artifacts/tests' $id)).FullName
$log = Join-Path $directory 'console.log'
$receipt = [ordered]@{
    selection = $Command; startedUtc = $started.ToString('o'); finishedUtc = $null
    status = 'running'; exitCode = $null; commit = $null; dirty = $null
    platform = [Environment]::OSVersion.ToString(); steps = @()
}
function Save-Receipt {
    $temp = Join-Path $directory 'result.json.tmp'
    $receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $temp -Encoding utf8
    [IO.File]::Move($temp, (Join-Path $directory 'result.json'), $true)
}
function Write-RunLog([string] $Line) {
    Add-Content -LiteralPath $log -Value $Line -Encoding utf8
    Write-Host $Line
}
function Invoke-Step([string] $Program, [string[]] $Arguments) {
    $step = [ordered]@{ program = $Program; arguments = $Arguments; exitCode = $null }
    $receipt.steps += $step
    Save-Receipt
    Write-RunLog "$Program $($Arguments -join ' ')"
    & $Program @Arguments 2>&1 | ForEach-Object { Write-RunLog $_.ToString() }
    $step.exitCode = $LASTEXITCODE
    if ($step.exitCode -ne 0) {
        $receipt.exitCode = $step.exitCode
        throw "$Program exited with code $($step.exitCode)."
    }
}
Write-RunLog "$($receipt.startedUtc) $Command. Log: $log"
Save-Receipt
Push-Location $PSScriptRoot
try {
    $receipt.commit = & git rev-parse HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Cannot identify the tested commit.' }
    $receipt.dirty = [bool](& git status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'Cannot identify working-tree state.' }
    Set-Location (Join-Path $PSScriptRoot 'src/node-red-myatmosphere')
    Invoke-Step node @('--version')
    if ($Command -eq 'ci') {
        Invoke-Step node @('--test', 'test/nodes.test.js')
    } else {
        Invoke-Step npm @('test')
        Invoke-Step npm @('pack', '--dry-run')
    }
    Invoke-Step pwsh @('-NoProfile', '-File', (Join-Path $PSScriptRoot 'tests/workflow-contract.ps1'))
    $receipt.status = 'passed'
    $receipt.exitCode = 0
} catch {
    $receipt.status = 'failed'
    if ($null -eq $receipt.exitCode) { $receipt.exitCode = 1 }
    Write-RunLog $_.Exception.Message
} finally {
    Pop-Location
    if ($receipt.status -eq 'running') {
        $receipt.status = 'interrupted'
        $receipt.exitCode = 1
    }
    $receipt.finishedUtc = [DateTimeOffset]::UtcNow.ToString('o')
    Write-RunLog "$($receipt.finishedUtc) $($receipt.status), exit $($receipt.exitCode). Log: $log"
    Save-Receipt
}
exit $receipt.exitCode
