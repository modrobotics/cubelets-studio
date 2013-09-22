// Reads in a Buffer with Intel HEX data format
var FlashProgram = function(data) {

  this.valid = false;
  this.checksum = { sum: 0, xor: 0 };
  this.lineCount = 0;

  var program = this;

  // Decode data
  this.data = (function() {
    var result = [];

    // Split on CR or CR+NL
    program.lines = data.toString('ascii').split(/\r?\n/);

    // Set a line count
    program.lineCount = program.lines.length;

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

    program.lines.forEach(function(line) {
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

  this.getPages = function() {
    var pages = [];
    var maxAddress = 0x3800;
    var pageSize = program.pageSize;
    var page = [];
    var i = 0;
    var data = program.data;
    function checksum(bytes) {
      return bytes.reduce(function(cs, b) {
        cs.sum += b;
        cs.xor ^= b;
        return cs;
      }, {
        sum: 0,
        xor: 0
      });
    }
    // Page format
    // a0|a1|ck0|ck1|d...
    function initPage(a0, a1, ln) {
      var a = (a0 << 8) + a1;
      if (a + ln > maxAddress) {
        return false;
      }
      page.push(a0, a1);
      return true;
    }
    function padPage() {
      while (page.length < pageSize + 2) {
        page.push(0xFF);
      }
    }
    function fillPage(data) {
      for (var b = 0; b < data.length; ++b) {
        page.push(data.readUInt8(b));
      }
    }
    function writePage() {
      var ck = checksum(page);
      page.splice(2, 0, ck.sum, ck.xor);
      pages.push(new Buffer(page));
      page = [];
    }
    // Intel HEX format
    // :|ln|a0|a1|rc|d...|ck|\r|\n
    while (i < data.length) {
      var ln = data.readUInt8(i + 1);
      var a0 = data.readUInt8(i + 2);
      var a1 = data.readUInt8(i + 3);
      var rc = data.readUInt8(i + 4);
      if (rc === 0x0) { // Data
        if (page.length === 0) {
          if (!initPage(a0, a1, ln)) {
            console.error('Program page invalid: memory address exceeds boundary.',
              (a + ln));
            break;
          }
        }
        fillPage(data.slice(i + 5, i + 5 + ln));
        if (page.length >= pageSize) {
          writePage();
        }
      }
      if (rc === 0x1) { // EOF
        if (page.length === 0) {
          break;
        }
        padPage();
        writePage();
      }
      i += (1 + 1 + 2 + 1 + ln + 1 + 2); // Next line
    }
    return pages;
  };

  this.rewind = function() {
    position = 0;
    this.checksum.xor = 0;
    this.checksum.sum = 0;
  };

};

module.exports = FlashProgram;