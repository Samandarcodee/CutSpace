@echo off
echo ================================
echo  CutSpace Frontend
echo ================================
echo.

cd frontend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist ".env" (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:3000/api > .env
    echo.
)

echo Starting frontend...
echo.
echo Client: http://localhost:5173
echo Barber: http://localhost:5173/?role=barber
echo.
call npm run dev


