var util = require('util');
var events = require('events');

var Connection = function() {

	events.EventEmitter.call(this);

	this.name = null;
	this.connected = false;

	this.connect = function(error, callback) {
		if (this.connected) {
			return;
		}
		this.connected = true;
	};

	this.disconnect = function() {
		if (!this.connected) {
			return;
		}
		this.connected = false;
	}

	this.postCommand = function(command) {
		this.write(command.encode());
	};

	this.write = function(data) {
		if (!this.connected) {
			return;
		}
		console.log(data);
	};

	this.stream = function() {
		return undefined;
	};
};

util.inherits(Connection, events.EventEmitter);
module.exports = Connection;