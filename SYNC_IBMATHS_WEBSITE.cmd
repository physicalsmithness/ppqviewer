@echo off
setlocal
cd /d "%~dp0"
echo.
echo IB Maths website update - viewer maintained by Claude; catalogue owned by the Maths seat
echo Assembles deploy\ibmathsdriller from the engine, the wrapper and the canonical
echo maths catalogue, copying every referenced crop. Leaves changes for GitHub Desktop.
echo It does not commit or push.
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
