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

	this.mockConstruction = function() {
		var Types = cubelets.Types;
		var Node = function(id, type) {
			this.id = id;
			this.type = type;
		};
		this.construction.mock(new Node('12345', Types.BLUETOOTH), [
			new Node('82334', Types.DRIVE),
			new Node('83823', Types.INVERSE),
			new Node('39021', Types.KNOB),
			new Node('38281', Types.MAXIMUM),
			new Node('93849', Types.SPEAKER),
			new Node('38492', Types.ROTATE)
		],[
			new Node('34141', Types.PASSIVE),
			new Node('67362', Types.DRIVE),
			new Node('77381', Types.MINIMUM),
			new Node('11091', Types.FLASHLIGHT)
		]);
		this.cubelet = this.construction.origin;
		this.emit('constructionChanged');
	}

	this.discoverConstruction = function() {
		this.construction.discover();
	}

	this.setConnection = function(connection) {
		this.connection = connection;
		this.construction.setConnection(connection);
		this.emit('connected');
	}

	this.requestBuild = function(program, cubelet) {
		buildService.requestBuild(program, cubelet);
	}

	this.construction.on('discover', function() {
		studio.emit('constructionChanged');
	});

	buildService.on('error', function(error) {
		console.log(error);
	});

};

util.inherits(Studio, events.EventEmitter);
module.exports = Studio;