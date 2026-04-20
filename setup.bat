@echo off
REM Color codes for Windows
setlocal enabledelayedexpansion

echo.
echo ═══════════════════════════════════════════════════════════
echo    AI CODE REVIEWER - QUICK START
echo ═══════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm found: %NPM_VERSION%

REM Setup backend
echo.
echo Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit backend\.env and add your API keys:
    echo   - OPENAI_API_KEY
    echo   - GITHUB_TOKEN (optional)
)

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo ✓ Backend dependencies already installed
)

echo ✓ Backend setup complete!

REM Setup frontend
echo.
echo Setting up Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo ✓ Frontend dependencies already installed
)

echo ✓ Frontend setup complete!

REM Done
echo.
echo ═══════════════════════════════════════════════════════════
echo ✓ Setup Complete!
echo ═══════════════════════════════════════════════════════════
echo.
echo Next steps:
echo   1. Edit backend\.env with your API keys
echo   2. Open two terminal windows:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     npm run dev
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     npm run dev
echo.
echo   3. Open browser: http://localhost:5173
echo.
echo Documentation: See README.md for detailed instructions
echo.
pause
