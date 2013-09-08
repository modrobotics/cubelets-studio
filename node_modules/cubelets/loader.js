var events = require('events');
var util = require('util');
var async = require('async');
var Hash = require('hashish');
var ResponseParser = require('./parser');
var ResponseTypes = require('./config.json')['responses'];
var Encoder = require('./encoder');
var Decoder = require('./decoder');

var FlashLoader = function(stream, encoding) {
    
    events.EventEmitter.call(this);

    var Mode = {
        PIC:'pic',
        AVR:'avr'
    };

    // Create a new response parser
    var parser = new ResponseParser(encoding);

    // Begin parsing responses
    stream.on('data', function(data) {
        parser.parse(data);
    });

    var emitter = this;

    this.load = function(program, id, mode) {
        // Ensure program is valid
        if (!program.valid) {
            emitter.emit('error', new Error('Invalid program.'));
            return;
        }

        // Check that id is valid
        if (!id) {
            emitter.emit('error', new Error('Invalid ID.'));
            return;
        }

        // Disallow invalid flash modes
        if (!Hash(Mode).detect(function(value) { return value === mode })) {
            emitter.emit('error', new Error('Invalid flash mode.'));
            return;
        }

        // Waits for a given response
        function waitFor(code, timeout) {
            return function(callback) {
                // Listen to raw data from parser
                parser.setRawMode(true);
                parser.on('raw', listen);

                // Set a timeout for receiving the data
                var timer = setTimeout(function() {
                    parser.removeListener('raw', listen);
                    callback(new Error("Timed out waiting for '" + code + "'."));
                }, timeout);

                function listen(data) {
                    // Check first byte of raw data
                    if (data.readUInt8(0) === code.charCodeAt(0)) {
                        parser.removeListener('raw', listen);
                        clearTimeout(timer);
                        callback(null);
                    }
                }
            };
        }

        // Waits for a given interval
        function wait(interval) {
            return function(callback) {
                setTimeout(function() {
                    callback(null);
                }, interval);
            };
        }

        // Waits for flashing to complete
        function waitForFlash(timeout) {
            return function(callback) {
                // Listen to response from parser
                parser.setRawMode(false);
                parser.on('response', listen);

                // Timeout expiration handler
                function expire() {
                    parser.removeListener('response', listen);
                    callback(new Error("Timed out waiting for flash to complete."));
                }

                // Set a timeout for receiving response
                var timer = setTimeout(expire, timeout);

                function listen(response) {
                    switch (response.type.code) {
                        case ResponseTypes['FLASH_PROGRESS'].code:
                            clearTimeout(timer);
                            emitProgress('flash', {
                                progress: 20 * response.progress,
                                total: program.lines
                            });
                            timer = setTimeout(expire, timeout);
                            break;
                        case ResponseTypes['FLASH_COMPLETE'].code:
                            parser.removeListener('response', listen);
                            clearTimeout(timer);
                            emitProgress('flash', {
                                total: program.lines
                            });
                            callback(null);
                            break;
                    }
                }
            };
        }

        // Emits a progress message
        function emitProgress(status, e) {
            e.progress = e.progress || e.total;
            e.percent = parseInt(100.0 * ((e.total > 0) ? (e.progress / e.total) : 0.5));
            emitter.emit(status, e);
        }

        function sendReadyCommand(callback) {
            stream.write(new Buffer([
                '3'.charCodeAt(0)
            ]), callback);
        }

        function sendChecksumData(callback) {
            stream.write(new Buffer([
                '8'.charCodeAt(0),
                program.checksum.xor,
                program.checksum.sum
            ]), callback);
        }

        function sendProgramData(callback) {
            // Send each chunk in a series
            var chunks = [];
            var chunkSize = 200;
            var chunkInterval = 80;
            var progress = 0;
            function addChunk() {
                var data = program.readData(chunkSize);
                if (data) {
                    chunks.push(function(callback) {
                        emitProgress('upload', {
                            progress: progress += data.length,
                            total: program.data.length
                        });
                        stream.write(data, callback);
                    }, wait(chunkInterval));
                }
                return data;
            }
            while (addChunk());
            async.series(chunks, callback);
        }

        function send(data) {
            return function(callback) {
                stream.write(data, callback);
            }
        }

        function sendFlashCommand(callback) {
            switch (mode) {
                case Mode.AVR:
                    var encodedID = Encoder.encodeID(id);
                    async.series([
                        send(new Buffer([
                            'W'.charCodeAt(0),
                            encodedID.readUInt8(0),
                            encodedID.readUInt8(1),
                            encodedID.readUInt8(2)
                        ])),
                        waitFor('R', 30000),
                        send(new Buffer([
                            'M'.charCodeAt(0),
                            encodedID.readUInt8(0),
                            encodedID.readUInt8(1),
                            encodedID.readUInt8(2),
                            program.pageCount,
                            program.lastPageSize
                        ]))
                    ], callback);
                    break;
                case Mode.PIC:
                    var encodedID = Encoder.encodeID(id);
                    stream.write(new Buffer([
                        'L'.charCodeAt(0),
                        encodedID.readUInt8(0),
                        encodedID.readUInt8(1),
                        encodedID.readUInt8(2)
                    ]), callback);
                    break;
            }
        }

        function sendResetCommand(callback) {
            async.series([
                wait(1000),
                send('`'),
                wait(1000),
                send('1')
            ], callback);
        }

        // Set parser to raw mode
        parser.setRawMode(true);

        // Begin flash loading sequence
        async.series([
            sendReadyCommand,
            waitFor('4', 30000),
            sendChecksumData,
            waitFor('R', 30000),
            sendProgramData,
            waitFor('Y', 30000),
            sendFlashCommand,
            waitForFlash(30000),
            sendResetCommand,
            waitFor('Z', 30000)
        ], function(error) {
            // Leave raw mode
            parser.setRawMode(false);

            if (error) {
                // An error occurred during flashing.
                emitter.emit('error', error);
                return;
            }

            // Flash was successful.
            emitter.emit('success');
        });
    }
};

util.inherits(FlashLoader, events.EventEmitter);
module.exports = FlashLoader;
