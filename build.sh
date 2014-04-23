#!/bin/bash

NW_VERSION=0.8.4
NW_PATH=/opt/node-webkit/$NW_VERSION
NW=$NW_PATH/node-webkit.app/Contents/MacOS/node-webkit
GYP=nw-gyp

# App info
APP_NAME=Cubelets\ Studio
APP_SLUG=cubelets-studio

echo "Installing node modules..."
npm install

echo "Building native node modules for node-webkit..."
cd node_modules/cubelets/node_modules/serialport
$GYP clean
$GYP configure --target=$NW_VERSION
$GYP build
cd ../../../..
cd node_modules/cubelets/node_modules/bluetooth-serial-port
$GYP clean
$GYP configure --target=$NW_VERSION
$GYP build
cd ../../../..
cd node_modules/cubelets/node_modules/socket.io-client/node_modules/ws
$GYP clean
$GYP configure --target=$NW_VERSION
$GYP build
cd ../../../../../..

echo "Zipping up app.nw package..."
mkdir -p build
node ./tools/set-app-name "$APP_NAME" # proper formatting in node-webkit
zip -r build/app.nw * -x@exclude.list
node ./tools/set-app-name "$APP_SLUG" # restore npm compatibility

echo "Packaging app.nw into $APP_NAME.app..."
rm -rf "build/$APP_NAME.app"
cp -R "$NW_PATH/node-webkit.app" "build/$APP_NAME.app"
mv build/app.nw "build/$APP_NAME.app/Contents/Resources/app.nw"
cp resources/Info.plist "build/$APP_NAME.app/Contents/Info.plist"
cp resources/nw.icns "build/$APP_NAME.app/Contents/Resources/nw.icns"
