@echo off
title TenderGuard AI - Master Launcher
echo ===============================================================
echo Launching TenderGuard AI (FastAPI Backend + Next.js Frontend)...
echo ===============================================================

start "TenderGuard AI Backend" "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "TenderGuard AI Frontend" "%~dp0start_frontend.bat"

echo.
echo Both servers have been launched!
echo - Web Dashboard:  http://localhost:3000
echo - Backend API:    http://127.0.0.1:8000
echo - Swagger Docs:   http://127.0.0.1:8000/api/docs
echo.
pause
