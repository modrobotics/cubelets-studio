var util = require('util');
var events = require('events');
var Cubelet = require('./cubelet');
var Types = require('./config.json')['types'];
var Responses = require('./config.json')['responses'];
var DiscoverMapNeighborsCommand = require('./command/discover-map-neighbors');
var __ = require('underscore');

var Construction = function() {
	events.EventEmitter.call(this);

	this.connection = null;
	this.origin = null;
	this.near = [];
	this.far = [];
	this.map = {};

	var construction = this;

	function handleConnectionResponse(response) {
		if (response.type == Responses.MAP_NEIGHBORS) {
			var discovery = response.map;
			var map = construction.map;
			var changed = false;
			var find = function(an, id) {
				return __(an).find(function(cubelet) { return cubelet.id == id });
			}

			// Update origin
			var originID = discovery[0];
			var o = construction.origin;
			if (!o) { changed = true; o = new Cubelet(originID, Types.BLUETOOTH); map[originID] = o }
			construction.origin = o;

			// Update near
			var nearIDs = __(discovery.slice(1)).filter(function(id) { return id != 0 });
			var n = construction.near;
			construction.near = __(nearIDs).map(function(id) {
				var c = find(n, id);
				if (!c) { changed = true; c = new Cubelet(id); map[id] = c }
				return c;
			});

			// Update far
			var f = construction.far;
			construction.far = __(nearIDs).reduce(function(memo, id) {
				var c = find(f, id);
				if (c) { changed = true; return __(f).without(c) }
				else return f;
			}, f);

			if (1 || changed)
				construction.emit('change');

			console.log('Updated map.');
		}
	};

	function handleConnectionOpen() {
		construction.discover();
	}

	function removeConnectionListeners(connection) {
		if (connection) {
			connection.removeListener('response', handleConnectionResponse);
			connection.removeListener('open', handleConnectionOpen);
		}
	};

	function addConnectionListeners(connection) {
		if (connection) {
			connection.on('response', handleConnectionResponse);
			connection.on('open', handleConnectionOpen);
		}
	};

	this.setConnection = function(connection) {
		removeConnectionListeners(this.connection);
		this.connection = connection;
		addConnectionListeners(this.connection);
	};

	this.discover = function() {
		if (!this.connection) {
			console.error('No connection available for discovery.');
			return;
		}
		this.connection.postCommand(new DiscoverMapNeighborsCommand());
	};

	this.all = function() {
		return []
			.concat(this.near)
			.concat(this.far);
	};

	this.reset = function() {
		this.connection = null;
		this.origin = null;
		this.near = [];
		this.far = [];
		this.map = {};
	};

};

util.inherits(Construction, events.EventEmitter);
module.exports = Construction;