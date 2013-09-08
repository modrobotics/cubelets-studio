var SerialPort = require('serialport').SerialPort;
var i = process.stdin;
var o = process.stdout;
i.setRawMode(true);
i.resume();
var serial = new SerialPort('/dev/cu.Cubelet-D463-SPP');
serial.pipe(o);
i.on('data', function(data) {
	serial.write(data);
});