@echo off
setlocal

REM ------------------------------------------------------------
REM Build ETA_Predictor.exe (Windows) using PyInstaller
REM This script:
REM 1) creates a venv
REM 2) installs dependencies
REM 3) builds a single-file GUI exe (no console window)
REM ------------------------------------------------------------

REM Go to the folder containing this .bat file
cd /d %~dp0

REM Create venv if not exists
if not exist .venv (
  python -m venv .venv
)

call .venv\Scripts\activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install pyinstaller

REM If you want drag & drop in GUI, uncomment next line:
REM python -m pip install tkinterdnd2

REM Build
pyinstaller --noconsole --onefile --name ETA_Predictor ^
  --collect-all sklearn --collect-all openpyxl --collect-all pandas --collect-all numpy ^
  eta_gui_tk.py

echo.
echo Done. Your EXE is here:
echo   %cd%\dist\ETA_Predictor.exe
pause
endlocal
