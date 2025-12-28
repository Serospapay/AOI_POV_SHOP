@echo off
chcp 65001 >nul
echo ========================================
echo Очищення Docker ресурсів
echo ========================================
echo.

echo [1/4] Статистика до очищення:
docker system df
echo.

echo [2/4] Видалення зупинених контейнерів...
docker container prune -f
echo.

echo [3/4] Видалення невикористовуваних образів...
docker image prune -a -f
echo.

echo [4/4] Видалення build cache...
docker builder prune -a -f
echo.

echo [5/5] Видалення невикористовуваних volumes...
docker volume prune -f
echo.

echo ========================================
echo Статистика після очищення:
docker system df
echo ========================================
echo.
echo Готово! Натисніть будь-яку клавішу для виходу...
pause >nul

