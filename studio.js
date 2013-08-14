var _ = require('underscore');
var util = require('util');
var events = require('events');
var cubelets = require('cubelets');

var Studio = function() {
	events.EventEmitter.call(this);

	this.connection = undefined;
	this.cubelet = undefined;
	this.construction = new cubelets.Construction();
	this.programs = [];

	var studio = this;
	var buildService = new cubelets.BuildService();
	var infoService = new cubelets.InfoService();

	this.load = function() {
		this.programs = _(require('./programs')).reduce(function(result, value, key) {
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

	this.setConnection = function(connection) {
		this.connection = connection;
		this.construction.setConnection(connection);
		this.emit('connected');
	}

	this.requestBuild = function(program, cubelet) {
		buildService.requestBuild(program, cubelet);
	}

	this.construction.on('change', function() {
		studio.emit('constructionChanged');
		fetchCubeletInfo();
	});

	buildService.on('error', function(error) {
		console.log(error);
	});

	function fetchCubeletInfo() {
		
	}

};

util.inherits(Studio, events.EventEmitter);
module.exports = Studio;