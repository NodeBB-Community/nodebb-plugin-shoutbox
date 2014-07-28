var NodeBB = module.require('./nodebb'),
	pjson = require('../package.json'),

	Settings = NodeBB.Settings,
	db = NodeBB.db;

(function(Config) {
	Config.plugin = {
		name: 'Shoutbox',
		id: 'shoutbox',
		version: pjson.version,
		description: pjson.description,
		icon: 'fa-bullhorn',
		route: '/shoutbox'
	};

	var features = [
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
	];

	var adminDefaults = {
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
	};

	var userDefaults = {
//		toggles: {
//			sound: true,
//			notification: true,
//			hide: false
//		},
//		muted: '',
		'shoutbox:toggles:sound': true,
		'shoutbox:toggles:notification': true,
		'shoutbox:toggles:hide': false,
		'shoutbox:muted': ''
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

	//Config.user = new Settings(Config.plugin.id + 'User', Config.plugin.version, userDefaults);
	Config.user = {};

	Config.user.get = function(data, callback) {
		db.getObjectFields('user:' + data.uid + ':settings', Object.keys(userDefaults), function(err, result) {
			for (var k in result) {
				if (result.hasOwnProperty(k) && k != '_key') {
					data.settings[k] = result[k] !== null ? result[k] : userDefaults[k];
				}
			}

			callback(null, data);
		});
	};

	Config.user.save = function(data, callback) {
		if (data.uid) {
			var keys = Object.keys(userDefaults), cur;
			for (var i = 0, l = keys.length; i < l; i++) {
				cur = keys[i];
				if (data.settings[cur] !== undefined) {
					db.setObjectField('user:' + data.uid + ':settings', cur, data.settings[cur]);
				}
			}
			if (typeof(callback) === 'function') {
				callback(null, true);
			}
		}
	};

	Config.userSockets = {
		getSettings: function(socket, data, callback) {
			if (socket.uid === 0) {
				return;
			}

			Config.user.get({ uid: socket.uid, settings: {} }, function(err, result) {
				var settings = result.settings;
				settings['shoutbox:shoutLimit'] = parseInt(Config.global.get('limits.shoutLimit'), 10);

				callback(null, {
					settings: settings
				});
			});
		},
		saveSettings: function(socket, data, callback) {
			if (!data || !data.key || !socket.uid) {
				return callback(null, false);
			}

			var setting = {};
			setting[data.key] = data.value;

			Config.user.save({ uid: socket.uid, settings: setting}, callback);
		}
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

})(module.exports);