@echo off
cd /d "%~dp0"
if not exist "dist\physics-inputs\trilogy-test-exclusions.json" (
  echo The current Trilogy test comparison must be built first. See PHYSICS_PREVIEW.md.
  exit /b 1
)
if not exist "dist\physics-audit\preib-current-assessments\manifest.json" (
  echo The current Pre-IB test snapshots must be read first. See PHYSICS_PREVIEW.md.
  exit /b 1
)
"C:\CodexProjects\PaperDatabases\tools\python\python.exe" tools\build_ib_d2.py
if errorlevel 1 exit /b %errorlevel%
"C:\CodexProjects\PaperDatabases\tools\python\python.exe" tools\build_ib_data_analysis.py
if errorlevel 1 exit /b %errorlevel%
"C:\CodexProjects\PaperDatabases\tools\python\python.exe" tools\build_preib_physics.py --test-manifest dist\physics-audit\preib-current-assessments\manifest.json
if errorlevel 1 exit /b %errorlevel%
"C:\CodexProjects\PaperDatabases\tools\python\python.exe" tools\build_trilogy_physics.py --exclusions dist\physics-inputs\trilogy-test-exclusions.json
if errorlevel 1 exit /b %errorlevel%
node tools\assemble_physics_preview.js
if errorlevel 1 exit /b %errorlevel%
echo Open http://127.0.0.1:8788/ in your browser.
node tools\serve_physics_preview.js
