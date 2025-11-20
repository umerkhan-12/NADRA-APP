@echo off
echo ========================================
echo   NADRA Chatbot - Setup Script
echo ========================================
echo.

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Checking for .env file...

if not exist ".env" (
    echo .env file not found! Creating from example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit chatbot\.env and add your COHERE_API_KEY
    echo    Get free API key from: https://dashboard.cohere.com/api-keys
    echo.
    pause
) else (
    echo ✓ .env file exists
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the chatbot:
echo   python app.py
echo.
pause
