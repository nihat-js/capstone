@echo off
echo ========================================
echo   HoneyShield Flask API Startup
echo ========================================
echo.
echo Checking prerequisites...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running or not installed!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Test Docker functionality
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not accessible!
    echo Please ensure Docker Desktop is fully started.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker daemon is accessible

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8+ and try again.
    echo.
    pause
    exit /b 1
)
echo [OK] Python is available

REM Check Python dependencies
echo [INFO] Checking Python dependencies...
cd /d "%~dp0python"
python -c "import flask, flask_cors; print('[OK] Flask dependencies available')" 2>nul
if errorlevel 1 (
    echo [WARNING] Flask dependencies not found. Installing...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting Flask API server...
echo API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python app.py
if errorlevel 1 (
    echo.
    echo [ERROR] Flask API failed to start!
    echo Check the error messages above.
)
echo.
pause
