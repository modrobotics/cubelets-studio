NW="/opt/node-webkit/node-webkit.app/Contents/MacOS/node-webkit"

web: nw
	$(NW) cubelets-studio.nw

nw: clean
	zip -r cubelets-studio.nw .

clean:
	rm -rf cubelets-studio.nw
	rm -rf cubelets-studio.app
