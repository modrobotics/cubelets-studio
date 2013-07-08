var _ = require('underscore');
var util = require('util');
var events = require('events');
var cubelets = require('cubelets');

var Studio = function() {
	events.EventEmitter.call(this);

	this.connection = undefined;
	this.construction = undefined;
	this.cubelet = undefined;
	this.programs = [];

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
		this.construction = new cubelets.Construction();
		this.cubelet = this.construction.origin;
		this.emit('constructionChanged');
	}

};

util.inherits(Studio, events.EventEmitter);
module.exports = Studio;