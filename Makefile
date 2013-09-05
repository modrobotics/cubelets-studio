NW="/opt/node-webkit/node-webkit.app/Contents/MacOS/node-webkit"

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

zip:
	zip -r build/app.nw * -x@exclude.list

clean:
	rm -rf build/*
