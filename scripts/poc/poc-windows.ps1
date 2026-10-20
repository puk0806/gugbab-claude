# gugbab harness - Windows PoC launcher (ASCII only: Windows PowerShell 5.1 reads BOM-less UTF-8 as ANSI)
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\poc-windows.ps1                      # default checks + claude runs
#   powershell -ExecutionPolicy Bypass -File .\poc-windows.ps1 -Repo C:\src\00_gugbab-claude
#   powershell -ExecutionPolicy Bypass -File .\poc-windows.ps1 -NoClaude
#   powershell -ExecutionPolicy Bypass -File .\poc-windows.ps1 -LinkCreds          # also try hardlink/symlink of .credentials.json
# Result: .\poc-windows-result.json  (send this file back)
param(
  [string]$Repo = "",
  [switch]$NoClaude,
  [switch]$LinkCreds,
  [switch]$Keep,
  [string]$Model = "haiku"
)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Host "node not found. Install Node.js 22 LTS or newer (https://nodejs.org) and retry."; exit 1 }
$ver = (& node -p "process.versions.node").Trim()
Write-Host "node $ver at $($node.Source)"
Write-Host "PowerShell $($PSVersionTable.PSVersion) ($($PSVersionTable.PSEdition))"

$js = Join-Path $PSScriptRoot "poc-windows.js"
if (-not (Test-Path $js)) { Write-Host "poc-windows.js must be next to this file: $js"; exit 1 }

$argv = @($js, "--model", $Model, "--out", (Join-Path (Get-Location) "poc-windows-result.json"))
if ($Repo) { $argv += @("--repo", $Repo) }
if ($NoClaude) { $argv += "--no-claude" }
if ($LinkCreds) { $argv += "--link-creds" }
if ($Keep) { $argv += "--keep" }

# extra facts only PowerShell can see cheaply
$extra = [ordered]@{
  psVersion = "$($PSVersionTable.PSVersion)"; psEdition = "$($PSVersionTable.PSEdition)"
  executionPolicy = "$(Get-ExecutionPolicy)"; consoleCodePage = (cmd /c chcp) -replace '\D', ''
  isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  terminal = if ($env:WT_SESSION) { "WindowsTerminal" } elseif ($env:TERM_PROGRAM) { $env:TERM_PROGRAM } else { "conhost-or-other" }
}
$env:GUGBAB_POC_PS = ($extra | ConvertTo-Json -Compress)

& node @argv
exit $LASTEXITCODE
