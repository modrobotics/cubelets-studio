var argv = process.argv;
if (argv.length < 3) {
    console.log('Usage: node server.js SERIALPORT [PORT]');
    return;
}

var device = argv[2];
var port = argv.length > 3 ? argv[3] : 6000;

var SerialPort = require('serialport').SerialPort;
var serial = new SerialPort(device);
var net = require('net');

var server = (function() {
    return net.createServer(function(stream) {
        serial.pipe(stream);
        stream.pipe(serial);
    });
})();

serial.on('open', function() {
    server.listen(port, function() {
        console.log('Server listening on port', port);
    });
});

serial.on('close', function() {
    server.close(function() {
        console.log('Server stopped.');
    });
});
