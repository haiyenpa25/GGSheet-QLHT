@echo off
setlocal
set "ROOT_DIR=%~dp0"

echo ======================================================
echo DONG BO SOURCE CODE: QUAN LY HOI THANH (MASTER)
echo ======================================================
cd /d "%ROOT_DIR%QuanLyHoiThanh"
call npx --yes @google/clasp push -f

cd /d "%ROOT_DIR%"
echo.
echo ======================================================
echo [HOAN TAT] DA CAP NHAT XONG DU AN QUAN LY HOI THANH!
echo ======================================================
pause
