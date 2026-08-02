@echo off
setlocal
cd /d "%~dp0"

rem --- Run from the right copy, whichever one was double-clicked -------------
rem  Backups and Codex worktrees look identical in Explorer but have no deploy
rem  checkout (deploy\ is gitignored), so double-clicking one used to fail with
rem  an error and nothing else. It now hands over to the real project instead.
rem  Written with GOTO rather than IF-blocks on purpose: the canonical path
rem  contains brackets, which break parenthesised IF blocks in batch.
set "REAL=C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer"
if exist "%~dp0deploy\ibmathsdriller\.git" goto here
if not exist "%REAL%\SYNC_IBMATHS_WEBSITE.cmd" goto here
echo.
echo This copy of ppqviewer has no deploy checkout, so it cannot publish.
echo Handing over to the live project:
echo    %REAL%
echo.
call "%REAL%\SYNC_IBMATHS_WEBSITE.cmd"
exit /b %ERRORLEVEL%
:here

echo.
echo IB Maths website update. Viewer maintained by Claude; catalogue owned by the Maths seat.
echo Assembles deploy\ibmathsdriller from the engine, the wrapper and the canonical
echo maths catalogue, copying every crop and printed page it references.
echo It copies only what is missing, and it does not commit or push.
echo.
echo When you need this: after Claude reports new IMAGES (a fresh extraction, or
echo a viewer change that starts using pages it did not use before). Claude
echo reassembles the small site files itself every session, so a metadata-only
echo regeneration usually needs nothing here: just commit and push.
echo.
node "%~dp0tools\assemble_ibmaths_site.js"
if not %ERRORLEVEL%==0 (
  set "SYNC_EXIT=%ERRORLEVEL%"
  goto report
)
:assets
node "%~dp0tools\assemble_ibmaths_site.js" assets
if %ERRORLEVEL%==2 goto assets
set "SYNC_EXIT=%ERRORLEVEL%"
:report
echo.
if not "%SYNC_EXIT%"=="0" (
  echo The sync stopped with an error. Nothing was pushed.
) else (
  echo Sync complete. Open deploy\ibmathsdriller in GitHub Desktop to review and push.
)
echo.
pause
exit /b %SYNC_EXIT%
