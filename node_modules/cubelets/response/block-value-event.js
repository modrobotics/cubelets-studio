var util = require('util');
var Response = require('../response');
var Decoder = require('../decoder');

var BlockValueEventResponse = function(data, type) {
    this.id = 0;
    this.value = 0;
    Response.call(this, data, type);
};

util.inherits(BlockValueEventResponse, Response);

BlockValueEventResponse.prototype.decode = function() {
    this.id = Decoder.decodeID(this.data.slice(0, 3));
    this.value = this.data.readUInt8(3);
};

module.exports = BlockValueEventResponse;
