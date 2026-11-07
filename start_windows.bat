@echo off
cd /d "%~dp0"
echo Thumb Keyboard Lab - local server
echo.
echo Find your IPv4 address with ipconfig in another terminal.
echo On your iPhone open http://YOUR-IPV4:8000/
echo Stop the server with Ctrl+C or by closing this window.
echo.
py -m http.server 8000 --bind 0.0.0.0
if errorlevel 1 (
    echo.
    echo If Python is installed but py is unavailable, try: python -m http.server 8000 --bind 0.0.0.0
    pause
)
