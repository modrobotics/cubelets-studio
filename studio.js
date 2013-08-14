var util = require('util');
var events = require('events');
var cubelets = require('cubelets');
var __ = require('underscore');

var Studio = function() {
	events.EventEmitter.call(this);

	this.connection = undefined;
	this.cubelet = undefined;
	this.construction = new cubelets.Construction();
	this.programs = [];
	this.build = undefined;

	var studio = this;
	var buildService = new cubelets.BuildService();
	var infoService = new cubelets.InfoService();

	this.load = function() {
		this.programs = __(require('./programs')).reduce(function(result, value, key) {
			return result.concat({ name: key, code: value });
		}, []);
		this.emit('load');
	};

	this.createNewProgram = function(programName) {
		var program = {
			name: programName,
			code: [
				'void setup()',
				'{',
				'}',
				'',
				'void loop()',
				'{',
				'}'
			].join('\n')
		};
		this.programs.push(program);
		this.emit('newProgram', program);
	};

	this.openProgram = function(program) {
		this.emit('openProgram', program);
	};

	this.discoverConstruction = function() {
		this.construction.discover();
	};

	this.construction.on('change', function() {
		studio.emit('constructionChanged');
		studio.fetchCubeletInfo(studio.construction.all());
	});

	this.setConnection = function(connection) {
		this.connection = connection;
		this.construction.setConnection(connection);
		this.emit('connected');
	}

	this.buildProgram = function(program) {
		console.log('Building...');
		var cubelet = studio.cubelet;
		if (!cubelet) {
			console.error('No cubelet selected to build.');
			return;
		}
		buildService.requestBuild(program, cubelet);
	}

	this.flashCubelet = function() {
		console.log('Flashing...');
		var cubelet = studio.cubelet;
		if (!cubelet) {
			console.error('No cubelet selected to flash.');
			return;
		}
		var build = studio.build;
		if (!build) {
			console.error('No program compiled to build.');
			return;
		}
		var program = new cubelets.FlashProgram(build.hex);
		if (!program.valid) {
			console.error('Flash program is invalid.');
			return;
		}
		var loader = new cubelets.FlashLoader(studio.connection.serial());
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
			console.error(error);
			studio.emit('flashError', error);
		});
		loader.load(program, cubelet.id, cubelet.mcu);
	}

	buildService.on('complete', function(build) {
		studio.build = build;
		studio.emit('buildComplete', build);
	});

	buildService.on('error', function(error) {
		studio.emit('buildError', error);
	});

	buildService.on('progress', function(build, progress) {
		studio.emit('buildProgress', build, progress);
	});

	this.fetchCubeletInfo = function(cubelets) {
		infoService.fetchCubeletInfo(cubelets);
	};

	infoService.on('info', function(info, cubelet) {
		cubelet.mcu = info.mcu;
		cubelet.type = cubelets.Cubelet.typeForTypeID(info.typeID);
		cubelet.currentFirmwareVersion = parseFloat(info.currentFirmwareVersion);
		cubelet.latestFirmwareVersion = parseFloat(info.latestFirmwareVersion);
		studio.emit('cubeletChanged', cubelet);
	});

};

util.inherits(Studio, events.EventEmitter);
module.exports = Studio;