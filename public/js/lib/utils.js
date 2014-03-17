define(['string'], function(S, templates) {
	var shoutTpl, textTpl,
		Base, Config,
		Actions, Sockets,
		templates;

	var Utils = {
		init: function(base, config, callback) {
			//todo I hate this
			Base = base; Config = config;
			templates = window.templates;
			require([
				'plugins/nodebb-plugin-shoutbox/public/js/lib/actions.js',
				'plugins/nodebb-plugin-shoutbox/public/js/lib/sockets.js'], function(a, s) {
				a.init(Base, Utils, Config, function() {
					s.init(Base, config, function() {
						Actions = a; Sockets = s;
						callback();
					});
				});
			});
			templates.preload_template('shout/shout', function() {
				shoutTpl = templates['shout/shout'];
			});
			templates.preload_template('shout/text', function() {
				textTpl = templates['shout/text'];
			});
		},
		parseShout: function(shout, onlyText) {
			shout.status = 'offline';
			shout.hasRights = shout.fromuid === app.uid || app.isAdmin === true;
			if (onlyText) {
				return textTpl.parse(shout);
			} else {
				return shoutTpl.parse(shout);
			}
		},
		prepareShoutbox: function(base, callback) {
			Base = base;
			Utils.getSettings(function() {
				var shoutBox = Base.getShoutPanel();
				if (shoutBox.length > 0) {
					Utils.parseSettings(shoutBox);
					Utils.registerHandlers(shoutBox);
					Base.getShouts(shoutBox);
					//callback(true);
				} else {
					callback(false);
				}
			});
		},
		getSettings: function(callback) {
			socket.emit(Config.sockets.getSettings, function(err, settings) {
				Config.settings = settings.settings;
				Config.vars.shoutLimit = settings.shoutLimit;
				if(callback) {
					callback();
				}
			});
		},
		parseSettings: function(shoutBox) {
			var settings = Config.settings;
			var s = {};
			if (!settings) {
				return;
			}
			for(var key in settings) {
				if (settings.hasOwnProperty(key)) {
					var value = settings[key];
					var k = key.split(':')[1];
					s[k] = value;
					var el = shoutBox.find('#shoutbox-settings-' + k + ' span');
					if (value) {
						el.removeClass('fa-times').addClass('fa-check');
					} else {
						el.removeClass('fa-check').addClass('fa-times');
					}
				}
			}
			Config.settings = s;
		},
		registerHandlers: function(shoutBox) {
			Utils.addActionHandlers(shoutBox);
			Utils.addSocketHandlers();
		},
		addActionHandlers: function(shoutBox) {
			var actions = Actions;
			for (var a in actions) {
				if (actions.hasOwnProperty(a) && a != 'init') {
					actions[a].register(shoutBox);
				}
			}
		},
		addSocketHandlers: function() {
			var sockets = Sockets;
			for (var s in sockets) {
				if (sockets.hasOwnProperty(s) && s != 'init') {
					sockets[s].register();
				}
			}
		},
		checkAnon: function(callback) {
			if (app.uid === 0) {
				return callback(true);
			}
			return callback(false);
		},
		showEmptyMessage: function(shoutBox) {
			shoutBox.find('#shoutbox-content').html(Config.messages.empty);
		}
	};

	return Utils;
});

