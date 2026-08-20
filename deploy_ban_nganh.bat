@echo off
setlocal
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo ====================================================================
echo   CONG CU DAY SOURCE CODE CHO BAN NGANH MOI (QUAN LY BAN NGANH)
echo ====================================================================
echo.

set TARGET_SCRIPT_ID=%1

if "%TARGET_SCRIPT_ID%"=="" (
    set /p TARGET_SCRIPT_ID=">> Nhap Script ID cua Ban Nganh (trong Apps Script > Project Settings): "
)

if "%TARGET_SCRIPT_ID%"=="" (
    echo [LOI] Script ID khong duoc de trong!
    pause
    exit /b
)

echo.
echo [1/3] Cau hinh Script ID dich: %TARGET_SCRIPT_ID%
echo {"scriptId":"%TARGET_SCRIPT_ID%","rootDir":"."} > "%ROOT_DIR%QuanLyBanNganh\.clasp.json"

echo.
echo [2/3] Dang day ma nguon tu QuanLyBanNganh len Google Apps Script...
cd /d "%ROOT_DIR%QuanLyBanNganh"
call npx --yes @google/clasp push -f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo   [THANH CONG] Da cap nhat ma nguon cho Ban Nganh thanh cong!
    echo   Link chinh sua: https://script.google.com/d/%TARGET_SCRIPT_ID%/edit
    echo ====================================================================
) else (
    echo.
    echo [LOI] Day ma nguon that bai! Vui long kiem tra lai Script ID hoac dang nhap clasp.
)

cd /d "%ROOT_DIR%"
echo.
pause
