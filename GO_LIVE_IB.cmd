@echo off
rem Build, stage, commit and push the IB Physics site in one run (Smith, 2026-09-30:
rem "please get it live!", "skip test!"). The release test suite is skipped. The
rem assembler's own evidence checks and the staging validator still run; either
rem one failing stops the run before anything is committed or pushed.
rem Output goes to tmp\ib-go-live.log.
setlocal
cd /d "%~dp0"
if not exist tmp mkdir tmp
set "LOG=tmp\ib-go-live.log"
set "DEPLOY=deploy\ibphysicsppqs"
set "BASELINE=993e4dda881750c327a4b7b9a8f85fb8f1b55917"

echo ppqviewer IB Physics go-live > "%LOG%"
echo Started %DATE% %TIME% >> "%LOG%"

echo [1/5] Building the site (a minute or two)...
echo ===== assemble ===== >> "%LOG%"
node tools\assemble_ibphysics_release.js >> "%LOG%" 2>&1
if errorlevel 1 goto :build_failed

for /f "usebackq delims=" %%B in (`node -p "require('./dist/ibphysics-release/latest.json').build_id"`) do set "BUILD=%%B"
if "%BUILD%"=="" goto :build_failed
echo       Built %BUILD%.

echo [2/5] Staging it into the deploy folder...
echo ===== stage ===== >> "%LOG%"
node tools\stage_ibphysics_release.js %BASELINE% >> "%LOG%" 2>&1
if errorlevel 1 goto :stage_failed

echo [3/5] Committing the deploy folder...
echo ===== deploy commit ===== >> "%LOG%"
git -C "%DEPLOY%" commit -m "Withhold 72 parts that need a topic not yet met (d035); got it then / get it now with the AI-or-someone-else answer on marks questions (d033); build %BUILD%" >> "%LOG%" 2>&1
if errorlevel 1 goto :commit_failed

echo [4/5] Pushing the site...
echo ===== deploy push ===== >> "%LOG%"
git -C "%DEPLOY%" push >> "%LOG%" 2>&1
if errorlevel 1 goto :push_failed

echo [5/5] Committing and pushing the source that built it...
echo ===== source commit ===== >> "%LOG%"
git add DECISIONS.md ROADMAP.md GO_LIVE_IB.cmd reports/ib-dependency-holds.json tools/ib-dependency-holds.js tools/assemble_ibphysics_release.js test/test_ibphysics_release.js >> "%LOG%" 2>&1
git commit -m "d035 dependency holds applied at assembly (72 parts); one-run go-live script; build %BUILD% published" >> "%LOG%" 2>&1
git push >> "%LOG%" 2>&1
if errorlevel 1 goto :source_push_failed

echo Finished %DATE% %TIME% >> "%LOG%"
echo.
echo LIVE: build %BUILD% is pushed. GitHub Pages takes a minute or two to serve it.
echo Log: %~dp0tmp\ib-go-live.log
exit /b 0

:build_failed
echo.
echo BUILD FAILED. Nothing was staged, committed or pushed. Tell Claude; the log says why.
echo BUILD FAILED >> "%LOG%"
exit /b 1

:stage_failed
echo.
echo STAGING FAILED. Nothing was committed or pushed. Tell Claude; the log says why.
echo STAGING FAILED >> "%LOG%"
exit /b 1

:commit_failed
echo.
echo DEPLOY COMMIT FAILED. Nothing was pushed. Tell Claude; the log says why.
echo DEPLOY COMMIT FAILED >> "%LOG%"
exit /b 1

:push_failed
echo.
echo PUSH FAILED. The build is committed in the deploy folder but not online. Tell Claude.
echo PUSH FAILED >> "%LOG%"
exit /b 1

:source_push_failed
echo.
echo The SITE IS LIVE, but the source commit or push failed. Tell Claude; the log says why.
echo SOURCE PUSH FAILED >> "%LOG%"
exit /b 1
