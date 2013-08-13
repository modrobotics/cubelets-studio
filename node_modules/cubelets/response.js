var Message = require('./message');
var util = require('util');
var fs = require('fs');
var Hash = require('hashish');
var ResponseTypes = require('./config.json')['responses'];

var Response = function(data, type) {
	Message.call(this);
	this.data = data;
	this.type = type;
	this.decode();
};

util.inherits(Response, Message);

Response.prototype.decode = function() {
    // Override
};

module.exports = Response;

module.exports.create = function(data, type) {
    if (!type) {
        // Undefined type
        return new Response(data);
    }

    var decoder = type.decoder;
    if (!decoder) {
        // Response does not need to be decoded
        return new Response(data, type);
    }

    var path = __dirname + '/response/' + decoder + '.js';
    if (!fs.existsSync(path)) {
        // Missing decoder definition
        console.log('Missing:', path);
        return new Response(data, type);
    }

    return new (require(path))(data, type);
};

module.exports.decodeType = function(code) {
    return Hash(ResponseTypes).detect(function(type) {
        return type.code === code;
    });
};