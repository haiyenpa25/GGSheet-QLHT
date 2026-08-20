# File: scripts/watch_sync.ps1
# Auto-Sync & Real-Time Auto-Deploy Watcher for Google Apps Script & GitHub Pages

$rootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $rootDir

$HOI_THANH_DEPLOY_ID = "AKfycbz7e9ZVchhCfuTs10-ldapfDMl3ZzqlB2jQz7nCsyFpQXzHJk6c2AYvM_qOs9MODZZ8"
$BAN_NGANH_DEPLOY_ID = "AKfycbzA9hu94R8otpipHPtw_52Fimf22HIgxIH02YVdisQU6D3KgCVlltjW0QjuD0KGwdYL"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   CHE DO AUTO-SYNC TU DONG KHI LUU CODE (REAL-TIME WATCHER)       " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Thu muc dang theo doi: $rootDir" -ForegroundColor Gray
Write-Host "Moi khi ban nhan Ctrl+S (Luu file), he thong se TU DONG:" -ForegroundColor White
Write-Host "  1. Day code len Google Apps Script (clasp push)" -ForegroundColor White
Write-Host "  2. Cap nhat ban live Web App (clasp deploy)" -ForegroundColor White
Write-Host "  3. Day len GitHub Pages (git push)" -ForegroundColor White
Write-Host "--------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "Dang lang nghe thay doi file... (Nhan Ctrl+C de dung)" -ForegroundColor Green
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $rootDir
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite'

$lastSyncTime = [DateTime]::MinValue
$lockObj = New-Object System.Object

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $fileName = $Event.SourceEventArgs.Name

    # Filter out git, temp and log files
    if ($path -match "\.git\\" -or $path -match "\.clasp" -or $path -match "\.log" -or $path -match "node_modules") {
        return
    }

    # Only watch relevant code extensions
    if ($path -notmatch "\.(gs|html|js|css|json|md)$") {
        return
    }

    [System.Threading.Monitor]::Enter($lockObj)
    try {
        $now = [DateTime]::Now
        if (($now - $script:lastSyncTime).TotalSeconds -lt 3) {
            return
        }
        $script:lastSyncTime = $now

        Write-Host "[$($now.ToString('HH:mm:ss'))] Phat hien thay doi: $fileName" -ForegroundColor Yellow
        Write-Host "  -> Dang tu dong cap nhat Web App va GitHub..." -ForegroundColor Cyan

        $isBanNganh = $path -match "QuanLyBanNganh"
        $isHoiThanh = $path -match "QuanLyHoiThanh" -or $path -match "index\.html"

        if ($isBanNganh) {
            Set-Location "$rootDir\QuanLyBanNganh"
            npx --yes @google/clasp push -f *>$null
            npx --yes @google/clasp deploy -i $BAN_NGANH_DEPLOY_ID -d "Auto-synced on save" *>$null
            Write-Host "  [OK] Da cap nhat Web App Ban Nganh!" -ForegroundColor Green
        }

        if ($isHoiThanh) {
            Set-Location "$rootDir\QuanLyHoiThanh"
            npx --yes @google/clasp push -f *>$null
            npx --yes @google/clasp deploy -i $HOI_THANH_DEPLOY_ID -d "Auto-synced on save" *>$null
            Write-Host "  [OK] Da cap nhat Web App Hoi Thanh!" -ForegroundColor Green
        }

        Set-Location $rootDir
        git add . *>$null
        git commit -m "Auto-sync code change: $fileName at $($now.ToString('HH:mm:ss'))" *>$null
        git push origin main *>$null
        Write-Host "  [OK] Da day len GitHub Pages thanh cong!" -ForegroundColor Green
        Write-Host "--- San sang nhan thay doi tiep theo ---`n" -ForegroundColor Gray
    }
    catch {
        Write-Host "  [LOI] $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        [System.Threading.Monitor]::Exit($lockObj)
    }
}

Register-ObjectEvent $watcher 'Changed' -Action $action | Out-Null
Register-ObjectEvent $watcher 'Created' -Action $action | Out-Null

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
}
