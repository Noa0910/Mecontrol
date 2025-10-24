@echo off
echo ========================================
echo    SISTEMA DE MORBILIDAD URGENCIAS
echo ========================================
echo.
echo Iniciando sistema completo...
echo.

echo [1/4] Verificando XAMPP...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ MySQL esta ejecutandose
) else (
    echo ✗ MySQL no esta ejecutandose
    echo Por favor inicia XAMPP y MySQL
    pause
    exit /b 1
)

echo.
echo [2/4] Iniciando Backend API...
start "Backend API" cmd /k "cd backend-api && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Iniciando Frontend React...
start "Frontend React" cmd /k "cd frontend-morbilidad && npm start"
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Iniciando Actualizador Automatico...
start "Actualizador Automatico" cmd /k "python actualizador_automatico.py"

echo.
echo ========================================
echo    SISTEMA INICIADO EXITOSAMENTE
echo ========================================
echo.
echo Servicios iniciados:
echo • Backend API: http://localhost:5000
echo • Frontend React: http://localhost:3000
echo • Actualizador: Ejecutandose en segundo plano
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:3000




