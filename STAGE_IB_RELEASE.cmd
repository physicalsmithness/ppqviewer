@echo off
rem Stage the assembled IB Physics bundle into a clean deploy\ibphysicsppqs.
rem Never resets or discards existing changes. Commits nothing and pushes nothing.
rem Output goes to tmp\ib-stage-run.log. The helper validates the reviewed baseline,
rem source fingerprints, generated package and destination before writing files.
setlocal
cd /d "%~dp0"
if not exist tmp mkdir tmp
if not exist tmp exit /b 1
set "LOG=tmp\ib-stage-run.log"
set "STATUS=tmp\ib-stage-status.txt"
set "DEPLOY=deploy\ibphysicsppqs"
set "BASELINE=161b2826569e4c55f1eaab2f6594672638e40c79"

echo ppqviewer IB Physics staging > "%LOG%"
if not "%ERRORLEVEL%"=="0" exit /b %ERRORLEVEL%
echo Started %DATE% %TIME% >> "%LOG%"

echo [1/2] Checking that the deployment checkout is clean...
echo ===== checkout state ===== >> "%LOG%"
git -C "%DEPLOY%" status --porcelain --untracked-files=all > "%STATUS%" 2>> "%LOG%"
if not "%ERRORLEVEL%"=="0" goto :preflight_failed
type "%STATUS%" >> "%LOG%"
for %%F in ("%STATUS%") do if not "%%~zF"=="0" goto :dirty_checkout

echo [2/2] Validating and staging the assembled bundle...
echo ===== stage_ibphysics_release ===== >> "%LOG%"
node tools\stage_ibphysics_release.js %BASELINE% >> "%LOG%" 2>&1
if not "%ERRORLEVEL%"=="0" goto :stage_failed

echo ===== staged tree ===== >> "%LOG%"
git -C "%DEPLOY%" diff --cached --stat >> "%LOG%" 2>&1
if not "%ERRORLEVEL%"=="0" goto :stage_failed
echo Finished %DATE% %TIME% >> "%LOG%"
echo.
echo Staged. Nothing is committed and nothing is pushed.
echo Log: %~dp0tmp\ib-stage-run.log
exit /b 0

:dirty_checkout
echo STOPPED: the deployment checkout has existing changes. Review them before staging.
echo Nothing has been restored or staged.
echo STOPPED: deployment checkout is not clean >> "%LOG%"
exit /b 1

:preflight_failed
echo STOPPED: could not read the deployment checkout. See the log.
echo Nothing has been restored or staged.
echo STOPPED: checkout preflight failed >> "%LOG%"
exit /b 1

:stage_failed
echo STAGING FAILED. Nothing is committed or pushed. Inspect the checkout and log.
echo STAGING FAILED >> "%LOG%"
exit /b 1
