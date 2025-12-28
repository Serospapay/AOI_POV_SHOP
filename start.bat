@echo off
REM Batch файл для запуску PowerCore проекту з логуванням помилок
REM Автоматично запускає Backend та Frontend

echo ========================================
echo PowerCore - Запуск проекту
echo ========================================
echo.

REM Створюємо директорію для логів
if not exist "logs" mkdir logs

REM Встановлюємо дату та час для логів
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo [%date% %time%] Запуск проекту >> logs\startup.log
echo.

REM Перевірка чи MongoDB запущена (опціонально)
echo Перевірка MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB запущена
    echo [%date% %time%] MongoDB запущена >> logs\startup.log
) else (
    echo УВАГА: MongoDB не запущена! Переконайтеся що MongoDB запущена на порту 27017
    echo [%date% %time%] УВАГА: MongoDB не запущена >> logs\startup.log
)
echo.

REM Запуск Backend
echo ========================================
echo Запуск Backend (FastAPI)
echo ========================================
echo Логи: logs\backend.log
echo Помилки: logs\backend_errors.log
echo.

cd backend

REM Перевірка чи встановлені залежності
if not exist "venv" (
    echo Створення віртуального середовища...
    python -m venv venv
)

REM Активація віртуального середовища
call venv\Scripts\activate.bat

REM Встановлення залежностей (якщо потрібно)
if not exist "venv\Lib\site-packages\fastapi" (
    echo Встановлення залежностей Backend...
    pip install -r requirements.txt >> ..\logs\backend_install.log 2>&1
)

REM Запуск Backend з логуванням
echo Запуск Backend сервера...
start "PowerCore Backend" /MIN cmd /c "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload >> ..\logs\backend.log 2>> ..\logs\backend_errors.log & echo Backend процес завершено з кодом %ERRORLEVEL% >> ..\logs\backend_errors.log"

cd ..

REM Очікування запуску Backend
timeout /t 3 /nobreak > nul

REM Запуск Frontend
echo ========================================
echo Запуск Frontend (Next.js)
echo ========================================
echo Логи: logs\frontend.log
echo Помилки: logs\frontend_errors.log
echo.

cd frontend

REM Перевірка чи встановлені залежності
if not exist "node_modules" (
    echo Встановлення залежностей Frontend...
    call npm install >> ..\logs\frontend_install.log 2>&1
)

REM Запуск Frontend з логуванням
echo Запуск Frontend сервера...
start "PowerCore Frontend" /MIN cmd /c "npm run dev >> ..\logs\frontend.log 2>> ..\logs\frontend_errors.log & echo Frontend процес завершено з кодом %ERRORLEVEL% >> ..\logs\frontend_errors.log"

cd ..

echo.
echo ========================================
echo Проект запущено!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/api/docs
echo.
echo Логи знаходяться в папці logs\
echo.
echo Для зупинки серверів закрийте вікна "PowerCore Backend" та "PowerCore Frontend"
echo або натисніть Ctrl+C та виконайте: stop.bat
echo.
echo [%date% %time%] Проект запущено успішно >> logs\startup.log

pause

