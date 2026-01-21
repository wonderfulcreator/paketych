@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo  SebestoimostApp - build EXE (Windows)
echo ==========================================
echo.

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher ^(py^) not found.
  echo Install Python from python.org and tick "Add to PATH".
  pause
  exit /b 1
)

echo [1/3] Installing dependencies...
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
py -m pip install pyinstaller

echo.
echo [2/3] Building EXE...
py -m PyInstaller --noconsole --onefile --clean --name "SebestoimostApp" "SebestoimostApp_main.py"
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo [3/3] Copying cbm_map.json next to EXE...
if exist "cbm_map.json" (
  copy /Y "cbm_map.json" "dist\cbm_map.json" >nul
)

echo.
echo Done!
echo EXE: dist\SebestoimostApp.exe
echo CBM map: dist\cbm_map.json
echo.
pause
endlocal
