# Node-WebKit
NW_VERSION="0.6.3"
NW_PATH="/Users/Donald/Development/Tools/node-webkit/node-webkit-v$(VERSION)-osx-ia32"

# Node package manager
NPM_PATH="/usr/local/share/npm"

# Binaries
NW="$(NW_PATH)/node-webkit.app/Contents/MacOS/node-webkit"
GYP="$(NPM_PATH)/lib/node_modules/nw-gyp/bin/nw-gyp.js"

all:osx windows linux

osx:zip
	cp -R platform/osx/Cubelets\ Studio.app build
	mv build/app.nw build/Cubelets\ Studio.app/Contents/Resources/app.nw

linux:zip
	cat $(NW) build/app.nw > build/cubelets-studio && chmod +x build/cubelets-studio
	rm build/app.nw

windows:zip
	copy /b $(NW)+build/app.nw build/Cubelets\ Studio.exe
	rm build/app.nw

build:build-submodules build-serialport

build-submodules:
	git submodule init
	git submodule update

build-serialport:
	cd node_modules/cubelets/node_modules/serialport;\
	$(GYP) clean;\
	$(GYP) configure --target=$(NW_VERSION);\
	$(GYP) build

zip:
	zip -r build/app.nw * -x@exclude.list

clean:
	rm -rf build/*
