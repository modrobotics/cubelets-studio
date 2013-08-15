// Reads in a Buffer with Intel HEX data format
var FlashProgram = function(data) {

    this.valid = false;
    this.checksum = { sum: 0, xor: 0 };
    this.lines = 0;

    var program = this;

    // Decode data
    this.data = (function() {
        var result = [];

        // Split on CR or CR+NL
        var lines = data.toString('ascii').split(/\r?\n/);

        // Set a line count
        program.lines = lines.length;

        // Initialize program size
        program.size = 0;

        // Generously assume program is valid...
        program.valid = true;

        // Reads a byte in the result, and updates the checksum
        function putByte(value) {
            result.push(value);
            program.checksum.xor ^= value;
            program.checksum.sum += value;
        };

        lines.forEach(function(line) {
            if (line.length == 0) {
                // Skip empty lines
                return;
            }

            // Read leading semicolon
            var semicolon = line.charAt(0);
            if (semicolon != ':') {
                program.valid = false;
                console.log('Program invalid: line has no leading semicolon');
                return;
            }
            putByte(semicolon.charCodeAt(0));

            // Read hex digits
            var digits = line.length - 1;
            if (digits % 2 != 0) {
                // Should have an even number of hex digits
                program.valid = false;
                console.log('Program invalid: line should have an even number of hex digits');
                return;
            }

            // Add to size based on line header
            program.size += parseInt(line[1] + line[2], 16);

            // Parse through program
            for (var i = 1; i <= digits; i += 2) {
                // Read in two hex digits at a time
                var hex = line[i] + line[i + 1];
                var value = parseInt(hex, 16) & 0xFF;
                if (isNaN(value)) {
                    // Invalid hex format
                    program.valid = false;
                    console.log('Program invalid: could not parse value', hex);
                    return;
                }
                putByte(value);
            }

            // Put CR+NL
            putByte(0x0D);
            putByte(0x0A);
        });
        return new Buffer(result);
    })();

    // Calculate page information
    this.pageSize = 128;
    this.lastPageSize = this.size % this.pageSize;
    this.pageCount = (this.lastPageSize === 0) ?
        Math.floor(this.size / this.pageSize) :
        Math.floor(this.size / this.pageSize) + 1;

    var position = 0;

    this.hasDataAvailable = function() {
        return this.valid && position < this.data.length;
    };

    this.readData = function(size) {
        if (!this.hasDataAvailable()) {
            return null;
        }
        var bytesRemaining = this.data.length - position;
        var bytesToRead = Math.min(size, bytesRemaining);
        var result = this.data.slice(position, position + bytesToRead);
        for (var i = 0; i < bytesToRead; ++i) {
            var b = result.readUInt8(i);
            this.checksum.xor ^= b;
            this.checksum.sum += b;
        }
        position += bytesToRead;
        return result;
    };

    this.rewind = function() {
        position = 0;
        this.checksum.xor = 0;
        this.checksum.sum = 0;
    };

};

module.exports = FlashProgram;