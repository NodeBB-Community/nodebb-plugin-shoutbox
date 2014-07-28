var	NodeBB = require('./lib/nodebb'),
	Config = require('./lib/config'),
	Sockets = require('./lib/sockets'),

	SocketPlugins = NodeBB.SocketPlugins,
	SocketAdmin = NodeBB.SocketAdmin,

	app;

var Shoutbox = {};

Shoutbox.register = {
	load: function(expressApp, middleware, controllers, callback) {
		app = expressApp;

		function renderGlobal(req, res, next) {
			Config.getTemplateData(function(data) {
				res.render(Config.plugin.id, data);
			});
		}

		function renderAdmin(req, res, next) {
			Config.getTemplateData(function(data) {
				res.render(Config.plugin.id + '/admin', data);
			});
		}

		app.get(Config.plugin.route, middleware.buildHeader, renderGlobal);
		app.get('/api' + Config.plugin.route, renderGlobal);

		app.get('/admin' + Config.plugin.route, middleware.admin.buildHeader, renderAdmin);
		app.get('/api/admin' + Config.plugin.route, renderAdmin);

		SocketPlugins[Config.plugin.id] = Sockets.events;
		SocketAdmin[Config.plugin.id] = Config.adminSockets;

		callback();
	},
	global: {
		addNavigation: function(custom_header, callback) {
			if (Config.global.get('toggles.headerLink')) {
				custom_header.navigation.push({
					class: '',
					iconClass: 'fa fa-fw ' + Config.plugin.icon,
					route: Config.plugin.route,
					text: Config.plugin.name
				});
			}

			callback(null, custom_header);
		}
	},
	admin: {
		addNavigation: function(custom_header, callback) {
			custom_header.plugins.push({
				route: Config.plugin.route,
				icon: Config.plugin.icon,
				name: Config.plugin.name
			});

			callback(null, custom_header);
		}
	}
};

Shoutbox.widget = {
	define: function(widgets, callback) {
		widgets.push({
			name: Config.plugin.name,
			widget: Config.plugin.id,
			description: Config.plugin.description,
			content: ''
		});

		callback(null, widgets);
	},
	render: function(widget, callback) {
		//Remove any container
		widget.data.container = '';
		if (widget.uid !== 0) {
			//Currently doing this on the server -- still debating what's better
			Config.user.get({ uid: widget.uid, settings: {} }, function(err, result) {
				Config.getTemplateData(function(data) {
					data.hiddenStyle = '';
					if (parseInt(result.settings['shoutbox:toggles:hide'], 10) == 1) {
						data.hiddenStyle = 'display: none;';
					}
					app.render('shoutbox', data, callback);
				});
			});
			// Client or server?
//			Config.api(function(data) {
//				app.render('shoutbox', data, callback);
//			});
		}
	}
};

Shoutbox.settings = {
	addUserSettings: function(settings, callback) {
		app.render('shoutbox/user/settings', function(err, html) {
			settings.push({
				title: Config.plugin.name,
				content: html
			});
			callback(null, settings);
		});
	},
	getUserSettings: function(data, callback) {
		Config.user.get(data, callback);
	},
	saveUserSettings: function(data) {
		Config.user.save(data);
	}
};

Shoutbox.sounds = {
	getSounds: function(sounds, callback) {
		sounds.push(__dirname + '/public/sounds/shoutbox-notification.mp3');
		sounds.push(__dirname + '/public/sounds/shoutbox-wobblysausage.mp3');
		callback(null, sounds);
	}
};

module.exports = Shoutbox;
