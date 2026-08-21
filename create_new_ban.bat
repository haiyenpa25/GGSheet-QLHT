@echo off
setlocal
set "ROOT_DIR=%~dp0"
chcp 65001 >nul

echo ====================================================================
echo   CÔNG CỤ TẠO DỰ ÁN BAN NGÀNH MỚI (MICROSERVICE SCAFFOLDER)
echo ====================================================================
echo.

set /p FOLDER_NAME="1. Nhập tên thư mục (viết liền, VD: BanThanhNien, BanThieuNhi): "
if "%FOLDER_NAME%"=="" (
    echo [Lỗi] Tên thư mục không được để trống!
    pause
    exit /b
)

set /p DISPLAY_NAME="2. Nhập tên hiển thị (VD: Ban Thanh Niên, Ban Thiếu Nhi): "
if "%DISPLAY_NAME%"=="" set "DISPLAY_NAME=%FOLDER_NAME%"

set /p SHEET_ID="3. Nhập ID Google Sheet (hoặc để trống): "
set /p SCRIPT_ID="4. Nhập Script ID Apps Script (hoặc để trống): "
set /p DEPLOY_ID="5. Nhập Deploy ID Web App (hoặc để trống): "

echo.
echo Đang tiến hành tạo dự án mới...
node "%ROOT_DIR%scripts\scaffold_ban.js" "%FOLDER_NAME%" "%DISPLAY_NAME%" "%SHEET_ID%" "%SCRIPT_ID%" "%DEPLOY_ID%"

echo.
pause
