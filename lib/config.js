var NodeBB = module.require('./nodebb'),

	Meta = NodeBB.Meta,
	db = NodeBB.db;

var Config = {
	plugin: {
		name: 'Shoutbox',
		id: 'shoutbox',
		description: 'Shoutbox widget.',
		icon: 'fa-bullhorn',
		route: '/shoutbox'
	},
	prefix: 'shoutbox:',
	keys: ['headerlink', 'shoutlimit', 'features'],
	defaults: {
		headerlink: '0',
		shoutlimit: 25,
		features: '{}'
	},
	features: [{
		name: 'Gists',
		id: 'gist',
		description: 'Easily create Gists',
		icon: 'fa-github-alt',
		button: 'Create Gist',
		enabled: true
	}, {
		name: 'Archive',
		id: 'archive',
		description: 'View older posts',
		icon: 'fa-archive',
		button: 'View Archive',
		enabled: true
	}, {
		name: 'Bugs',
		id: 'bug',
		description: 'Report bugs quickly',
		icon: 'fa-bug',
		button: 'Report Bug',
		enabled: true
	}],
	get: function(keys) {
		var get = function(key) {
			return Meta.config[Config.prefix + key] || Config.defaults[key];
		}

		if (Array.isArray(keys)) {
			var result = {};
			for(var i = 0, l = keys.length; i < l; i++) {
				if (Config.keys.indexOf(keys[i]) !== -1) {
					result[keys[i]] = get(keys[i]);
				}
			}
			return result;
		} else {
			return get(keys);
		}
	},
	api: function(callback) {
		var config = Config.get(['features']),
			featureData = JSON.parse(config.features);
		config.features = Config.features.slice(0);
		if (featureData && Object.keys(featureData).length > 0) {
			config.features.map(function(item) {
				return featureData[item.id] ? item.enabled = featureData[item.id].enabled : item.enabled;
			});
		}
		callback(config);
	}
};

Config.settings = {
	keys: ['sound', 'notification', 'hide'],
	defaults: {
		sound: 1,
		notification: 1,
		hide: 0
	},
	get: function(data, callback) {
		db.getObjectFields('user:' + data.uid + ':settings', Config.settings.keys.map(function(e) {
			return Config.prefix + e;
		}), function(err, result) {
			for (var k in result) {
				if (result.hasOwnProperty(k) && k != '_key') {
					data.settings[k] = result[k] !== null ? result[k] : Config.settings.defaults[k.split(':')[1]];
				}
			}
			callback(null, data);
		});
	},
	save: function(data, callback) {
		if (data.uid) {
			var s;
			for (var k in Config.settings.keys) {
				if (Config.settings.keys.hasOwnProperty(k)) {
					s = Config.prefix + Config.settings.keys[k];
					if (data.settings[s] !== undefined) {
						db.setObjectField('user:' + data.uid + ':settings', s, data.settings[s]);
					}
				}
			}
			if (typeof(callback) === 'function') {
				callback(null, true);
			}
		}
	}
}

module.exports = Config;