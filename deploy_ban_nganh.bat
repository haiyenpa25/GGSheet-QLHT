@echo off
chcp 65001 >nul
echo ====================================================================
echo   CÔNG CỤ ĐẨY SOURCE CODE LÊN BẤT KỲ BAN NGÀNH NÀO (QUAN LY BAN NGANH)
echo ====================================================================
echo.

set TARGET_SCRIPT_ID=%1

if "%TARGET_SCRIPT_ID%"=="" (
    set /p TARGET_SCRIPT_ID=">> Nhập Script ID của Ban Ngành (trong Apps Script > Project Settings): "
)

if "%TARGET_SCRIPT_ID%"=="" (
    echo [LOI] Script ID khong duoc de trong!
    pause
    exit /b
)

echo.
echo [1/3] Cấu hình Script ID đích: %TARGET_SCRIPT_ID%
echo {"scriptId":"%TARGET_SCRIPT_ID%","rootDir":"."} > "QuanLyBanNganh\.clasp.json"

echo.
echo [2/3] Đang đẩy mã nguồn từ QuanLyBanNganh lên Google Apps Script...
cd QuanLyBanNganh
call npx @google/clasp push -f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo   [THANH CONG] Đã cập nhật mã nguồn cho Ban Ngành thành công!
    echo   Link chỉnh sửa: https://script.google.com/d/%TARGET_SCRIPT_ID%/edit
    echo ====================================================================
) else (
    echo.
    echo [LOI] Đẩy mã nguồn thất bại! Vui lòng kiểm tra lại Script ID hoặc quyền đăng nhập clasp.
)

cd ..
echo.
pause
