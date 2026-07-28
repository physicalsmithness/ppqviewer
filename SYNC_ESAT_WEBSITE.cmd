@echo off
setlocal
cd /d "%~dp0"
echo.
echo ESAT website update - viewer maintained by Claude; analysis owned by Codex
echo This validates PaperDatabases, rebuilds the analysis bundle,
echo prepares the website, and leaves the changes for GitHub Desktop.
echo It does not commit or push.
echo.
set "SYNC_SCRIPT=%~dp0tools\sync_esat_website.ps1"
if /I "%~f1"=="%SYNC_SCRIPT%" (
  rem Some Windows launch paths append the selected .ps1 as argument 1.
  rem Do not let that accidental argument replace PaperDatabasesRoot.
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SYNC_SCRIPT%" %2 %3 %4 %5 %6 %7 %8 %9
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SYNC_SCRIPT%" %*
)
set "SYNC_EXIT=%ERRORLEVEL%"
echo.
if not "%SYNC_EXIT%"=="0" (
  echo The sync stopped with an error. Nothing was pushed.
) else (
  echo Sync complete. Open deploy\esatwallop in GitHub Desktop.
)
echo.
pause
exit /b %SYNC_EXIT%
