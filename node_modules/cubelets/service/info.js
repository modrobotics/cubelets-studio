var util = require('util');
var events = require('events');
var request = require('request');
var url = require('url');
var config = require('../config.json');
var __ = require('underscore');

var Info = function(data) {
	// TODO: Data format checking
	this.typeID = data['type_id'];
	this.mcu = data['mcu'];
	this.currentFirmwareVersion = data['current_firm_ver'];
	this.latestFirmwareVersion = data['latest_firm_ver'];
}

var InfoService = function() {

	events.EventEmitter.call(this);

	var info = {};
	var apiUrl = config['urls']['api'];
	var service = this;

	function urlForCubelets(cubelets) {
		return apiUrl +
			'/cubelet_info/?ids=' +
			__(cubelets).pluck('id').join(',');
	}

	this.fetchCubeletInfo = function(cubelets) {
		// Don't make request unless there are cubelets
		if (!cubelets || cubelets.length == 0) {
			return;
		}
		request.get({
			url: urlForCubelets(cubelets),
			json: true
		}, function(error, response, body) {
			if (error) {
				service.emit('error', error);
				return;
			}
			if (response.statusCode != 200) {
				service.emit('error', new Error('Bad response. Error status code.'));
				return;
			}
			if (!__(body).isArray()) {
				console.error('Bad response. Expected an array.', body);
				return;
			}
			var index = 0;
			__(cubelets).each(function(cubelet) {
				__(body).each(function(item) {
					if (item['id'] == cubelet.id) {
						console.log('Found', cubelet.id);
						service.emit('info', new Info(item), cubelet, index++);
					}
				});
			});
		});
	};

};

util.inherits(InfoService, events.EventEmitter);

module.exports = InfoService;