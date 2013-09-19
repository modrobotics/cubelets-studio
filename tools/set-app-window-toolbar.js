var argv = process.argv;
if (argv.length !== 3) {
    console.log('Usage: node set-app-window-toolbar.js enabled|disabled');
    return;
}

// Gather required inputs
var value = argv[2];
var packageJsonPath = './package.json';

var fs = require('fs');
var packageJson = fs.readFileSync(packageJsonPath);
var packageJsonObject = JSON.parse(packageJson);

packageJsonObject['window']['toolbar'] = eval(value);

var transformedPackageJson = JSON.stringify(packageJsonObject, null, 2);
fs.writeFileSync(packageJsonPath, transformedPackageJson);
console.log(transformedPackageJson);
