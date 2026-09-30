@echo off
rem Build, stage, commit and push the IB Physics site in one run (Smith, 2026-09-30:
rem "please get it live!", "skip test!"). The release test suite is skipped. The
rem school-test scan, the A.2 clearance, the assembler's evidence checks and the
rem staging validator still run; a failure in any of them stops the run before
rem anything is committed or pushed. Output goes to tmp\ib-go-live.log.
setlocal
cd /d "%~dp0"
if not exist tmp mkdir tmp
set "LOG=tmp\ib-go-live.log"
set "DEPLOY=deploy\ibphysicsppqs"
set "PY=C:\CodexProjects\PaperDatabases\tools\python\python.exe"

echo ppqviewer IB Physics go-live > "%LOG%"
echo Started %DATE% %TIME% >> "%LOG%"
for /f "delims=" %%H in ('git -C "%DEPLOY%" rev-parse HEAD') do set "BASELINE=%%H"
if "%BASELINE%"=="" goto :preflight_failed
echo Deploy baseline %BASELINE% >> "%LOG%"

if not exist reports\ib-a2-release-scope.json goto :build
echo [1/7] Scanning today's school tests for matches (a few minutes)...
echo ===== school-test scan ===== >> "%LOG%"
if not exist "%PY%" set "PY=py"
"%PY%" tools\scan-current-ib-tests.py --output dist\physics-audit\current-ib-tests-a2.json >> "%LOG%" 2>&1
if errorlevel 1 goto :scan_fallback
goto :a2

:scan_fallback
echo       WARNING: the scan could not read every test. Using the 10 September scan, which already covers the 20 A.2 tests.
echo SCAN FAILED; falling back to dist\physics-audit\current-ib-tests.json >> "%LOG%"
copy /y dist\physics-audit\current-ib-tests.json dist\physics-audit\current-ib-tests-a2.json >> "%LOG%" 2>&1

:a2
echo [2/7] Clearing A.2 (a minute)...
echo ===== A.2 clearance ===== >> "%LOG%"
node tools\ib-a2-release.js --write >> "%LOG%" 2>&1
if errorlevel 1 goto :a2_failed

:build
echo [3/7] Building the site (a minute or two)...
echo ===== assemble ===== >> "%LOG%"
node tools\assemble_ibphysics_release.js >> "%LOG%" 2>&1
if errorlevel 1 goto :build_failed

for /f "usebackq delims=" %%B in (`node -p "require('./dist/ibphysics-release/latest.json').build_id"`) do set "BUILD=%%B"
if "%BUILD%"=="" goto :build_failed
echo       Built %BUILD%.

echo [4/7] Staging it into the deploy folder...
echo ===== stage ===== >> "%LOG%"
node tools\stage_ibphysics_release.js %BASELINE% >> "%LOG%" 2>&1
if errorlevel 1 goto :stage_failed

echo [5/7] Committing the deploy folder...
echo ===== deploy commit ===== >> "%LOG%"
git -C "%DEPLOY%" commit -m "IB Physics build %BUILD%: A.2 Forces and momentum joins the site; dependency holds (d035) and automatic school-test holds applied" >> "%LOG%" 2>&1
if errorlevel 1 goto :commit_failed

echo [6/7] Pushing the site...
echo ===== deploy push ===== >> "%LOG%"
git -C "%DEPLOY%" push >> "%LOG%" 2>&1
if errorlevel 1 goto :push_failed

echo [7/7] Committing and pushing the source that built it...
echo ===== source commit ===== >> "%LOG%"
git add DECISIONS.md ROADMAP.md GO_LIVE_IB.cmd tools/assemble_ibphysics_release.js tools/ib-dependency-holds.js tools/ib-a2-input.js tools/ib-a2-release.js tools/merge_ib_a2_release.js reports/ib-a2-release-scope.json reports/ib-a2-release-clearance.json reports/ib-release-inputs/ib-a2-analysis.json >> "%LOG%" 2>&1
git commit -m "A.2 on the E1/E2 pattern: pinned delivery, d035 scope, automatic school-test clearance, merge under the latest topic; build %BUILD% published" >> "%LOG%" 2>&1
git push >> "%LOG%" 2>&1
if errorlevel 1 goto :source_push_failed

echo Finished %DATE% %TIME% >> "%LOG%"
echo.
echo LIVE: build %BUILD% is pushed. GitHub Pages takes a minute or two to serve it.
echo Log: %~dp0tmp\ib-go-live.log
exit /b 0

:preflight_failed
echo.
echo STOPPED: could not read the deploy folder. Nothing was changed. Tell Claude.
exit /b 1

:a2_failed
echo.
echo A.2 CLEARANCE FAILED. Nothing was built, committed or pushed. Tell Claude; the log says why.
echo A.2 CLEARANCE FAILED >> "%LOG%"
exit /b 1

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
