@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'SilentlyContinue';" ^
  "$health = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -TimeoutSec 2;" ^
  "if ($health.status -ne 'ok') { Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '%~dp0backend' -WindowStyle Hidden; for ($attempt = 0; $attempt -lt 30; $attempt++) { Start-Sleep -Seconds 1; $health = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -TimeoutSec 2; if ($health.status -eq 'ok') { break } } };" ^
  "if ($health.status -eq 'ok') { Start-Process 'http://localhost:5000' } else { exit 1 }"

if errorlevel 1 (
  echo Qutam could not start. Check that Node.js is installed and port 5000 is available.
  pause
)