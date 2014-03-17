define(function() {
	var Utils, Config;
	var Base = {
		init: function(callback) {
			require([
				'plugins/nodebb-plugin-shoutbox/public/js/lib/utils.js',
				'plugins/nodebb-plugin-shoutbox/public/js/lib/config.js'], function(u, c) {
				Config = c;
				u.init(Base, c, function() {
					Utils = u;
					callback();
				});
			});
		},
		load: function(callback) {
			Utils.checkAnon(function(isAnon) {
				if(!isAnon) {
					Utils.prepareShoutbox(Base, callback);
				}
			});
		},
		addShout: function(shoutBox, shout) {
			if (shout && shout.sid) {
				var shoutContent = shoutBox.find('#shoutbox-content');
				if (shoutContent.find('div[class="shoutbox-shout-container"]').length === 0) {
					shoutContent.html('');
				}
				shoutContent.append(Utils.parseShout(shout));
				Base.scrollToBottom(shoutContent);
				Config.vars.lastSid = shout.sid;
			}
		},
		getShouts: function(shoutBox) {
			socket.emit(Config.sockets.get, function(err, shouts) {
				if (shouts.length === 0) {
					Utils.showEmptyMessage(shoutBox);
				} else {
					for(var i = 0; i < shouts.length; i++) {
						Base.addShout(shoutBox, shouts[i]);
					}
				}
			});
		},
		scrollToBottom: function(shoutContent) {
			if(shoutContent[0]) {
				shoutContent.scrollTop(
					shoutContent[0].scrollHeight - shoutContent.height()
				);
			}
		},
		updateUsers: function() {
			socket.emit(Config.sockets.getUsers, {}, function(err, data) {
				var userCount = data.length;
				var usernames = data.map(function(i) {
					return (i.username === null ? 'Anonymous' : i.username);
				});
				var userString = usernames.join('; ');
				Base.getUsersPanel().find('.panel-body').text(userString);
				Base.getUsersPanel().find('.panel-title').text('Users (' + userCount + ')');
			});
		},
		getShoutPanel: function() {
			return $('#shoutbox');
		},
		getUsersPanel: function() {
			return $('#shoutbox-users');
		}
	};

	return Base;
});