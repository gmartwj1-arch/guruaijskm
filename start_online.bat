@echo off
cd /d "%~dp0"
title GURU AI JSKM - Online Server
echo ========================================================
echo   MENJALANKAN GURU AI JSKM - ONLINE CLOUD
echo ========================================================
echo.

echo 1. Menyiapkan Backend Uvicorn...
:: Matikan uvicorn lama jika ada yang macet di port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Jalankan backend di window terpisah agar tidak mati saat copy link
start "GURU AI Backend" /min ".\venv\Scripts\uvicorn.exe" backend.app:app --host 0.0.0.0 --port 8000
echo Menunggu Backend siap...
timeout /t 4 /nobreak >nul

echo.
echo 2. Menghubungkan ke Cloudflare Tunnel Online...
echo ========================================================
echo Silakan copy link https://....trycloudflare.com di bawah ini
echo untuk dibuka dari HP / Jarak Jauh.
echo ========================================================
echo.

.\cloudflared.exe tunnel --url http://127.0.0.1:8000

pause

