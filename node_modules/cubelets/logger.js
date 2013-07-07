var fs = require('fs');

var Logger = function(filename) {
    var on = false;
    var messages = [];
    this.log = function(message) {
        if (message.type.code === 'l') {
            on = !on; // Toggle
            if (on) {
                console.log('Log is on.');
            } else {
                write(), clear();
            }
        }
        if (message.type.code === 'D') {
            console.log(message);
            messages.push(message);
        }
    };
    function write() {
        fs.writeFileSync(filename, JSON.stringify(messages));
        console.log('Wrote log to', filename);
    }
    function clear() {
        messages = [];
    }
};

module.exports = Logger;
