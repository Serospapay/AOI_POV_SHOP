@echo off
REM Batch файл для перегляду логів PowerCore

echo ========================================
echo PowerCore - Перегляд логів
echo ========================================
echo.

if not exist "logs" (
    echo Папка logs не існує. Спочатку запустіть start.bat
    pause
    exit /b
)

:menu
echo Виберіть файл логу для перегляду:
echo.
echo 1. Backend лог (backend.log)
echo 2. Backend помилки (backend_errors.log)
echo 3. Frontend лог (frontend.log)
echo 4. Frontend помилки (frontend_errors.log)
echo 5. Startup лог (startup.log)
echo 6. Переглянути всі логи в Notepad++
echo 7. Очистити всі логи
echo 8. Вихід
echo.

set /p choice="Ваш вибір (1-8): "

if "%choice%"=="1" (
    if exist "logs\backend.log" (
        notepad logs\backend.log
    ) else (
        echo Файл logs\backend.log не знайдено
        pause
    )
    goto menu
)

if "%choice%"=="2" (
    if exist "logs\backend_errors.log" (
        notepad logs\backend_errors.log
    ) else (
        echo Файл logs\backend_errors.log не знайдено
        pause
    )
    goto menu
)

if "%choice%"=="3" (
    if exist "logs\frontend.log" (
        notepad logs\frontend.log
    ) else (
        echo Файл logs\frontend.log не знайдено
        pause
    )
    goto menu
)

if "%choice%"=="4" (
    if exist "logs\frontend_errors.log" (
        notepad logs\frontend_errors.log
    ) else (
        echo Файл logs\frontend_errors.log не знайдено
        pause
    )
    goto menu
)

if "%choice%"=="5" (
    if exist "logs\startup.log" (
        notepad logs\startup.log
    ) else (
        echo Файл logs\startup.log не знайдено
        pause
    )
    goto menu
)

if "%choice%"=="6" (
    if exist "C:\Program Files\Notepad++\notepad++.exe" (
        "C:\Program Files\Notepad++\notepad++.exe" logs\*.log
    ) else (
        echo Notepad++ не знайдено. Відкриваю в стандартному Notepad...
        start notepad logs\backend.log
        start notepad logs\backend_errors.log
        start notepad logs\frontend.log
        start notepad logs\frontend_errors.log
        start notepad logs\startup.log
    )
    goto menu
)

if "%choice%"=="7" (
    echo Ви впевнені що хочете видалити всі логи? (Y/N)
    set /p confirm=
    if /i "%confirm%"=="Y" (
        del /Q logs\*.log
        echo Всі логи видалено
        pause
    )
    goto menu
)

if "%choice%"=="8" (
    exit /b
)

echo Невірний вибір!
pause
goto menu

