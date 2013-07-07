var MessageParser = require('../parser');
var __ = require('underscore');

var parser;

function encode(data) {
    return new Buffer(__(data).map(function(value) {
        if (__(value).isString()) {
            return value.charCodeAt(0);
        }
        return value;
    }));
}

function p(data) {
    return parser.parse(encode(data));
}

parser = new MessageParser();
console.log('Test: <l0><n21>n|nnnnnnnnnnnnnn|nnnnnn!!|!<b|5|>bbbbb!<|X!!');
parser.on('message', function(message) {
    console.log('Message:', message);
});
parser.on('extra', function(data) {
    console.log('Extra:', data);
});
p(['<', 'l', 0, '>', '<', 'n']);
p([21, '>', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n']);
p(['n', 'n', 'n', 'n', 'n', 'n', '!']);
p(['!', '!', '<', 'b']);
p([5]);
p(['>', 'b', 'b', 'b', 'b', 'b', '!', '<']);
p(['X', '!', '!']);

parser = new MessageParser();
console.log('Test: 3c|6e153e 0059f000 54b50065 9c004ef6 00000000 00000000 00');
parser.on('message', function(message) {
    console.log('Message:', message);
});
parser.on('extra', function(data) {
    console.log('Extra:', data);
});
p([
	0x3c
]);
p([
	0x6e, 0x15, 0x3e,
    0x00, 0x59, 0xf0, 0x00,
    0x54, 0xb5, 0x00, 0x65,
    0x9c, 0x00, 0x4e, 0xf6,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00
]);