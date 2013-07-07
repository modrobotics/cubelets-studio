// Take keyboard input one character at a time.
var keyboard = process.stdin;
keyboard.setRawMode(true);
keyboard.resume();
keyboard.on('data', function(data) {
	console.log(data);
});