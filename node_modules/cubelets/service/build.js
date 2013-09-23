var util = require('util');
var events = require('events');
var request = require('request');
var url = require('url');
var fs = require('fs');
var temp = require('temp');
var config = require('../config.json');

var Build = function(buildID, program, cubelet) {
	this.id = buildID;
	this.program = program;
	this.cubelet = cubelet;
	this.hex = undefined;
};

var BuildService = function() {

	events.EventEmitter.call(this);

	var builds = {};
	var apiUrl = config['urls']['api'];
	var hexBuildUrl = config['urls']['build'];
	var service = this;

	var CompilerStatus = {
		COMPILING: 404,
		READY: 200
	};

	var CompilerResult = function(data) {
		var result = this;
		try {
			var output = data; // JSON.parse(data); Web service not returning valid JSON?
			console.log(data);
			result.message = output;
			// if (!result.tryParse(data)) {
			// 	result.lineNumber = 0; // output['line_number'];			
			// 	result.columnNumber = 0; // output['column_number'];
			// 	result.message = 'Compiler error: ' + output; // output['message_string'];
			// }
		}
		catch(e) {
			result.lineNumber = -1;
			result.columnNumber = -1;
			result.message = 'Build failed to compile.';
		}
		this.tryParse = function(data) {
			console.log('Here');
			return false;
		};
	};

	var requestCompilerResult = function(buildID, callback) {
		request.get({
			url: apiUrl + '/compile-result/' + buildID + '/',
			json: true
		}, function(error, response, body) {
			if (error) {
				console.error('Request error.', error);
				service.emit('error', error);
				return;
			}
			if (response.statusCode != 200) {
				service.emit('error', new Error('Bad response. Error status code: ' + response.statusCode));
				return;
			}
			var status = body['status_code'];
			var result = body['content'];
			callback(status, result);
		});
	};

	var requestHexDownload = function(build) {
		request.get(hexBuildUrl + build.id, function(error, response, body) {
			if (error) {
				service.emit('error', error);
				return;
			}
			build.hex = body;
			service.emit('complete', build);
		});
	};

	var addBuild = function(buildID, program, cubelet) {
		return builds[buildID] = new Build(buildID, program, cubelet);
	};

	var removeBuild = function(buildID) {
		delete builds[buildID];
	};

	this.getBuilds = function() {
		return this.builds;
	};

	this.completeBuild = function(build) {
		if (build) {
			removeBuild(build.id);
		}
	};

	function emitBuildProgress(build, percent) {
		service.emit('progress', build, percent);
	};

	this.requestBuild = function(program, cubelet) {
		request.post({
			url: apiUrl + '/compile-request/',
			json: true,
			form: {
				'program_code': program.code,
				'program_title': program.name,
				'cube_id': cubelet.id
			}
		}, function(error, response, body) {
			if (error) {
				console.error('Request error.', error);
				service.emit('error', error);
				return;
			}
			if (response.statusCode != 200) {
				service.emit('error', new Error('Bad response. Error status code: ' + response.statusCode));
				return;
			}
			var statusCode = body['status_code'];
			if (statusCode != 200) {
				service.emit('error', new Error('Bad response body. Error status code: ' + statusCode));
				return;
			}
			var buildID = body['u'];
			var build = addBuild(buildID, program, cubelet);
			emitBuildProgress(build, 0);
			var intervalCount = 0;
			var mutex = false;
			var intervalID = setInterval(function() {
				requestCompilerResult(buildID, function(status, result) {
					if (++intervalCount > 100) {
						service.emit('error', new Error('Build timeout.'));
						clearInterval(intervalID);
						return;
					}
					if (!status) {
						clearInterval(intervalID);
						service.emit('error', new Error('Invalid compiler status.'));
						return;
					}
					if (!result) {
						clearInterval(intervalID);
						service.emit('error', new Error('Invalid compiler result.'));
						return;
					}
					switch (status) {
						case CompilerStatus.COMPILING:
							emitBuildProgress(build, 100.0 * intervalCount / 3); // This is a guess
							break;
						case CompilerStatus.READY:
							clearInterval(intervalID);
							if (mutex) return;
							mutex = true;
							if (result['compiled'] !== true) {
								service.emit('fail', build, new CompilerResult(result['output']));
								return;
							}
							requestHexDownload(build);
							break;
						default:
							clearInterval(intervalID);
							service.emit('error', new Error('Compile request failed. Unknown compiler status.'));
							break;
					}
				});
			}, 1.0 * 1000)
		});
	};

};

util.inherits(BuildService, events.EventEmitter);

module.exports = BuildService;