var NodeBB = module.require('./nodebb'),

	Meta = NodeBB.Meta;

var Config = {
	constants: Object.freeze({
		name: 'Shoutbox',
		id: 'shoutbox',
		icon: 'fa-bullhorn',
		route: '/shoutbox',
		setting_prefix: 'shoutbox:',
		setting_keys: ['sound', 'notification'],
		setting_defaults: {
			sound: true,
			notification: true
		}
	}),
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
	}],
	get: function(key) {
		if (Config.keys.indexOf(key) !== -1) {
			return Meta.config[Config.constants.setting_prefix + key] || Config.defaults[key];
		}
	},
	api: function(callback) {
		var featureData = JSON.parse(Config.get('features'));
		if (featureData) {
			Config.features.map(function(item) {
				return item.enabled = featureData[item.id].enabled;
			});
		}
		callback({
			features: Config.features
		});
	}
};

module.exports = Config;