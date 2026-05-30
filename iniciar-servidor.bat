@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias...
  npm install
)
echo.
echo Sitio local disponible en:
echo http://localhost:8000/
echo.
echo Para compartirlo con celulares fuera de tu Wi-Fi, publicalo en un hosting como Render o Railway.
echo.
npm start
