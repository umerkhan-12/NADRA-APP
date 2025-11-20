@echo off
echo ========================================
echo   NADRA System - Starting Services
echo ========================================
echo.

echo [1/2] Starting Flask Chatbot API...
start "Flask Chatbot API" cmd /k "cd chatbot && python app.py"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Next.js Application...
start "Next.js App" cmd /k "npm run dev"

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo Flask API: http://localhost:5000
echo Next.js App: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
