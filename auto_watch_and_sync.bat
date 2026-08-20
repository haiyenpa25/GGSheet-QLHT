@echo off
set "ROOT_DIR=%~dp0"
title AUTO-SYNC REALTIME (APPS SCRIPT + GITHUB)
cd /d "%ROOT_DIR%"

echo ====================================================================
echo   KHOI DONG DICH VU AUTO-SYNC (LUU FILE = TU DONG CAP NHAT WEB APP)
echo ====================================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%scripts\watch_sync.ps1"

pause
