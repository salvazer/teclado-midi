@echo off
echo Iniciando Teclado MIDI Acordeon...
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js no está instalado. Por favor, instala Node.js desde https://nodejs.org/
    echo.
    pause
    exit /b
)

REM Verificar si las dependencias están instaladas
if not exist node_modules (
    echo Instalando dependencias...
    npm install
)

REM Iniciar la aplicación
echo Iniciando la aplicación...
npm start

REM Si hay un error, mostrar mensaje
if %ERRORLEVEL% neq 0 (
    echo.
    echo Ha ocurrido un error al iniciar la aplicación.
    pause
)