@echo off
echo ====================================
echo Iniciando Backend (FastAPI) en puerto 8000
echo ====================================
cd D:\Proyectos\Indexacion\Proyecto-de-Indexaci-n\backend
start "Backend" python -m uvicorn app.main:app --port 8000

echo.
echo ====================================
echo Esperando a que el backend esté listo...
echo ====================================
timeout /t 5

echo.
echo ====================================
echo Iniciando Frontend (Next.js) en puerto 3000
echo ====================================
cd D:\Proyectos\Indexacion\Proyecto-de-Indexaci-n
start "Frontend" npm run dev

echo.
echo ====================================
echo Ambos servicios iniciados.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ====================================
pause