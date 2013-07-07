var SerialPort = require('serialport');

SerialPort.list(function(error, devices) {
    devices.forEach(function(device) {
        console.log(device);
    });
});
