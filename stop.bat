@echo off
REM Batch файл для зупинки PowerCore проекту

echo ========================================
echo PowerCore - Зупинка проекту
echo ========================================
echo.

set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo [%date% %time%] Зупинка проекту >> logs\startup.log

REM Зупинка Backend (uvicorn процеси)
echo Зупинка Backend...
taskkill /FI "WINDOWTITLE eq PowerCore Backend*" /T /F >nul 2>&1
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "uvicorn python"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo Backend зупинено
echo [%date% %time%] Backend зупинено >> logs\startup.log

REM Зупинка Frontend (Next.js процеси)
echo Зупинка Frontend...
taskkill /FI "WINDOWTITLE eq PowerCore Frontend*" /T /F >nul 2>&1
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "node next"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo Frontend зупинено
echo [%date% %time%] Frontend зупинено >> logs\startup.log

REM Зупинка процесів на портах (якщо залишились)
echo Зупинка процесів на портах 8000 та 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ========================================
echo Проект зупинено
echo ========================================
echo.

pause

