@echo off
setlocal
set "ROOT_DIR=%~dp0"

echo ======================================================
echo DONG BO SOURCE CODE: BAN THANH TRANG (BAN NGANH)
echo ======================================================
cd /d "%ROOT_DIR%QuanLyBanNganh"
call npx --yes @google/clasp push -f

cd /d "%ROOT_DIR%"
echo.
echo ======================================================
echo [HOAN TAT] DA CAP NHAT XONG DU AN BAN THANH TRANG!
echo ======================================================
pause
