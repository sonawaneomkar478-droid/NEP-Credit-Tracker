@echo off
title Student NEP Credit Tracker - Launcher
echo ========================================================
echo   Launching Student NEP Credit Tracker (MERN Stack)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB service is not running. Attempting to start...
    net start MongoDB
) else (
    echo [OK] MongoDB is running.
)

echo.
echo [2/3] Launching Backend Server on port 5000...
start "NEP Backend Server (Port 5000)" cmd /k "cd server && npm start"

echo.
echo [3/3] Launching Frontend Client on port 5173...
start "NEP Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo   Both Servers Starting!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ========================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
exit
