var argv = process.argv;
if (argv.length < 2) {
    console.log('Usage: node client.js [PORT]');
    return;
}

var port = argv.length > 2 ? argv[2] : 6000;
var net = require('net');

var client = net.connect(port, function() {
	console.log('Connecting to port', port);
});

process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.pipe(client);
client.pipe(process.stdout);