if (process.argv.length < 5) {
    console.log('Usage: node flash.js SERIALPORT FILENAME ID MODE');
    return;
}

var fs = require('fs');
var SerialPort = require('serialport').SerialPort;
var FlashProgram = require('./program');
var FlashLoader = require('./loader');

var device = process.argv[2];
var filename = process.argv[3];
var id = process.argv[4];
var mode = process.argv[5];

if (!fs.existsSync(filename)) {
    console.log("File '" + filename + "' does not exist.");
    return;
}

var serial = new SerialPort(device, { baudrate: 38400 });
var encoding = 'ascii';

serial.on('open', function() {
    // Create a flash loader to load the image
    var loader = new FlashLoader(serial, encoding);

    // Create a meter
    var meter = require('multimeter')(process);
    meter.write('Connected.\n');

    // Use the meter to measure progress
    function measure(label, x, y, event) {
        var pad = require('pad');
        meter.write(pad(x - 2, label) + '\n');
        var bar = meter(x, y, {
            width: 20
        });
        loader.on(event, function(progress) {
            bar.percent(progress.percent);
        })
    }

    // Measure upload progress
    measure('Upload:', 10, -2, 'upload');

    // Measure flash progress
    measure('Flash:', 10, -1, 'flash');

    // Handle an error
    loader.on('error', function(e) {
        console.error(e);
        serial.close();
    });

    // Handle successful flash
    loader.on('success', function() {
        console.log('Successfully loaded flash program!');
        serial.close();
    });

    // Load the program
    var data = fs.readFileSync(filename);
    var program = new FlashProgram(data);
    loader.load(program, id, mode);
});

serial.on('close', function() {
    console.log('Goodbye.');
    process.exit(0);
});

serial.on('error', function(e) {
    console.log(e);
    process.exit(1);
});