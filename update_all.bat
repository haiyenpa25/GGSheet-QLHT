@echo off
setlocal
set "ROOT_DIR=%~dp0"

echo ======================================================
echo [1/2] DONG BO SOURCE CODE: QUAN LY HOI THANH (MASTER)
echo ======================================================
cd /d "%ROOT_DIR%QuanLyHoiThanh"
call npx --yes @google/clasp push -f

echo.
echo ======================================================
echo [2/2] DONG BO SOURCE CODE: BAN THANH TRANG (BAN NGANH)
echo ======================================================
cd /d "%ROOT_DIR%QuanLyBanNganh"
call npx --yes @google/clasp push -f

cd /d "%ROOT_DIR%"
echo.
echo ======================================================
echo [HOAN TAT] DA CAP NHAT THANH CONG CA 2 DU AN LEN GOOGLE!
echo ======================================================
pause
