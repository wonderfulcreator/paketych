@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher ^(py^) not found.
  echo Install Python from python.org and tick "Add to PATH".
  pause
  exit /b 1
)

py -m pip install -r requirements.txt
py "SebestoimostApp_main.py"

endlocal
