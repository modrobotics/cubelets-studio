var util = require('util');
var SerialPort = require('serialport');

module.exports.list = function(callback) {
	SerialPort.list(function(error, devices) {
		if (error) {
			callback(error, devices);
			return;
		}
		var cubelets = [];
		devices.forEach(function(device) {
			if (device.comName && device.comName.indexOf('Cubelet') != -1) {
				cubelets.push(device);
			}
		});
		callback(null, cubelets);
	});
};

module.exports.Cubelet = require('./cubelet');
module.exports.Connection = require('./connection');
module.exports.SerialConnection = require('./connection/serial');
module.exports.NetConnection = require('./connection/net');
module.exports.Construction = require('./construction');
module.exports.Types = require('./config.json')['types'];
module.exports.Responses = require('./config.json')['responses'];
module.exports.BuildService = require('./service/build');
module.exports.InfoService = require('./service/info');
module.exports.FirmwareService = require('./service/firmware');
module.exports.FlashProgram = require('./program');
module.exports.FlashLoader = require('./loader');