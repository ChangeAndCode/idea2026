@echo off
set "NODE_EXE=C:\Users\eoncr\AppData\Local\Author Software\nvm\.nodejs\node.exe"
set "PROJECT_DIR=C:\Users\eoncr\OneDrive\Documentos\github_2026\idea2026\ideaCronBackup"
set "LOG_FILE=%PROJECT_DIR%\logs\task-scheduler.log"

cd /d "%PROJECT_DIR%"
echo. >> "%LOG_FILE%"
echo ==== START %date% %time% ==== >> "%LOG_FILE%"
"%NODE_EXE%" "%PROJECT_DIR%\scripts\run-all.js" >> "%LOG_FILE%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
echo ==== END %date% %time% CODE %EXIT_CODE% ==== >> "%LOG_FILE%"
exit /b %EXIT_CODE%
