@echo off
cd /d "%~dp0"
title GURU AI JSKM - Server Online Langsung
color 0A

if exist ".\venv\Scripts\python.exe" (
    ".\venv\Scripts\python.exe" run_online.py
) else (
    python run_online.py
)

pause
