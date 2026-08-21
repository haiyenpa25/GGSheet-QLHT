/**
 * CLI SCAFFOLDING TOOL CHO BAN NGÀNH MỚI (MICROSERVICE SCAFFOLD)
 * Usage: node scripts/scaffold_ban.js <FolderName> <DisplayName> <SpreadsheetId> [ScriptId] [DeployId]
 * Example: node scripts/scaffold_ban.js BanThanhNien "Ban Thanh Niên" 1xyz... 1abc... AKfyc...
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const templateDir = path.join(rootDir, 'QuanLyBanNganh');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
========================================================================
  CÔNG CỤ KHỞI TẠO DỰ ÁN BAN NGÀNH MỚI (MICROSERVICE SCAFFOLD)
========================================================================
Cách sử dụng:
  node scripts/scaffold_ban.js <TênFolder> <TênBan> [SheetID] [ScriptID] [DeployID]

Ví dụ:
  node scripts/scaffold_ban.js BanThanhNien "Ban Thanh Niên" 1qI_abc123
========================================================================
`);
  process.exit(1);
}

const folderName = args[0].replace(/[^a-zA-Z0-9_-]/g, '');
const displayName = args[1];
const spreadsheetId = args[2] || '';
const scriptId = args[3] || '';
const deployId = args[4] || '';

const targetDir = path.join(rootDir, folderName);

if (fs.existsSync(targetDir)) {
  console.error(`[LỖI] Thư mục "${folderName}" đã tồn tại! Vui lòng chọn tên khác.`);
  process.exit(1);
}

console.log(`[1/4] Đang tạo thư mục mới: ${folderName}...`);
fs.mkdirSync(targetDir, { recursive: true });

console.log(`[2/4] Đang sao chép mã nguồn mẫu từ QuanLyBanNganh...`);
const filesToCopy = ['appsscript.json', 'Index.html', 'Styles.html'];
filesToCopy.forEach(file => {
  const src = path.join(templateDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

// Copy & Customize Code.gs
let codeGs = fs.readFileSync(path.join(templateDir, 'Code.gs'), 'utf8');
if (spreadsheetId) {
  codeGs = codeGs.replace(/const DEFAULT_SPREADSHEET_ID = '.*?';/, `const DEFAULT_SPREADSHEET_ID = '${spreadsheetId}';`);
}
codeGs = codeGs.replace(/const title = \(e && e\.parameter && e\.parameter\.title\) \|\| '.*?';/, `const title = (e && e.parameter && e.parameter.title) || '${displayName}';`);
fs.writeFileSync(path.join(targetDir, 'Code.gs'), codeGs, 'utf8');

// Copy & Customize JavaScript.html
let jsHtml = fs.readFileSync(path.join(templateDir, 'JavaScript.html'), 'utf8');
if (spreadsheetId) {
  jsHtml = jsHtml.replace(/state\.activeSheetId = \(urlParams \? urlParams\.get\('sheetId'\) : ''\) \|\| serverCfg\.sheetId \|\| '.*?';/, `state.activeSheetId = (urlParams ? urlParams.get('sheetId') : '') || serverCfg.sheetId || '${spreadsheetId}';`);
}
jsHtml = jsHtml.replace(/state\.banNganhTitle = \(urlParams \? urlParams\.get\('title'\) : ''\) \|\| serverCfg\.banNganhTitle \|\| '.*?';/, `state.banNganhTitle = (urlParams ? urlParams.get('title') : '') || serverCfg.banNganhTitle || '${displayName}';`);
fs.writeFileSync(path.join(targetDir, 'JavaScript.html'), jsHtml, 'utf8');

// Create .clasp.json
const claspConfig = {
  scriptId: scriptId,
  rootDir: "."
};
fs.writeFileSync(path.join(targetDir, '.clasp.json'), JSON.stringify(claspConfig, null, 2), 'utf8');

// Create project.config.json
const projectConfig = {
  name: folderName,
  displayName: displayName,
  scriptId: scriptId,
  spreadsheetId: spreadsheetId,
  deploymentId: deployId,
  webAppUrl: deployId ? `https://script.google.com/macros/s/${deployId}/exec` : "",
  title: displayName,
  createdAt: new Date().toISOString()
};
fs.writeFileSync(path.join(targetDir, 'project.config.json'), JSON.stringify(projectConfig, null, 2), 'utf8');

console.log(`[3/4] Đang tạo script auto-deploy riêng cho ${folderName}...`);
const batContent = `@echo off
setlocal
set "ROOT_DIR=%~dp0"
set "DEPLOY_ID=${deployId}"

echo ====================================================================
echo   DONG BO VA AUTO-DEPLOY ${displayName.toUpperCase()}
echo ====================================================================
echo.

cd /d "%ROOT_DIR%${folderName}"
call npx --yes @google/clasp push -f

if %ERRORLEVEL% EQU 0 (
    if not "%DEPLOY_ID%"=="" (
        echo   + Push code thanh cong! Dang cap nhat Web App Deployment...
        call npx --yes @google/clasp deploy -i %DEPLOY_ID% -d "Auto-deployed %date% %time%"
    )
    echo.
    echo [2/2] Dang dong bo len GitHub...
    cd /d "%ROOT_DIR%"
    git add ${folderName}
    git commit -m "Auto update ${folderName} at %date% %time%"
    git push origin main
    echo.
    echo ====================================================================
    echo   [HOAN TAT] WEB APP ${displayName.toUpperCase()} DA DUOC CAP NHAT!
    echo ====================================================================
) else (
    echo.
    echo [LOI] Khong the day ma nguon len Apps Script! Vui long kiem tra scriptId trong ${folderName}/.clasp.json
)

cd /d "%ROOT_DIR%"
pause
`;
fs.writeFileSync(path.join(rootDir, `update_${folderName.toLowerCase()}.bat`), batContent, 'utf8');

console.log(`[4/4] THÀNH CÔNG!`);
console.log(`
========================================================================
  [HOÀN TẤT] ĐÃ TẠO DỰ ÁN BAN NGÀNH: "${displayName}"
========================================================================
- Thư mục dự án: ${folderName}/
- File cấu hình: ${folderName}/project.config.json
- File Apps Script ID: ${folderName}/.clasp.json
- Script Auto-deploy: update_${folderName.toLowerCase()}.bat

Các bước tiếp theo:
1. Tạo 1 Apps Script mới trên Google và dán Script ID vào "${folderName}/.clasp.json"
2. Chạy file "update_${folderName.toLowerCase()}.bat" để push code lên Apps Script!
========================================================================
`);
