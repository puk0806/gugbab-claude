# gugbab-claude installer for Windows (PowerShell 5.1 / 7) - counterpart of install.sh
#   irm https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.ps1 | iex
#   with options:  & ([scriptblock]::Create((irm https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.ps1))) -Ref my-branch
#   local file:    powershell -ExecutionPolicy Bypass -File .\install.ps1 [-Ref <branch|tag>] [-Version vX.Y.Z] [-Channel stable|main]
#                                                                       [-Dir PATH] [-Yes] [-NoModifyPath] [-Uninstall]
# Puts <Dir>\bin on the user PATH (gugbab-claude.cmd lives there). No admin rights, no symlinks.
# ASCII only on purpose: Windows PowerShell 5.1 reads a BOM-less UTF-8 file as ANSI (Korean text would break).
# Everything is inside Main so a half-downloaded script does nothing.
param(
  [string]$Ref = "",
  [string]$Version = "",
  [string]$Channel = "",
  [string]$Dir = "",
  [switch]$Yes,
  [switch]$NoModifyPath,
  [switch]$Uninstall
)

function Main {
  $ErrorActionPreference = "Stop"
  $repoUrl = if ($env:GUGBAB_REPO_URL) { $env:GUGBAB_REPO_URL } else { "https://github.com/puk0806/gugbab-claude.git" }
  $homeDir = [Environment]::GetFolderPath("UserProfile")
  $target = if ($Dir) { $Dir } else { Join-Path $homeDir "gugbab" }

  function Say($m) { Write-Host "[gugbab] $m" }
  function Die($m) { Write-Host "[gugbab] x $m" -ForegroundColor Red; exit 1 }
  function Ask($q, $def) {
    if ($Yes) { return $true }
    try { $a = Read-Host "[gugbab] $q [$(if ($def) { 'Y/n' } else { 'y/N' })]" } catch { return $def }
    if ($a -match '^[Yy]') { return $true }
    if ($a -match '^[Nn]') { return $false }
    return $def
  }
  function ValidRef($r) { return ($r -match '^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$') -and ($r -notmatch '\.\.') }
  # git arguments go in ONE explicit array (Invoke-GitChecked @('-C', $dir, 'fetch')):
  #   - a function named "Git" would call itself ("& git" is case-insensitive -> call depth overflow)
  #   - "-C" passed loosely to a PowerShell function is taken as a parameter token and lost when re-splatted with @args
  #   - ErrorActionPreference Continue inside: on PS 5.1 a native command writing to stderr under "Stop" + 2> redirection throws
  function Invoke-GitChecked([string[]]$GitArgs) { $ErrorActionPreference = "Continue"; & git @GitArgs; if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') failed ($LASTEXITCODE)" } }
  function Get-GitOutput([string[]]$GitArgs) { $ErrorActionPreference = "Continue"; $o = & git @GitArgs 2>$null; if ($LASTEXITCODE -ne 0) { return $null }; return ($o -join "`n").Trim() }
  # gugbab install = git repo + Windows wrapper + cli
  function IsOurs($d) { return (Test-Path (Join-Path $d ".git")) -and (Test-Path (Join-Path $d "bin\gugbab-claude.cmd")) -and (Test-Path (Join-Path $d "cli\main.js")) }
  function WriteUtf8NoBom($file, $text) { [IO.File]::WriteAllText($file, $text, (New-Object Text.UTF8Encoding($false))) }

  # --- user PATH (HKCU\Environment). Keep the raw value (REG_EXPAND_SZ, %VARS% unexpanded) - [Environment]::SetEnvironmentVariable
  #     would rewrite it as REG_SZ with every %VAR% expanded. GUGBAB_PATH_REGKEY = another HKCU key (tests only, real PATH untouched)
  $regKey = if ($env:GUGBAB_PATH_REGKEY -and $env:GUGBAB_PATH_REGKEY -match '^HKCU:\\Software\\') { $env:GUGBAB_PATH_REGKEY } else { "HKCU:\Environment" }
  function GetUserPathRaw {
    $k = Get-Item -Path $regKey -ErrorAction SilentlyContinue
    if (-not $k) { return "" }
    return [string]$k.GetValue("Path", "", [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
  }
  function SetUserPathRaw($v) {
    if (-not (Test-Path $regKey)) { New-Item -Path $regKey -Force | Out-Null }
    Set-ItemProperty -Path $regKey -Name Path -Value $v -Type ExpandString
    if ($regKey -ne "HKCU:\Environment") { return }
    # tell Explorer / new terminals that the environment changed (setting a dummy user variable broadcasts WM_SETTINGCHANGE)
    [Environment]::SetEnvironmentVariable("GUGBAB_PATH_REFRESH", "1", "User")
    [Environment]::SetEnvironmentVariable("GUGBAB_PATH_REFRESH", $null, "User")
  }
  function NormDir($p) { return ([Environment]::ExpandEnvironmentVariables($p)).TrimEnd('\', '/').ToLowerInvariant() }
  function PathHas($raw, $d) { foreach ($e in ($raw -split ';')) { if ($e -and (NormDir $e) -eq (NormDir $d)) { return $true } }; return $false }

  # --- path checks: absolute only, not the home folder or a drive root (uninstall must never delete those)
  if ($target.StartsWith("~")) { $target = $homeDir + $target.Substring(1) }
  if (-not [IO.Path]::IsPathRooted($target) -or $target -notmatch '^[A-Za-z]:\\|^\\\\') { Die "Dir must be an absolute path: $target" }
  $target = [IO.Path]::GetFullPath($target).TrimEnd('\')
  if ($target -match '^[A-Za-z]:$' -or (NormDir $target) -eq (NormDir $homeDir)) { Die "cannot install into: $target" }
  if ($target -match '[;"%\r\n]') { Die "Dir has a character that breaks PATH or cmd (; "" %): $target" }
  $binDir = Join-Path $target "bin"

  if ($Uninstall) {
    $raw = GetUserPathRaw
    if (PathHas $raw $binDir) {
      $kept = ($raw -split ';' | Where-Object { $_ -and (NormDir $_) -ne (NormDir $binDir) }) -join ';'
      SetUserPathRaw $kept
      Say "removed from user PATH: $binDir"
    }
    if (Test-Path $target) {
      if (-not (IsOurs $target)) { Die "$target is not a gugbab install - not deleting it" }
      if (Ask "Delete $target ? (per-project on/off settings in projects\ and profile.json go too; chat history in ~\.claude stays)" $false) {
        # NOT Remove-Item -Recurse: on PowerShell 5.1 it can walk through the junctions in projects\<name>\.claude
        # (projects, plugins, plans, sessions -> ~\.claude) and delete chat history. cmd rmdir /s removes a junction
        # without entering it (checked 2026-10-20 on Windows 10).
        & cmd.exe /d /c rmdir /s /q "$target"
        if (Test-Path -LiteralPath $target) { Die "could not delete everything in $target - close programs using it and retry" }
        Say "deleted: $target"
      } else { Say "kept: $target" }
    }
    Say "uninstall finished"
    return
  }

  # --- requirements
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Die "git is required - install Git for Windows: https://git-scm.com/download/win" }
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Die "node 18+ is required - https://nodejs.org" }
  $major = [int]((& node -p "process.versions.node.split('.')[0]") 2>$null)
  if ($major -lt 18) { Die "node 18+ is required (now $(& node -v))" }
  $gitBash = @("$env:ProgramFiles\Git\bin\bash.exe", "${env:ProgramFiles(x86)}\Git\bin\bash.exe", "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
  if ($env:CLAUDE_CODE_GIT_BASH_PATH -and (Test-Path $env:CLAUDE_CODE_GIT_BASH_PATH)) { $gitBash = $env:CLAUDE_CODE_GIT_BASH_PATH }
  if (-not $gitBash) { Say "! Git Bash (Git for Windows) not found - hooks run through Git Bash; without it the safety hooks do not work" }
  if (-not (Get-Command claude -ErrorAction SilentlyContinue)) { Say "! claude not found - install Claude Code first (continuing)" }

  if ($Ref -and -not (ValidRef $Ref)) { Die "bad branch/tag name: $Ref" }
  if ($Version -and $Version -notmatch '^v\d+\.\d+\.\d+$') { Die "-Version must look like vX.Y.Z: $Version" }
  if ($Channel -and $Channel -notin @("stable", "main")) { Die "-Channel is stable or main: $Channel" }

  # --- get / update
  if ((Test-Path $target) -and -not (Test-Path (Join-Path $target ".git"))) { Die "$target exists and is not a gugbab install - choose another -Dir" }
  if (-not (Test-Path $target)) {
    Say "cloning $repoUrl -> $target"
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    try { Invoke-GitChecked @('clone', '--quiet', '--', $repoUrl, $target) } catch { Die "clone failed (network / url): $repoUrl" }
  } else {
    Say "already installed - updating $target"
    if (Get-GitOutput @('-C', $target, 'status', '--porcelain', '--untracked-files=no')) { Die "$target has local changes - not updating (do not edit the install folder)" }
    try { Invoke-GitChecked @('-C', $target, 'fetch', '--quiet', '--tags', '--force', 'origin') } catch { Die "fetch failed (network)" }
  }

  # --- what to check out + update channel (state\channel.json, read by cli\main.js)
  $label = ""; $chan = ""; $tgt = ""
  if ($Version) {
    if (-not (Get-GitOutput @('-C', $target, 'rev-parse', '--verify', '--quiet', "refs/tags/$Version^{commit}"))) { Die "no such tag: $Version" }
    $tgt = "refs/tags/$Version"; $label = $Version; $chan = "{`"channel`":`"stable`",`"pin`":`"$Version`"}"
  } elseif ($Ref) {
    if (Get-GitOutput @('-C', $target, 'rev-parse', '--verify', '--quiet', "refs/remotes/origin/$Ref^{commit}")) { $tgt = "refs/remotes/origin/$Ref"; $label = "branch $Ref"; $chan = "{`"channel`":`"branch`",`"branch`":`"$Ref`"}" }
    elseif (Get-GitOutput @('-C', $target, 'rev-parse', '--verify', '--quiet', "refs/tags/$Ref^{commit}")) { $tgt = "refs/tags/$Ref"; $label = "tag $Ref"; $chan = "{`"channel`":`"stable`",`"pin`":`"$Ref`"}" }
    else { Die "no such branch/tag on the remote: $Ref" }
  } else {
    $tags = @((Get-GitOutput @('-C', $target, 'tag', '--list', 'v*')) -split "`n" | Where-Object { $_ -match '^v\d+\.\d+\.\d+$' })
    $latest = $tags | Sort-Object { [version]($_.Substring(1)) } | Select-Object -Last 1
    if ($Channel -ne "main" -and $latest) { $tgt = "refs/tags/$latest"; $label = "stable $latest"; $chan = '{"channel":"stable"}' }
    else {
      if ($Channel -ne "main") { Say "no stable tag (v*) yet - using main" }
      $tgt = "refs/remotes/origin/main"; $label = "main"; $chan = '{"channel":"main"}'
    }
  }
  $sha = Get-GitOutput @('-C', $target, 'rev-parse', "$tgt^{commit}")
  if (-not $sha) { Die "cannot resolve $tgt" }
  if ($chan -match '"branch"|"main"') { $br = if ($Ref) { $Ref } else { "main" }; Invoke-GitChecked @('-C', $target, 'checkout', '--quiet', '-B', $br, $sha) }
  else { Invoke-GitChecked @('-C', $target, 'checkout', '--quiet', '--detach', $sha) }
  New-Item -ItemType Directory -Force -Path (Join-Path $target "state") | Out-Null
  WriteUtf8NoBom (Join-Path $target "state\channel.json") "$chan`n"
  if (-not (IsOurs $target)) { Die "that version has no Windows wrapper (bin\gugbab-claude.cmd) - pick a branch/tag that has it with -Ref" }
  Say "installed: $label ($(Get-GitOutput @('-C', $target, 'rev-parse', '--short', 'HEAD')))"

  # --- PATH
  $raw = GetUserPathRaw
  if (PathHas $raw $binDir) { Say "PATH already has $binDir" }
  elseif ($NoModifyPath) { Say "! $binDir is not on PATH (-NoModifyPath) - add it yourself, then open a new terminal" }
  else {
    $new = if ($raw) { $raw.TrimEnd(';') + ";" + $binDir } else { $binDir }
    SetUserPathRaw $new
    Say "added to user PATH: $binDir  (open a new terminal to use it)"
  }
  if (-not (PathHas $env:Path $binDir)) { $env:Path = "$binDir;$env:Path" }

  Say "check:"
  & (Join-Path $binDir "gugbab-claude.cmd") doctor
  if ($LASTEXITCODE -ne 0) { Say "! the check found problems - see above" }
  Say "now run gugbab-claude in a project folder (on/off: /harness inside a session, or gugbab-claude harness in a terminal)"
}

Main
