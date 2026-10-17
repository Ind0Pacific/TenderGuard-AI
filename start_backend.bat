@echo off
title TenderGuard AI - Backend Server (FastAPI)
echo =======================================================
echo Starting TenderGuard AI Backend (FastAPI on Port 8000)
echo =======================================================
cd /d "%~dp0"
"C:\Users\vashi\Python311\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
