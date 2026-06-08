@echo off
chcp 65001 >nul
title XPay Exam Portal

echo.
echo  XPay Exam Portal — Starting...
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] Node.js not found!
  echo  Please install from https://nodejs.org/ then re-run this file.
  pause
  exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
  echo  Installing dependencies...
  npm install
  if errorlevel 1 ( echo Install failed. & pause & exit /b 1 )
)

:: Doctor check
npm run doctor
if errorlevel 1 ( echo Doctor check failed. & pause & exit /b 1 )

echo.
echo  Student login    : http://localhost:8080
echo  Invigilator dash : http://localhost:8080/submissions
echo  Invigilator PIN  : xpay-2026
echo.
echo  Keep this window open during exams. Press Ctrl+C to stop.
echo.

npm run dev
pause
