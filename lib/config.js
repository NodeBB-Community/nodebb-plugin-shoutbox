var NodeBB = module.require('./nodebb'),

	Meta = NodeBB.Meta;

var Config = {
	plugin: {
		name: 'Shoutbox',
		id: 'shoutbox',
		description: 'Shoutbox widget.',
		icon: 'fa-bullhorn',
		route: '/shoutbox'
	},
	prefix: 'shoutbox:',
	keys: ['headerlink', 'shoutlimit', 'features', 'avatars'],
	defaults: {
		headerlink: '0',
		shoutlimit: 25,
		features: '{}',
		avatars: '0'
	},
	settings: {
		keys: ['sound', 'notification'],
		defaults: {
			sound: true,
			notification: true
		}
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
		var config = Config.get(['features', 'avatars']),
			featureData = JSON.parse(config.features);
		config.features = Config.features.slice(0);
		if (featureData && Object.keys(featureData).length > 0) {
			config.features.map(function(item) {
				return item.enabled = featureData[item.id].enabled;
			});
		}
		config.avatars = config.avatars === '1';
		callback(config);
	}
};

module.exports = Config;