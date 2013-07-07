var charm = require('charm')(process);

charm.push(true);
charm.foreground('red');
console.log('Hello');
charm.pop(true);
