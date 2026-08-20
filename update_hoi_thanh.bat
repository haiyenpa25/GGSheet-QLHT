@echo off
setlocal
set "ROOT_DIR=%~dp0"
set "HOI_THANH_DEPLOY_ID=AKfycbz7e9ZVchhCfuTs10-ldapfDMl3ZzqlB2jQz7nCsyFpQXzHJk6c2AYvM_qOs9MODZZ8"

echo ====================================================================
echo   DONG BO VA AUTO-DEPLOY QUAN LY HOI THANH (MASTER)
echo ====================================================================
echo.

echo [1/2] Dang day ma nguon len Google Apps Script...
cd /d "%ROOT_DIR%QuanLyHoiThanh"
call npx --yes @google/clasp push -f

if %ERRORLEVEL% EQU 0 (
    echo   + Push code thanh cong! Dang cap nhat Web App Deployment...
    call npx --yes @google/clasp deploy -i %HOI_THANH_DEPLOY_ID% -d "Auto-deployed %date% %time%"
    echo.
    echo [2/2] Dang dong bo len GitHub...
    cd /d "%ROOT_DIR%"
    git add QuanLyHoiThanh index.html
    git commit -m "Auto update Hoi Thanh at %date% %time%"
    git push origin main
    echo.
    echo ====================================================================
    echo   [HOAN TAT] WEB APP HOI THANH DA CAP NHAT PHIEN BAN MOI NHAT!
    echo ====================================================================
) else (
    echo.
    echo [LOI] Khong the day ma nguon len Apps Script!
)

cd /d "%ROOT_DIR%"
echo.
pause
