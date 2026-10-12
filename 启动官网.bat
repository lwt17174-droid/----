@echo off
setlocal
if not exist "%~dp0index.html" exit /b 1
start "" "%~dp0index.html"
endlocal
