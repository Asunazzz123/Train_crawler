$LogDir = "log"

if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$f = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run dev" `
    -RedirectStandardOutput "$LogDir/frontend.log" `
    -RedirectStandardError "$LogDir/frontend_err.log" `
    -NoNewWindow -PassThru
$f.Id | Out-File -FilePath "$LogDir/frontend.pid" -Encoding ascii

$b = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","conda run -n dl python backend/app.py" `
    -RedirectStandardOutput "$LogDir/backend.log" `
    -RedirectStandardError "$LogDir/backend_err.log" `
    -NoNewWindow -PassThru
$b.Id | Out-File -FilePath "$LogDir/backend.pid" -Encoding ascii

Write-Host "Frontend PID: $($f.Id), Backend PID: $($b.Id)"
