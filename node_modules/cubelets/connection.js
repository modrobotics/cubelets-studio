var events = require('events');
var util = require('util');
var SerialPort = require('serialport').SerialPort;
var ResponseParser = require('./parser');

var Connection = function(device) {
	events.EventEmitter.call(this);

	this.device = device;
	this.connected = false;

	var connection = this;
	var serial = undefined;
	var parser = undefined;

	this.connect = function(error, callback) {
		if (this.connected) {
			return;
		}

		parser = new ResponseParser();

		parser.on('response', function(response) {
			connection.emit('response', response);
		});

		parser.on('extra', function(data) {
			connection.emit('Extra', data);
		});

		serial = new SerialPort(device);

		serial.on('open', function() {
			connection.connected = true;
			if (callback) callback();
			connection.emit('open');
		});

		serial.on('data', function(data) {
			parser.parse(data);
		});

		serial.on('error', function(e) {
			console.error(e);
			if (error) error(e);
			connection.emit('error', e);
		});

		serial.on('close', function() {
			connection.connected = false;
			connection.emit('close');
			parser.removeAllListeners('response');
		});
	};

	this.disconnect = function() {
		if (!this.connected) {
			return;
		}
		connection.connected = false;
		serial.close();
	}

	this.postCommand = function(command) {
		this.write(command.encode());
	};

	this.write = function(data) {
		if (!this.connected) {
			return;
		}
		serial.write(data);
	};

	this.serial = function() {
		return serial;
	};
};

util.inherits(Connection, events.EventEmitter);
module.exports = Connection;