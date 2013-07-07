var util = require('util');
var Message = require('./message');

var Command = function() {
	Message.call(this);
};

util.inherits(Command, Message);

Command.prototype.encode = function() {
	return new Buffer(0);
};

module.exports = Command;