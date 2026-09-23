@echo off
rem Assemble from the current reviewed inputs, then run every required gate.
rem Stops at the first failure. Never changes another project's source files.
rem Stages nothing and publishes nothing. Full output goes to tmp\ib-release-run.log.
setlocal
cd /d "%~dp0"
if not exist tmp mkdir tmp
if not exist tmp exit /b 1
set "LOG=tmp\ib-release-run.log"
set "RC=0"

echo ppqviewer IB Physics release run > "%LOG%"
if not "%ERRORLEVEL%"=="0" exit /b %ERRORLEVEL%
echo Started %DATE% %TIME% >> "%LOG%"

call :run tools\assemble_ibphysics_release.js
call :run --check engine\ppqviewer.js
for %%T in (test_ibphysics_release test_ib_evidence_equivalence test_ib_evidence_overlay test_ib_evidence_transaction test_ib_release_input_isolation test_ib_d2_recovery test_ib_d2_release test_ib_d2_presentation test_ib_d2_merge test_stage_ibphysics_release test_ppqviewer test_chem test_content_safety verify_analysis_presentation test_categorisation_integration test_economics test_pulse test_vocabulary test_physics test_physics_topic_chooser test_physics_presentation test_physics_filters test_physics_shuffle test_physics_usability test_physics_e_topics test_physics_identity test_physics_reporting) do call :run test\%%T.js

echo Finished %DATE% %TIME% with exit code %RC% >> "%LOG%"
echo.
if "%RC%"=="0" echo Done. All gates passed. Nothing has been staged or published.
if not "%RC%"=="0" echo FAILED. See the log. Nothing has been staged or published.
echo Log: %~dp0tmp\ib-release-run.log
exit /b %RC%

:run
rem Preserve the first failure and skip every later command.
if not "%RC%"=="0" exit /b %RC%
echo Running node %* ...
echo ===== node %* ===== >> "%LOG%"
node %* >> "%LOG%" 2>&1
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo FAILED with exit code %RC%: node %* >> "%LOG%"
exit /b %RC%
