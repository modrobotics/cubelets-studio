var util = require('util');
var SerialPort = require('serialport').SerialPort;
var Connection = require('../connection');
var ResponseParser = require('../parser');

var SerialConnection = function(path) {
	
	Connection.call(this);

	this.name = path;
	this.connected = false;

	var connection = this;
	var serial = undefined;
	var parser = undefined;

	this.connect = function(error, callback) {
		if (connection.connected) {
			return;
		}

		parser = new ResponseParser();

		parser.on('response', function(response) {
			connection.emit('response', response);
		});

		parser.on('extra', function(data) {
			connection.emit('extra', data);
		});

		serial = new SerialPort(path);

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
			parser.removeAllListeners('extra');
		});
	};

	this.disconnect = function() {
		if (!connection.connected) {
			return;
		}
		connection.connected = false;
		serial.close();
	}

	this.postCommand = function(command) {
		connection.write(command.encode());
	};

	this.write = function(data) {
		if (!connection.connected) {
			return;
		}
		serial.write(data);
	};

	this.stream = function() {
		return serial;
	};
};

util.inherits(SerialConnection, Connection);
module.exports = SerialConnection;