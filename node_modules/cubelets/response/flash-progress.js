var util = require('util');
var Response = require('../response');
var Decoder = require('../decoder');

var FlashProgressResponse = function(data, type) {
    this.progress = 0;
    Response.call(this, data, type);
};

util.inherits(FlashProgressResponse, Response);

FlashProgressResponse.prototype.decode = function() {
    this.progress = this.data.readUInt8(0);
};

module.exports = FlashProgressResponse;
