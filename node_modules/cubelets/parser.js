var events = require('events');
var util = require('util');
var Response = require('./response');

var ResponseParser = function(encoding) {
    events.EventEmitter.call(this);

    // Possible parser states
    var State = {
        RAW:0,
        READY:1,
        HEADER_BEGIN:2,
        HEADER_TYPE:3,
        HEADER_SIZE:4,
        HEADER_END:5,
        BODY:6
    };

    // Initialize parser state
    var state = State.READY;
    var data = new Buffer(0);
    var type = undefined;
    var size = 0;
    var index = 0;
    var extraBytes = [];

    this.setRawMode = function(raw) {
        state = raw ? State.RAW : State.READY;
        data = new Buffer(0);
        type = undefined;
        size = 0;
        index = 0;
        extraBytes = [];
    };

    this.getRawMode = function() {
        return state === State.RAW;
    };

    // Main parse function
    this.parse = function(buffer) {

        data = Buffer.concat([data, buffer]);

        function byteAt(i) {
            return data.readUInt8(i);
        }

        function nextByte() {
            return byteAt(index++);
        }

        function nextChar() {
            return String.fromCharCode(nextByte());
        }

        function hasMoreBytes() {
            return (data.length > 0) && (index < data.length);
        }

        function hasEmptyBody() {
            return (state == State.HEADER_END) && (size == 0);
        }

        function shouldParse() {
            return (hasMoreBytes() && (size + index <= data.length)) || hasEmptyBody();
        }

        function reset() {
            state = State.READY;
            data = data.slice(index);
            type = undefined;
            size = 0;
            index = 0;
        }

        function parseRaw() {
            if (data.length > 0) {
                emitRaw(data);
            }
            state = State.RAW;
            data = new Buffer(0);
            type = undefined;
            size = 0;
            index = 0;
        }

        function parseHeaderBegin() {
            var c = nextChar();
            if (c == '<') {
                state = State.HEADER_BEGIN;
            }
            else {
                parseExtra();
            }
        }

        function parseHeaderType() {
            var c = nextChar();
            state = State.HEADER_TYPE;
            type = Response.decodeType(c);
            if (!type) {
                parseExtra();
            }
        }

        function parseHeaderSize() {
            size = nextByte();
            state = State.HEADER_SIZE;
        }

        function parseHeaderEnd() {
            var c = nextChar();
            if (c == '>') {
                state = State.HEADER_END;
            }
            else {
                parseExtra();
            }
        }

        function parseBody() {
            state = State.BODY;
            var body = data.slice(index, index + size);
            emitResponse(body);
            index += size;
            reset();
        }

        function parseExtra() {
            for (var i = 0; i < index; ++i) {
                extraBytes.push(byteAt(i));
            }
            reset();
        }

        while (shouldParse()) {
            switch (state) {
                case State.RAW:
                    parseRaw();
                    break;
                case State.READY:
                    parseHeaderBegin();
                    break;
                case State.HEADER_BEGIN:
                    parseHeaderType();
                    break;
                case State.HEADER_TYPE:
                    parseHeaderSize();
                    break;
                case State.HEADER_SIZE:
                    parseHeaderEnd();
                    break;
                case State.HEADER_END:
                case State.BODY:
                    parseBody();
                    break;
                default:
                    console.log('Invalid parser state.');
                    parseExtra();
                    break;
            }
        }

        if (extraBytes.length > 0) {
            emitExtra(new Buffer(extraBytes));
            extraBytes = [];
        }

    };

    var emitter = this;

    // Emits a parsed response
    var emitResponse = function(data) {
        emitter.emit('response', Response.create(data, type));
    };

    // Emits extra data
    var emitExtra = function(data) {
        emitter.emit('extra', data);
    };

    // Emits raw data
    var emitRaw = function(data) {
        emitter.emit('raw', data);
    }
};

util.inherits(ResponseParser, events.EventEmitter);
module.exports = ResponseParser;
