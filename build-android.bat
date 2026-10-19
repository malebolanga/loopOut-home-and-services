@echo off
echo ========================================================
echo  Building loopOut Android App (Capacitor)
echo ========================================================

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "%~dp0client"
echo [1/3] Compiling web bundle (Android mode)...
call npm run build:android
if errorlevel 1 (
    echo [ERROR] Web build failed.
    pause
    exit /b 1
)

echo [2/3] Syncing assets to native Android project...
call npx cap sync android
if errorlevel 1 (
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b 1
)

cd /d "%~dp0client\android"
echo [3/3] Assembling Debug APK with Gradle...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo [ERROR] Gradle build failed.
    pause
    exit /b 1
)

cd /d "%~dp0"
copy /y "client\android\app\build\outputs\apk\debug\app-debug.apk" "loopOut-debug.apk"
echo ========================================================
echo  BUILD SUCCESSFUL!
echo  Updated APK ready at: %~dp0loopOut-debug.apk
echo ========================================================
