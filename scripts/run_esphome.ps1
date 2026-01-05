param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Config,

    [Parameter(Position = 1)]
    [string]$Device,

    [switch]$LogsOnly,

    [string[]]$ExtraArgs
)

$workspaceRoot = Split-Path $PSScriptRoot -Parent

function Resolve-ConfigPath {
    param([string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return (Resolve-Path -LiteralPath $Path -ErrorAction Stop).Path
    }

    $combined = Join-Path $workspaceRoot $Path
    if (-not (Test-Path -LiteralPath $combined)) {
        throw "Configuration file '$Path' does not exist relative to workspace root '$workspaceRoot'."
    }
    return (Resolve-Path -LiteralPath $combined -ErrorAction Stop).Path
}

$configPath = Resolve-ConfigPath -Path $Config

$esphomeArgs = @()
if ($LogsOnly) {
    $esphomeArgs += "logs"
} else {
    $esphomeArgs += "run"
}
$esphomeArgs += $configPath

if ($Device) {
    $esphomeArgs += "--device"
    $esphomeArgs += $Device
}

if ($ExtraArgs) {
    $esphomeArgs += $ExtraArgs
}

Write-Host "[run_esphome] Working directory: $workspaceRoot"
Write-Host "[run_esphome] Command: esphome $($esphomeArgs -join ' ')"

Push-Location $workspaceRoot
try {
    & esphome @esphomeArgs
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
