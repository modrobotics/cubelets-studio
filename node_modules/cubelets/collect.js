if (process.argv.length < 4) {
    console.log('Usage: node collect.js SERIALPORT OUTPUT');
    return;
}

var SerialPort = require('serialport').SerialPort;
var MessageParser = require('./parser');
var MessageType = require('./message').MessageType;
var Logger = require('./logger');

var device = process.argv[2];
var filename = process.argv[3];
var serial = new SerialPort(device, { baudrate: 38400 });
var encoding = 'ascii';

serial.on('open', function() {
    console.log('Connected.');

    // Create a parser to interpret messages.
    var parser = new MessageParser(encoding);

    // Create a logger to log messages.
    var logger = new Logger(filename);

    // Process messages
    parser.on('message', function(message) {
        logger.log(message);
    });

    // Once serial connection is open, begin listening for data.
    serial.on('data', function(data) {
        parser.parse(data);
    });

    // Write data to serial connection.
    keyboard.on('data', function(data) {
        serial.write(data);
    });
});

serial.on('close', function() {
    console.log('Goodbye.');
    process.exit(0);
});

serial.on('error', function(e) {
    console.error(e);
    process.exit(1);
});

// Take keyboard input one character at a time.
var keyboard = process.stdin;
keyboard.setEncoding(encoding);
keyboard.setRawMode(true);
keyboard.resume();
