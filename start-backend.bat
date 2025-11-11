@echo off
echo ================================
echo  CutSpace Backend Server
echo ================================
echo.

cd backend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create .env file with:
    echo   TELEGRAM_BOT_TOKEN=your_token
    echo   PORT=3000
    echo   ADMIN_TELEGRAM_ID=your_id
    echo.
    pause
    exit
)

echo Starting backend server...
echo.
call npm start


