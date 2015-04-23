@echo off

set NW_VERSION=0.8.6
set NW_PATH=C:\opt\node-webkit\%NW_VERSION%
set NW=nw
set GYP=nw-gyp
set APP_NAME=Cubelets Studio
set APP_SLUG=cubelets-studio

REM goto zip

:install_modules
echo "Installing node modules..."
call npm install

:build_modules
echo "Building native node modules for node-webkit..."
call cd node_modules\cubelets\node_modules\bluetooth-serial-port
call %GYP% clean
call %GYP% configure --target=%NW_VERSION% --arch=ia32
call %GYP% build
call cd ..\..\..\..
call cd node_modules\cubelets\node_modules\socket.io-client\node_modules\ws
call %GYP% clean
call %GYP% configure --target=%NW_VERSION% --arch=ia32
call %GYP% build
call cd ..\..\..\..\..\..
pause
:zip
echo "Zipping up app.nw package..."
rmdir /s /q build 2> NUL
call mkdir build 2> NUL
call node .\tools\set-app-name "%APP_NAME%"
call 7z a -tzip -mx0 -r -x@exclude.list build\app.nw *
call node .\tools\set-app-name "%APP_SLUG%"

:package
echo "Packaging app.nw into %APP_NAME%.exe..."
copy /b "%NW_PATH%\nw.exe"+build\app.nw "build\nw.exe"
copy /b "%NW_PATH%\nw.pak" "build\nw.pak"
copy /b "%NW_PATH%\ffmpegsumo.dll" "build\ffmpegsumo.dll"
copy /b "%NW_PATH%\icudt.dll" "build\icudt.dll"
copy /b "%NW_PATH%\libEGL.dll" "build\libEGL.dll"
copy /b "%NW_PATH%\libGLESv2.dll" "build\libGLESv2.dll"
call del build\app.nw
