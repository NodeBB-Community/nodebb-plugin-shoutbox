define(function() {
	var sb, shoutTpl, textTpl;

	var Utils = {
		init: function(callback) {
			window.templates.preload_template('shoutbox/shout', function() {
				window.templates.preload_template('shoutbox/shout/text', function() {
					shoutTpl = window.templates['shoutbox/shout'];
					textTpl = window.templates['shoutbox/shout/text'];
					callback();
				});
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
		prepareShoutbox: function() {
			Utils.getSettings(function() {
				var shoutBox = sb.base.getShoutPanel();
				//if (shoutBox.length > 0 && Config.settings.hide !== 1) {
				//	shoutBox.parents('.shoutbox-row').removeClass('hide');
				if (shoutBox.length > 0) {
					Utils.parseSettings(shoutBox);
					Utils.registerHandlers(shoutBox);
					sb.base.getShouts(shoutBox);
				}
			});
		},
		getSettings: function(callback) {
			socket.emit(sb.config.sockets.getSettings, function(err, settings) {
				sb.config.settings = settings.settings;
				sb.config.vars.shoutLimit = settings.shoutLimit;
				if(callback) {
					callback();
				}
			});
		},
		parseSettings: function(shoutBox) {
			var settings = sb.config.settings;
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
			var actions = sb.actions;
			for (var a in actions) {
				if (actions.hasOwnProperty(a) && a != 'init') {
					actions[a].register(shoutBox);
				}
			}
		},
		addSocketHandlers: function() {
			var sockets = sb.sockets;
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

	return function(Shoutbox) {
		Shoutbox.utils = Utils;
		sb = Shoutbox;
	};
});

