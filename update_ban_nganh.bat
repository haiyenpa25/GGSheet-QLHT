@echo off
setlocal
set "ROOT_DIR=%~dp0"
set "BAN_NGANH_DEPLOY_ID=AKfycbzA9hu94R8otpipHPtw_52Fimf22HIgxIH02YVdisQU6D3KgCVlltjW0QjuD0KGwdYL"

echo ====================================================================
echo   DONG BO VA AUTO-DEPLOY BAN THANH TRANG (BAN NGANH)
echo ====================================================================
echo.

echo [1/2] Dang day ma nguon len Google Apps Script...
cd /d "%ROOT_DIR%QuanLyBanNganh"
call npx --yes @google/clasp push -f

if %ERRORLEVEL% EQU 0 (
    echo   + Push code thanh cong! Dang cap nhat Web App Deployment...
    call npx --yes @google/clasp deploy -i %BAN_NGANH_DEPLOY_ID% -d "Auto-deployed %date% %time%"
    echo.
    echo [2/2] Dang dong bo len GitHub...
    cd /d "%ROOT_DIR%"
    git add QuanLyBanNganh
    git commit -m "Auto update Ban Nganh at %date% %time%"
    git push origin main
    echo.
    echo ====================================================================
    echo   [HOAN TAT] WEB APP BAN NGANH DA CAP NHAT PHIEN BAN MOI NHAT!
    echo ====================================================================
) else (
    echo.
    echo [LOI] Khong the day ma nguon len Apps Script!
)

cd /d "%ROOT_DIR%"
echo.
pause
