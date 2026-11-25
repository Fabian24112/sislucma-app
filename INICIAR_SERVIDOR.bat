@echo off
title SISLUCMA - Sistema de Inventario
color 0b
echo ===================================================
echo     INICIANDO SISTEMA DE INVENTARIO SISLUCMA
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Servidor en puerto 3000...
start /b cmd /c "node server.js"
timeout /t 2 >nul

echo [2/2] Generando enlace directo a Internet sin contrasenas...
echo.
echo ================================================================
echo   COPIA EL LINK QUE EMPIEZA CON "https://" Y ENVIALO A TUS COMPANEROS:
echo ================================================================
echo.

ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
pause
