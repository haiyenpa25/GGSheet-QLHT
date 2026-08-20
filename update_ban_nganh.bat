@echo off
chcp 65001 > nul
echo ======================================================
echo 🚀 ĐANG ĐỒNG BỘ SOURCE CODE: BAN THANH TRÁNG (BAN NGÀNH)
echo ======================================================
cd /d "%~dp0QuanLyBanNganh"
call npx @google/clasp push -f
echo.
echo ✅ ĐÃ CẬP NHẬT XONG DỰ ÁN BAN THANH TRÁNG!
pause
