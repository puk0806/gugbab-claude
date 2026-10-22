@echo off
rem gugbab-claude (Windows) - runs cli\launch.js with node. PowerShell / cmd / Windows Terminal.
rem ASCII only: cmd reads this file in the console code page (949 etc.).
rem No .ps1 on purpose: PowerShell prefers .ps1 over .cmd and fails under the Restricted execution policy.
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo [gugbab] node is required ^(22 or newer^): https://nodejs.org 1>&2
  exit /b 127
)
node "%~dp0..\cli\launch.js" %*
exit /b %ERRORLEVEL%
