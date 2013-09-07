var util = require('util');
var events = require('events');
var request = require('request');
var config = require('../config.json');

var FirmwareService = function() {

    events.EventEmitter.call(this);

    var info = {};
    var apiUrl = config['urls']['firmware'];
    var service = this;

    function urlForDownload(mcu, version, type) {
        return apiUrl + "/static/firmware/" + mcu + "/" + version + "/" + (type < 10 ? '0' + type : type) + ".hex";
    }

    function urlForUpdate() {
        return apiUrl + "/api/code.json";
    }

    this.downloadVersion = function(cubelet, version) {
        if (!cubelet || !cubelet.mcu || !cubelet.type || cubelet.type.id === 0 || !version) {
            return;
        }
        console.log(version);
        var u = urlForDownload(cubelet.mcu, version, cubelet.type.id);
        request.get({ url: u }, function(error, response, body) {
            if (error) {
                service.emit('error', error);
                return;
            }
            if (response.statusCode != 200) {
                service.emit('error', new Error([
                    'Firmware service returned an error (code ',
                        response.statusCode, '). <', u , '>'
                ].join('')));
                return;
            }
            var hex = body;
            service.emit('download', cubelet, version, hex);
        });
    };

    this.updateVersion = function(cubelet, version) {
        request.post({
            url: urlForUpdate(),
            form: {
                'is_default': '1',
                'block_id': cubelet.id
            }
        }, function(error, response, body) {
            if (error) {
                console.error('Request error.', error);
                service.emit('error', error);
                return;
            }
            if (response.statusCode != 200) {
                service.emit('error', new Error('Bad response. Error status code.'));
                return;
            }
            service.emit('update', cubelet, version);
        });
    }

};

util.inherits(FirmwareService, events.EventEmitter);

module.exports = FirmwareService;