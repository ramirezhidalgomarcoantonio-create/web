@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias...
  npm install
)
echo.
echo Iniciando sesion en Vercel...
echo Se abrira/iniciara el flujo de autenticacion. Usa tu cuenta de Vercel.
echo.
npx vercel login
echo.
echo Publicando aplicacion...
npx vercel --prod
pause
