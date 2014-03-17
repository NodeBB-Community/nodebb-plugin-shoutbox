define(['string'], function(S) {
	var userCheck,
		Base, Config,
		Actions, Sockets;

	var Utils = {
		init: function(base, config, callback) {
			Base = base; Config = config;
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
		},
		parseShout: function(shout) {
			//todo
			var date = new Date(parseInt(shout.timestamp, 10));
			var prefix = '<span class="shoutbox-timestamp">' + date.toLocaleTimeString() + '</span> ';
			var options = '';
			if (shout.fromuid === app.uid || app.isAdmin === true) {
				options += '<a href="#" class="shoutbox-shout-option shoutbox-shout-option-close pull-right fa fa-times"></a>';
				options += '<a href="#" class="shoutbox-shout-option shoutbox-shout-option-edit pull-right fa fa-pencil"></a>';
				Config.vars.lastSidByUser = shout.sid;
			}
			var content = '<span class="shoutbox-shout-content">' + shout.content + '</span>';
			return '<div id="shoutbox-shout-' + shout.sid + '">' + options + S(prefix + content).stripTags('p').s + '</div>';
		},
		prepareShoutbox: function(base, callback) {
			Base = base;
			Utils.getSettings(function() {
				console.log(Base);
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
		startUserPoll: function() {
			if(userCheck === 0) {
				userCheck = setInterval(function() {
					Base.updateUsers();
				}, 10000);
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

