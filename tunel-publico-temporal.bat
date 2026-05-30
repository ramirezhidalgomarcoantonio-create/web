@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias...
  npm install
)
echo.
echo Abriendo servidor local en otra ventana...
start "Servidor local" cmd /k "cd /d %~dp0 && npm start"
echo Esperando a que el servidor inicie...
timeout /t 5 /nobreak > nul
echo.
echo Creando enlace publico temporal...
echo Abre la ventana titulada "Tunel publico" para ver la URL.
echo Este enlace funciona solo mientras esta ventana y el servidor esten abiertos.
echo.
start "Tunel publico" cmd /k "cd /d %~dp0 && npm run tunnel"
echo Túnel iniciado en una ventana nueva y el navegador deberia abrir el enlace.
echo Mantén abiertas ambas ventanas mientras uses el enlace.
echo.
pause > nul
