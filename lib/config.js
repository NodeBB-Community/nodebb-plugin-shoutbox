"use strict";

var packageInfo = require('../package.json'),
	pluginInfo = require('../plugin.json'),
	pluginId = pluginInfo.id.replace('nodebb-plugin-', ''),

	NodeBB = module.require('./nodebb'),
	Settings = NodeBB.Settings,
	User = NodeBB.User,

	async = require('async'),

	Config = {},

	features = [
		{
			name: 'Gists',
			id: 'gist',
			description: 'Easily create Gists',
			icon: 'fa-github-alt',
			button: 'Create Gist',
			enabled: true
		},
		{
			name: 'Archive',
			id: 'archive',
			description: 'View older posts',
			icon: 'fa-archive',
			button: 'View Archive',
			enabled: true
		},
		{
			name: 'Bugs',
			id: 'bug',
			description: 'Report bugs quickly',
			icon: 'fa-bug',
			button: 'Report Bug',
			enabled: true
		}
	],

	adminDefaults = {
		toggles: {
			headerLink: false,
			features: (function() {
				var defaults = {};
				features.forEach(function(el) {
					defaults[el.id] = el.enabled;
				});

				return defaults;
			})()
		},
		limits: {
			shoutLimit: "25"
		}
	},

	userDefaults = {
	'toggles:sound': true,
	'toggles:notification': true,
	'toggles:hide': false,
	'muted': ''
};

Config.plugin = {
	name: pluginInfo.name,
	id: pluginId,
	version: packageInfo.version,
	description: packageInfo.description,
	icon: 'fa-bullhorn'
};

Config.global = new Settings(Config.plugin.id, Config.plugin.version, adminDefaults);

Config.adminSockets = {
	sync: function() {
		Config.global.sync();
	},
	getDefaults: function(socket, data, callback) {
		callback(null, Config.global.createDefaultWrapper());
	}
};

Config.user = {};
Config.user.sockets = {};

Config.user.get = function(data, callback) {
	if (!data || !data.uid) {
		return callback(new Error('Invalid data'));
	}

	var prefix = Config.plugin.id + ':';
	User.getUserFields(data.uid, Object.keys(userDefaults).map(function(k){
		return prefix + k;
	}), function(err, result) {
		if (err) {
			return callback(err);
		}

		if (!data.settings) {
			data.settings = {};
		}

		var friendlyKey;
		for (var key in userDefaults) {
			friendlyKey = prefix + key;
			if (userDefaults.hasOwnProperty(key) && result.hasOwnProperty(friendlyKey)) {
				data.settings[friendlyKey] = result[friendlyKey] || userDefaults[key];
			}
		}

		data.settings['shoutbox:shoutLimit'] = parseInt(Config.global.get('limits.shoutLimit'), 10);

		callback(null, data);
	});
};

Config.user.save = function(data, callback) {
	if (!data || !data.uid || !data.settings) {
		return callback(new Error('invalid-data'));
	}

	var prefix = Config.plugin.id + ':';
	async.each(Object.keys(userDefaults), function(key, next) {
		key = prefix + key;
		if (!data.settings[key]) {
			return next();
		}

		User.setUserField(data.uid, key, data.settings[key], next);
	}, function(err) {
		if (typeof(callback) === 'function' && !err) {
			// Return the new config with the callback
			Config.user.get(data, callback);
		}
	});
};

Config.user.sockets.getSettings = function(socket, data, callback) {
	if (!socket.uid) {
		return callback(new Error('not-logged-in'));
	}

	Config.user.get({uid: socket.uid, settings: {}}, callback);
};

Config.user.sockets.saveSettings = function(socket, data, callback) {
	if (!socket.uid || !data || !data.settings) {
		return callback(new Error('invalid-data'));
	}

	data.uid = socket.uid;
	Config.user.save(data, callback);
};

Config.getTemplateData = function(callback) {
	var featureConfig = Config.global.get('toggles.features'),
		data = {};

	data.features = features.slice(0).map(function(item) {
		item.enabled = featureConfig[item.id];
		return item;
	});

	callback(data);
};

module.exports = Config;
