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
			templates.preload_template('shoutbox/shout', function() {
				shoutTpl = templates['shoutbox/shout'];
			});
			templates.preload_template('shoutbox/shout/text', function() {
				textTpl = templates['shoutbox/shout/text'];
			});
		},
		parseShout: function(shout, onlyText) {
			shout.hasRights = shout.fromuid === app.uid || app.isAdmin === true;
			if (onlyText) {
				return textTpl.parse(shout);
			} else {
				return shoutTpl.parse(shout);
			}
		},
		prepareShoutbox: function(base) {
			Base = base;
			Utils.getSettings(function() {
				var shoutBox = Base.getShoutPanel();
				//if (shoutBox.length > 0 && Config.settings.hide !== 1) {
				//	shoutBox.parents('.shoutbox-row').removeClass('hide');
				if (shoutBox.length > 0) {
					Utils.parseSettings(shoutBox);
					Utils.registerHandlers(shoutBox);
					Base.getShouts(shoutBox);
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
			if (!settings) {
				return;
			}
			for(var key in settings) {
				if (settings.hasOwnProperty(key)) {
					var value = settings[key];
					var el = shoutBox.find('#shoutbox-settings-' + key + ' span');
					if (value === 1) {
						el.removeClass('fa-times').addClass('fa-check');
					} else {
						el.removeClass('fa-check').addClass('fa-times');
					}
				}
			}
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

