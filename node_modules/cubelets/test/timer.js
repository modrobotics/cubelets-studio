var Timer = require('../timer');

var timer1 = new Timer();
var timer2 = new Timer();
var k = 1000000;

timer1.setTimeout(function() {
    console.log('1', new Date());
}, k * 1000);

timer2.setTimeout(function() {
    timer1.clear();
    console.log('Cleared timer 1');
}, k * 995);
