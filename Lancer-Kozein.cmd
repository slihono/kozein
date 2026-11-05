@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installe Node.js 22.6 ou plus recent, puis relance ce fichier.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  call npm ci
  if errorlevel 1 exit /b 1
)
echo Kozein : http://localhost:1420
echo Garde cette fenetre ouverte pendant l'utilisation.
call npm run dev
