var util = require('util');
var net = require('net');
var Connection = require('../connection');
var ResponseParser = require('../parser');

var NetConnection = function(host, port) {

	Connection.call(this);

	host = host || 'localhost';
	port = port || 6000;

	this.name = host + ':' + port;
	this.connected = false;

	var connection = this;
	var client = undefined;
	var parser = undefined;

	this.connect = function(error, callback) {
		if (connection.connected) {
			return;
		}

		parser = new ResponseParser();

		parser.on('response', function(response) {
			connection.emit('response', response);
		});

		client = net.connect({
			host: host,
			port: port
		}, function() {
			connection.connected = true;
			if (callback) callback();
			connection.emit('open');
		});

		client.on('data', function(data) {
			parser.parse(data);
		});

		client.on('error', function(e) {
			console.error(e);
			if (error) error(e);
			connection.emit('error', e);
		});

		client.on('close', function() {
			connection.connected = false;
			connection.emit('close');
			parser.removeAllEventListeners('response');
		});
	};

	this.disconnect = function() {
		if (!connection.connected) {
			return;
		}
		connection.connected = false;
		client.end();
	};

	this.postCommand = function(command) {
		connection.write(command.encode());
	};

	this.write = function(data) {
		if (!connection.connected) {
			return;
		}
		client.write(data);
	};

	this.stream = function() {
		return client;
	}

}

util.inherits(NetConnection, Connection);
module.exports = NetConnection;