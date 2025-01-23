@echo off
setlocal enabledelayedexpansion

:: Get version from package.json using powershell
for /f %%i in ('powershell -command "(Get-Content package.json | ConvertFrom-Json).version"') do set VERSION=%%i

:: Build images
docker build -t reg.kway.club/steamer-api/steamer-api:v%VERSION% -t reg.kway.club/steamer-api/steamer-api:latest .
if %ERRORLEVEL% neq 0 goto :error

:: Login to registry
docker login reg.kway.club
if %ERRORLEVEL% neq 0 goto :error

:: Push images
docker push reg.kway.club/steamer-api/steamer-api:v%VERSION%
if %ERRORLEVEL% neq 0 goto :error

docker push reg.kway.club/steamer-api/steamer-api:latest
if %ERRORLEVEL% neq 0 goto :error

:: Clean up
docker system prune -f

echo ✅ Successfully built and pushed v%VERSION% and latest tags
goto :eof

:error
echo ❌ Error occurred
exit /b 1 