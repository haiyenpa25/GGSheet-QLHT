@echo off
title Push Code to GitHub
cd /d "%~dp0"
echo [1/3] Adding changes...
git add .
echo [2/3] Committing changes...
git commit -m "Update-QuanLyHoiThanh-Web-App"
echo [3/3] Pushing to GitHub repository...
git branch -M main
git push -u origin main
echo.
echo ===================================================
echo Done! Please check: https://github.com/haiyenpa25/GGSheet-QLHT
echo ===================================================
pause
