@echo off
chcp 65001 > nul
echo ======================================================
echo 🚀 1. ĐỒNG BỘ: QUẢN LÝ HỘI THÁNH
echo ======================================================
cd /d "%~dp0QuanLyHoiThanh"
call npx @google/clasp push -f

echo.
echo ======================================================
echo 🚀 2. ĐỒNG BỘ: BAN THANH TRÁNG
echo ======================================================
cd /d "%~dp0QuanLyBanNganh"
call npx @google/clasp push -f

echo.
echo ======================================================
echo ✅ ĐÃ CẬP NHẬT THÀNH CÔNG CẢ 2 DỰ ÁN LÊN GOOGLE!
echo ======================================================
pause
