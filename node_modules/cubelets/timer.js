var Timer = function() {
    var timer = this;
    var shouldContinue = true;
    var t0 = null;

    this.setTimeout = function(callback, delay) {
        if (!shouldContinue) {
            return;
        }
        if (null === t0) {
            t0 = process.hrtime();
        }
        var dt = process.hrtime(t0);
        dt = (dt[0] * 1000000000) + dt[1];
        if (dt < delay) {
            setImmediate(function() {
                timer.setTimeout(callback, delay);
            });
        }
        else {
            callback();
            t0 = null;
        }
    };

    this.clear = function() {
        shouldContinue = false;
    };
};

module.exports = Timer;

module.exports.setTimeout = function(callback, delay) {
    var timer = new Timer();
    timer.setTimeout(callback, delay);
    return timer;
};

module.exports.clearTimeout = function(timer) {
    timer.clear();
};
