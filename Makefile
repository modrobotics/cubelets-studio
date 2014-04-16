REPORTER = spec

default:
	echo "Did you mean test, build or clean?"

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER)

build:build-osx build-windows build-linux

build-osx:
	./build.sh

build-linux:
	./build.sh

build-windows:
	build.bat

clean:
	rm -rf build/*

.PHONY: build-osx build-linux build-windows clean test
