// Decodes a 3-byte ID
module.exports.decodeID = function(data) {
    if (data.length < 3) {
        return 0;
    }
    var value = [
        data.readUInt8(0) * 256 * 256,
        data.readUInt8(1) * 256,
        data.readUInt8(2)
    ];
    return value[2] + value[1] + value[0];
};

// Decodes a map
module.exports.decodeMap = function(data) {
    var map = [];
    
    if (data.length == 0) {
        // Empty map
        return map;
    }

    if (data.length % 3 != 0) {
        // Invalid data
        return map;
    }

    var decoder = this;

    function decodeIDAtIndex(index) {
        var start = 3 * index;
        var end = 3 + start;
        return decoder.decodeID(data.slice(start, end));
    }

    var count = data.length / 3;

    for (var i = 0; i < count; ++i) {
        map.push(decodeIDAtIndex(i));
    }

    return map;
};