var argv = process.argv;
if (argv.length !== 4) {
    console.log('Usage: node set-bundle-version.js VERSION VERSIONSTRING');
    return;
}

// Gather required inputs
var version = argv[2];
var versionString = argv[3];
var infoPlistPath = './platform/osx/Cubelets\ Studio.app/Contents/Info.plist';

var plist = require('plist');
var infoPlist = plist.parseFileSync(infoPlistPath);

infoPlist['CFBundleVersion'] = version;
infoPlist['CFBundleShortVersionString'] = versionString;

var fs = require('fs');
var transformedInfoPlistText = plist.build(infoPlist).toString();
fs.writeFileSync(infoPlistPath, transformedInfoPlistText);
console.log(transformedInfoPlistText);
