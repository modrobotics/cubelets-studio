var util = require('util');
var Response = require('../response');
var Decoder = require('../decoder');

var MapResponse = function(data, type) {
    this.map = [];
    Response.call(this, data, type);
};

util.inherits(MapResponse, Response);

MapResponse.prototype.decode = function() {
    this.map = Decoder.decodeMap(this.data);
};

module.exports = MapResponse;
