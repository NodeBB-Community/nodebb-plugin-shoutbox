var Meta = module.parent.parent.require('./meta');

var Config = {
	"constants": Object.freeze({
		'name': "Shoutbox",
		'icon': 'fa-bullhorn',
		'setting_prefix': 'shoutbox:',
		'global': {
			'route': '/shoutbox'
		},
		'admin': {
			'route': '/plugins/shoutbox'
		},
		'config_keys': ['headerlink','pageposition','shoutlimit','features'],
		'config_defaults': {
			'headerlink': '0',
			'pageposition': 'top',
			'shoutlimit': 25,
			'features': '{}'
		},
		'setting_keys': ['sound', 'notification'],
		'setting_defaults': {
			'sound': true,
			'notification': true
		}
	}),
	"features": [{
		"name": "Gists",
		"id": "gist",
		"description": "Easily create Gists",
		"icon": "fa-github-alt",
		"button": "Create Gist",
		"enabled": true
	}, {
		"name": "Archive",
		"id": "archive",
		"description": "View older posts",
		"icon": "fa-archive",
		"button": "View Archive",
		"enabled": true
	}],
	"get": function(key) {
		if (Config.constants.config_keys.indexOf(key) !== -1) {
			return Meta.config[Config.constants.setting_prefix + key] || Config.constants.config_defaults[key];
		}
	},
	"api": function(callback) {
		//Seriously can't think of a better name atm
		var featureData = JSON.parse(Config.get('features'));
		if (featureData) {
			Config.features.map(function(item) {
				return item.enabled = featureData[item.id].enabled;
			});
		}
		callback({
			"features": Config.features
		});
	}
};

module.exports = Config;