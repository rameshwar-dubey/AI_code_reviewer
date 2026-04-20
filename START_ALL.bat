@echo off
REM AI Code Reviewer - Quick Start Script
REM This script starts all three services for the AI Code Reviewer

echo.
echo ========================================
echo  AI CODE REVIEWER - QUICK START
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
echo ✓ Python found
echo.

REM Get the directory of this script
set SCRIPT_DIR=%~dp0

echo Starting AI Code Reviewer...
echo.

REM Start Backend
echo 1. Starting Backend (port 5000)...
start cmd /k "cd /d %SCRIPT_DIR%backend && npm start"
timeout /t 3 /nobreak

REM Start ML Service
echo 2. Starting ML Service (port 5001)...
start cmd /k "cd /d %SCRIPT_DIR%ml_service && python app.py"
timeout /t 3 /nobreak

REM Start Frontend
echo 3. Starting Frontend (port 5173)...
start cmd /k "cd /d %SCRIPT_DIR%frontend && npm run dev"
timeout /t 3 /nobreak

echo.
echo ========================================
echo  ✓ All services started!
echo ========================================
echo.
echo Services running on:
echo   Backend:    http://localhost:5000
echo   ML Service: http://localhost:5001
echo   Frontend:   http://localhost:5173
echo.
echo Opening browser...
timeout /t 2
start http://localhost:5173
echo.
echo To stop services, close the terminal windows.
echo Press any key to exit this window...
pause >nul
