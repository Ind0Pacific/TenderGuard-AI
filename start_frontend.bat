@echo off
title TenderGuard AI - Frontend Server (Next.js)
echo =======================================================
echo Starting TenderGuard AI Frontend (Next.js on Port 3000)
echo Running from E:\TenderGuard-AI\frontend
echo =======================================================
cd /d "%~dp0frontend"
npm.cmd run dev
pause
