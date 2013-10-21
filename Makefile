# Node-WebKit
NW_VERSION="0.7.2"
NW_PATH="/opt/node-webkit/$(VERSION)"

# Node package manager
NPM_PATH="/usr/local/share/npm"

# Binaries
NW="$(NW_PATH)/node-webkit.app/Contents/MacOS/node-webkit"
GYP="$(NPM_PATH)/bin/nw-gyp"

build:build-osx build-windows build-linux

build-osx:build-submodules build-serialport build-zip
	cp -R platform/osx/Cubelets\ Studio.app build
	mv build/app.nw build/Cubelets\ Studio.app/Contents/Resources/app.nw

build-linux:build-submodules build-serialport build-zip
	cat $(NW) build/app.nw > build/cubelets-studio && chmod +x build/cubelets-studio
	rm build/app.nw

build-windows:build-submodules build-serialport build-zip
	copy /b $(NW)+build/app.nw build/Cubelets\ Studio.exe
	rm build/app.nw

build-submodules:
	git submodule init
	git submodule update
	npm install

build-serialport:
	cd node_modules/cubelets/node_modules/serialport;\
	$(GYP) clean;\
	$(GYP) configure --target=$(NW_VERSION);\
	$(GYP) build

build-zip:
	mkdir -p build
	node ./tools/set-app-name "Cubelets Studio" # proper formatting in node-webkit
	zip -r build/app.nw * -x@exclude.list
	node ./tools/set-app-name "cubelets-studio" # restore npm compatibility

clean:
	rm -rf build/*
