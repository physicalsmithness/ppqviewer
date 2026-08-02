@echo off
setlocal
cd /d "%~dp0"

rem --- Run from the right copy, whichever one was double-clicked -------------
rem  Same hazard as the IB Maths sync: backups and Codex worktrees have no
rem  deploy checkout (deploy\ is gitignored). GOTO, not IF-blocks: the
rem  canonical path contains brackets, which break parenthesised IF blocks.
set "REAL=C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer"
if exist "%~dp0deploy\esatwallop\.git" goto here
if not exist "%REAL%\SYNC_ESAT_WEBSITE.cmd" goto here
echo.
echo This copy of ppqviewer has no deploy checkout, so it cannot publish.
echo Handing over to the live project:
echo    %REAL%
echo.
call "%REAL%\SYNC_ESAT_WEBSITE.cmd" %*
exit /b %ERRORLEVEL%
:here

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
