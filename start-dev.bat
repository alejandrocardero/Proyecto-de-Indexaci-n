@echo off
cd D:\Proyectos\Indexacion\Proyecto-de-Indexaci-n
echo Deteniendo servidores Node anteriores...
taskkill /F /IM "node.exe" >nul 2>&1
echo Iniciando servidor de desarrollo Next.js...
npm run dev
pause