@echo off
chcp 65001 > nul
echo ======================================================
echo 🚀 ĐANG ĐỒNG BỘ SOURCE CODE: QUẢN LÝ HỘI THÁNH (MASTER)
echo ======================================================
cd /d "%~dp0QuanLyHoiThanh"
call npx @google/clasp push -f
echo.
echo ✅ ĐÃ CẬP NHẬT XONG DỰ ÁN QUẢN LÝ HỘI THÁNH!
pause
