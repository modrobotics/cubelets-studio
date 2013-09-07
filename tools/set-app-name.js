var argv = process.argv;
if (argv.length !== 3) {
    console.log('Usage: node set-app-name.js NAME');
    return;
}

// Gather required inputs
var name = argv[2];
var packageJsonPath = './package.json';

var fs = require('fs');
var packageJson = fs.readFileSync(packageJsonPath);
var packageJsonObject = JSON.parse(packageJson);

packageJsonObject['name'] = name;

var transformedPackageJson = JSON.stringify(packageJsonObject, null, 2);
fs.writeFileSync(packageJsonPath, transformedPackageJson);
console.log(transformedPackageJson);
