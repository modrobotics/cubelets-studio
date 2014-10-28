@echo off

set RESHACK="C:\Program Files (x86)\Resource Hacker\ResHacker.exe"

echo "Building installer..."
call %RESHACK% -addoverwrite "%dp0%build\nw.exe","%dp0%build\nw.exe","%dp0%resources\nw.ico",ICONGROUP,IDR_MAINFRAME,1033
call %RESHACK% -addoverwrite "%dp0%build\nw.exe","%dp0%build\nw.exe","%dp0%resources\nw.ico",ICON,1,1033
call rmdir /s /q dist 2> NUL
call mkdir dist 2> NUL
call candle.exe -nologo "resources\msi\dist.wxs" -out "dist\tmp.wixobj" -ext WixUIExtension
call light.exe -nologo "dist\tmp.wixobj" -out "dist\Cubelets Studio.msi" -ext WixUIExtension
call del "dist\Cubelets Studio.wixpdb"
call del "dist\tmp.wixobj"
