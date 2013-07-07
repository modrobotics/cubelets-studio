var util = require('util');
var Response = require('../response');
var Decoder = require('../decoder');

var DebugResponse = function(data, type) {
    this.id = 0;
    this.hopcount = 0;
    this.timeout = 0;
    Response.call(this, data, type);
};

util.inherits(DebugResponse, Response);

DebugResponse.prototype.decode = function() {
    this.id = Decoder.decodeID(this.data.slice(0, 3));
    this.hopcount = this.data.readUInt8(3);
    this.timeout = this.data.readUInt8(4);
};

module.exports = DebugResponse;
