$LogDir = "log"

if (Test-Path "$LogDir/frontend.pid") {
    $procId = Get-Content "$LogDir/frontend.pid"
    if ($procId) {
        taskkill /F /T /PID $procId 2>$null
    }
    Remove-Item "$LogDir/frontend.pid" -ErrorAction SilentlyContinue
}

if (Test-Path "$LogDir/backend.pid") {
    $procId = Get-Content "$LogDir/backend.pid"
    if ($procId) {
        taskkill /F /T /PID $procId 2>$null
    }
    Remove-Item "$LogDir/backend.pid" -ErrorAction SilentlyContinue
}

Write-Host "Services stopped."
