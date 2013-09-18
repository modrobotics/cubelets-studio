var Types = require('./config.json')['types'];
var __ = require('underscore');

var Cubelet = function(id, type, mcu) {

	this.id = id;
	this.type = type || Types.UNKNOWN;
	this.mcu = mcu || undefined;
	this.currentFirmwareVersion = 0.0;
	this.latestFirmwareVersion = 0.0;

	this.hasFirmwareUpgrade = function() {
		return this.latestFirmwareVersion > this.currentFirmwareVersion;
	};

};

module.exports = Cubelet;

module.exports.typeForTypeID = function(typeID) {
	return __(Types).find(function(type) {
		return type.id == typeID;
	}) || Types.UNKNOWN;
};