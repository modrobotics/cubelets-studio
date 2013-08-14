var fs = require('fs');
var FlashProgram = require('../program');
var data = fs.readFileSync('../hex/drive.hex');
var program = new FlashProgram(data);
console.log(program);
console.log(program.data.length);

var count = 0;
var lines = data.toString('ascii').split(/\r?\n/);
for (var i = 0; i < lines.length; ++i) {
	var line = lines[i];
	var h = '' + line.charAt(1) + '' + line.charAt(2) + '';
	var b = parseInt(h, 16);
	b = b & 0xFF;
	count += b;
}
console.log(count);
console.log(program.size);