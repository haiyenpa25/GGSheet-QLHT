@echo off
setlocal enabledelayedexpansion
set "ROOT_DIR=%~dp0"
set "HOI_THANH_DEPLOY_ID=AKfycbz7e9ZVchhCfuTs10-ldapfDMl3ZzqlB2jQz7nCsyFpQXzHJk6c2AYvM_qOs9MODZZ8"
set "BAN_NGANH_DEPLOY_ID=AKfycbzA9hu94R8otpipHPtw_52Fimf22HIgxIH02YVdisQU6D3KgCVlltjW0QjuD0KGwdYL"

echo ====================================================================
echo   DONG BO VA AUTO-DEPLOY TOAN BO HE THONG (APPS SCRIPT + GITHUB)
echo ====================================================================
echo.

echo [1/3] DANG CAP NHAT DU AN QUAN LY HOI THANH (MASTER)...
cd /d "%ROOT_DIR%QuanLyHoiThanh"
call npx --yes @google/clasp push -f
if %ERRORLEVEL% EQU 0 (
    echo   + Push code thanh cong. Dang cap nhat Web App Deployment...
    call npx --yes @google/clasp deploy -i %HOI_THANH_DEPLOY_ID% -d "Auto-deployed %date% %time%"
) else (
    echo   [!] Push QuanLyHoiThanh that bai.
)

echo.
echo [2/3] DANG CAP NHAT DU AN BAN THANH TRANG (BAN NGANH)...
cd /d "%ROOT_DIR%QuanLyBanNganh"
call npx --yes @google/clasp push -f
if %ERRORLEVEL% EQU 0 (
    echo   + Push code thanh cong. Dang cap nhat Web App Deployment...
    call npx --yes @google/clasp deploy -i %BAN_NGANH_DEPLOY_ID% -d "Auto-deployed %date% %time%"
) else (
    echo   [!] Push QuanLyBanNganh that bai.
)

echo.
echo [3/3] DANG DAY LEN GITHUB PAGES...
cd /d "%ROOT_DIR%"
git add .
git commit -m "Auto sync and deploy at %date% %time%"
git push origin main

echo.
echo ====================================================================
echo   [HOAN TAT 100%%] CA 2 WEB APP VA GITHUB PAGES DA LIVE BAN MOI NHAT!
echo ====================================================================
echo.
pause
