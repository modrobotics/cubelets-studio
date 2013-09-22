var fs = require('fs');
var FlashProgram = require('../program');

var hex = fs.readFileSync('./data/bluetooth.hex');
var binBytes = fs.readFileSync('./data/bluetooth.bin');

var program = new FlashProgram(hex);
var pages = program.getPages();

var totalPageBytes = 0;
var pageBytes = [];
pages.forEach(function(page, index) {
    totalPageBytes += page.length;
    for (var i = 0; i < page.length; ++i) {
        pageBytes.push(page.readUInt8(i));
    }
});
console.log('Total Page Bytes', totalPageBytes);

var totalBinBytes = binBytes.length;
console.log('Total Bin Bytes', totalBinBytes);

if (totalPageBytes != totalBinBytes) {
    console.error("Wrong file size.");
    return;
}

var mismatchBytes = 0;
for (var i = 0; i < totalPageBytes; ++i) {
    var binByte = binBytes[i];
    var pageByte = pageBytes[i];
    if (binByte != pageByte) {
        console.log('@', Math.floor(i / 132) + ', ' + (i % 132), 'Bin', binByte, 'Page', pageByte);
        mismatchBytes++;
    }
}
console.log('Total Mismatch Bytes', mismatchBytes);
console.log('Total Pages', pages.length);