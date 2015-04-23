var util = require('util');
var fs = require('fs');
var path = require('path');
var events = require('events');
var cubelets = require('cubelets');
var __ = require('underscore');

var Studio = function() {
	events.EventEmitter.call(this);

	var connection = null;
	var cubelet = null;
	var construction = null;
	var programs = [];
	var build = null;

	var studio = this;
	var compileService = new cubelets.CompileService();
	var infoService = new cubelets.InfoService();
	var firmwareService = new cubelets.FirmwareService();
	var resetBluetoothCubeletCommand = new cubelets.ResetBluetoothCubeletCommand();
	
	var ua = require('universal-analytics');
	var visitor = ua('UA-1956519-6');
	visitor.pageview("/").send();

	this.load = function() {
		studio.emit('load');
	};

	this.loadPrograms = function(p) {
		if (!p) {
			var glob = require('glob');
			var found = [];
			glob("programs/*.c", {
				sync: true
			}, function(error, files) {
				if (!error) __(files).each(function(file) {
					var code = fs.readFileSync(file, 'utf8');
					if (code) {
						found.push({
							name: path.basename(file),
							code: code,
							file: file
						});
					}
				});
				studio.loadPrograms(found);
			});
			return;
		}
		programs = p || [];
		studio.emit('programsLoaded');
	};

	this.getPrograms = function() {
		return programs;
	};

	this.openProgramFile = function(file) {
		if (fs.existsSync(file)) {
			var code = fs.readFileSync(file, 'utf8');
			if (code) {
				var programName = path.basename(file);
				studio.createNewProgram(programName, code, file);
			}
		}
	};

	this.openHexFile = function(file) {
		if (fs.existsSync(file)) {
			var hex = fs.readFileSync(file, 'ascii');
			if (hex) {
				build = { hex: hex };
			}
		}
	};

	var autoProgramName = 1;

	this.createNewProgram = function(programName, code, file) {
		programName = (programName) || ('Program' + (autoProgramName++) + '.c');
		code = code || [
			'void setup()',
			'{',
			'}',
			'',
			'void loop()',
			'{',
			'}'
		].join('\n');
		studio.emit('programCreated', {
			name: programName,
			code: code,
			file: file,
			dirty: (file === null)
		});
	};
	
	this.openDefaultProgram = function(type)
	{
	    var programPath = "default_programs/"+type.name+".c";
	    if (fs.existsSync(programPath)) {
	       var code = fs.readFileSync(programPath, 'utf8');
            if (code) {
                var programName = path.basename(programPath);
                studio.createNewProgram(programName, code, null);
            }
	    }
	};

	this.openProgram = function(program) {
		if (!__(programs).contains(program)) {
			programs.push(program);
		}
		studio.emit('programOpened', program);
	};

	this.saveProgram = function(program, session, callback) {
		if (!program.file) {
			studio.emit('programHasNoFile', program, session, callback);
			return;
		}
		program.code = session.getValue();
		fs.writeFileSync(program.file, program.code);
		program.dirty = false;
		program.name = path.basename(program.file);
		studio.emit('programSaved', program);
		if (callback) callback(program);
	};

	this.closeProgram = function(program, callback) {
		program.dirty = false;
		var index = programs.indexOf(program);
		if (index >= 0) {
			programs.splice(index, 1);
			studio.emit('programClosed', program);
		}
	};

	this.getConstruction = function() {
		return construction;
	};

	this.discoverConstruction = function() {
		studio.emit('cubeletsNearbyDiscoveryStarted');
		construction.discover();
	};

	function onConstructionChange() {
		studio.emit('constructionChanged', construction);
		studio.fetchCubeletInfo(construction.all());
	}

	function onConstructionError(err) {
		studio.emit('error', new Error('A connection error occurred.'));
		console.error(err);
	}

	this.disconnect = function() {
		studio.connect(null);
	};

	this.connect = function(c, name) {
		if (c === connection) {
			return;
		}
		if (connection) {
			connection.removeListener('close', onConnectionClose);
			connection.removeListener('error', onConnectionError);
		}
		if (construction) {
			construction.removeListener('change', onConstructionChange);
			construction.removeListener('error', onConstructionChange);
		}
		connection = c;
		if (connection) {
			construction = new cubelets.Construction(connection);
			connection.on('close', onConnectionClose);
			connection.on('error', onConnectionError);
			construction.on('change', onConstructionChange);
			construction.on('error', onConstructionError);
			construction.connect(function(err) {
				studio.emit('deviceConnected', connection, name);
				studio.discoverConstruction();
			});
		}
		else {
			construction = null;
		}
	};

	this.getConnection = function() {
		return connection;
	};

	this.hasConnection = function() {
		return connection && connection.isOpen();
	};

	function onConnectionClose() {
		studio.emit('deviceDisconnected');
	}

	function onConnectionError(err) {
		studio.emit('error', new Error('A connection error occurred.'));
		console.error(err);
	}

	this.buildProgram = function(program) {
		if (!cubelet) {
			studio.emit('error', new Error('No cubelet selected to build.'));
			return;
		}
		compileService.requestBuild(program, cubelet);
	};

	this.hasBuild = function() {
		return (build !== null);
	};

	this.getCubelet = function() {
		return cubelet;
	};

	this.selectCubelet = function(c) {
		if (!c) {
			return;
		}
		cubelet = c;
		studio.emit('cubeletSelected', c);
	};

	this.flashCubelet = function() {
		if (!cubelet) {
			studio.emit('error', new Error('No cubelet selected to flash.'));
			return;
		}
		if (!cubelet.mcu) {
			studio.emit('error', new Error('Cannot flash cubelet. No MCU type defined.'));
			return;
		}
		if (!build) {
			studio.emit('error', new Error('No program compiled to build.'));
			return;
		}
		if (!build.hex) {
			studio.emit('error', new Error('Build has not completed.'));
			return;
		}
		var program = new cubelets.FlashProgram(build.hex);
		if (!program.valid) {
			console.error(build.hex);
			studio.emit('error', new Error('Flash program is invalid.'));
			return;
		}
		if (!connection) {
			studio.emit('error', new Error('No Cubelet connection available.'));
			return;
		}
		var loader = new cubelets.FlashLoader(construction.origin(), connection.getStream());
		loader.on('upload', function(p) {
			studio.emit('flashProgress', {
				action: 'upload',
				percent: p.percent
			});
		});
		loader.on('flash', function(p) {
			studio.emit('flashProgress', {
				action: 'flash',
				percent: p.percent
			});
		});
		loader.on('success', function() {
			studio.emit('flashComplete');
		});
		loader.on('error', function(error) {
			console.error('Flash Error', error);
			studio.emit('flashError', error);
		});
		loader.load(program, cubelet);
	};

	compileService.on('complete', function(result) {
		build = result;
		studio.emit('buildComplete');
	});

	compileService.on('failed', function(error) {
		studio.emit('buildFailed', error);
	});

	compileService.on('compileError', function(result) {
		studio.emit('buildError', result);
	});

	compileService.on('compileWarning', function(result) {
		studio.emit('buildWarning', result);
	});

	this.fetchCubeletInfo = function(cubelets) {
		infoService.fetchCubeletInfo(cubelets);
	};

	infoService.on('info', function(info, c) {
		c.mcu = info.mcu;
		c.type = cubelets.Cubelet.typeForTypeID(info.typeID);
		c.currentFirmwareVersion = parseFloat(info.currentFirmwareVersion);
		c.latestFirmwareVersion = parseFloat(info.latestFirmwareVersion);
		// XXX: Exceptional case where a Bluetooth is misidentified
		if (c.id === construction.origin().id && c.type !== cubelets.Types.BLUETOOTH) {
			c.mcu = cubelets.FlashLoader.Targets.AVR;
			c.type = cubelets.Types.BLUETOOTH;
			c.currentFirmwareVersion = 0.0;
			c.latestFirmwareVersion = 3.1;
		}
		studio.emit('cubeletChanged', c);
	});

	infoService.on('error', function(error) {
		studio.emit('serviceError', error);
	});

	this.upgradeCubelet = function(version) {
		if (!cubelet) {
			studio.emit('error', new Error('No cubelet selected to upgrade.'));
			return;
		}
		if (!version) {
			studio.emit('error', new Error('Cannot upgrade cubelet. No version specified.'));
			return;
		}
		if (!cubelet.mcu) {
			studio.emit('error', new Error('Cannot upgrade cubelet. No MCU type defined.'));
			return;
		}
		if (!cubelet.type || cubelet.type === cubelets.Types.UNKNOWN) {
			studio.emit('error', new Error('Cannot upgrade cubelet. Unknown type.'));
			return;
		}
		firmwareService.downloadVersion(cubelet, version);
	};

	this.restoreCubelet = function() {
		if (!cubelet) {
			studio.emit('error', new Error('No cubelet selected to restore.'));
			return;
		}
		if (!cubelet.latestFirmwareVersion) {
			studio.emit('error', new Error('Cannot restore cubelet. No firmware version defined.'));
			return;
		}
		if (!cubelet.mcu) {
			studio.emit('error', new Error('Cannot restore cubelet. No MCU type defined.'));
			return;
		}
		if (!cubelet.type || cubelet.type === cubelets.Types.UNKNOWN) {
			studio.emit('error', new Error('Cannot restore cubelet. Unknown type.'));
			return;
		}
		this.upgradeCubelet(cubelet.latestFirmwareVersion);
	};
	
	this.resetBluetoothCubelet = function() {
	    connection.postCommand(resetBluetoothCubeletCommand);
	};

	firmwareService.on('error', function(error) {
		studio.emit('firmwareError', error);
	});

	firmwareService.on('download', function(cubelet, version, hex) {
		var program = new cubelets.FlashProgram(hex);
		if (!program.valid) {
			studio.emit('error', new Error('Flash program is invalid.'));
			return;
		}
		if (!connection) {
			studio.emit('error', new Error('No cubelet connection available.'));
			return;
		}
		var loader = new cubelets.FlashLoader(construction.origin(), connection.getStream());
		loader.on('upload', function(p) {
			studio.emit('flashProgress', {
				action: 'upload',
				percent: p.percent
			});
		});
		loader.on('flash', function(p) {
			studio.emit('flashProgress', {
				action: 'flash',
				percent: p.percent
			});
		});
		loader.on('success', function() {
			studio.emit('firmwareComplete', cubelet, version);
			cubelet.currentFirmwareVersion = version;
			studio.emit('cubeletChanged', cubelet);
			firmwareService.updateVersion(cubelet, version);
		});
		loader.on('error', function(error) {
			studio.emit('firmwareError', error);
		});
		loader.load(program, cubelet);
	});

	firmwareService.on('update', function(cubelet, version) {
		cubelet.currentFirmwareVersion = version;
		studio.emit('cubeletChanged', cubelet);
	});

};

util.inherits(Studio, events.EventEmitter);
module.exports = Studio;
