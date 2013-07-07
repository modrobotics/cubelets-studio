var Encoder = require('../encoder');
var Decoder = require('../decoder');

var id = 23636;
console.log('ID:', id);
console.log('Encoded:', Encoder.encodeID(id));
console.log('Decoded Encoded:', Decoder.decodeID(Encoder.encodeID(id)));