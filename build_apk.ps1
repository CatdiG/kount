# Android APK Clean Rebuild Helper Script
Set-Location "c:\Antigravity IDE\anti\kount"
Write-Host "1. Building Next.js Web Assets..." -ForegroundColor Cyan
npm run build

Write-Host "2. Clearing Stale Assets & Syncing Capacitor..." -ForegroundColor Cyan
Remove-Item -Recurse -Force android/app/src/main/assets/public -ErrorAction SilentlyContinue
npx cap sync android

Write-Host "3. Cleaning Gradle Build Cache..." -ForegroundColor Cyan
Set-Location "c:\Antigravity IDE\anti\kount\android"
.\gradlew.bat clean

Write-Host "4. Compiling Debug APK..." -ForegroundColor Cyan
.\gradlew.bat assembleDebug

Write-Host "Build Complete!" -ForegroundColor Green
Get-Item "c:\Antigravity IDE\anti\kount\android\app\build\outputs\apk\debug\app-debug.apk" | Select-Object FullName, Length, LastWriteTime
