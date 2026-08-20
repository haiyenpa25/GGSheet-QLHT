@echo off
setlocal
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"
title Push Code to GitHub

echo [1/3] Adding changes...
git add .

echo [2/3] Committing changes...
git commit -m "Update code and batch scripts"

echo [3/3] Pushing to GitHub repository...
git branch -M main
git push -u origin main

echo.
echo ===================================================
echo [DONE] Push to GitHub successfully!
echo Link: https://github.com/haiyenpa25/GGSheet-QLHT
echo ===================================================
pause
