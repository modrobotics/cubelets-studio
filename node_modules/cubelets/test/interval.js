var async = require('async');

function wait(interval) {
    return function(callback) {
        setTimeout(function() {
            callback(null);
        }, interval);
    };
}

var series = [];

for (var i = 0; i < 10; ++i) {
    (function(i) {
        series.push(wait(1000));
        series.push(function(callback) {
            console.log('Count', i); callback(null)
        });
    })(i);
}

console.log(series.length);

async.series(series, function() {
    console.log('Done');
});