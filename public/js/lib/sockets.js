define([
	'plugins/nodebb-plugin-shoutbox/public/js/lib/base.js',
	'plugins/nodebb-plugin-shoutbox/public/js/lib/config.js'], function(Base, Config) {
	var Sockets = {
		onreceive: {
			register: function() {
				if (socket.listeners(Config.sockets.onReceive).length === 0) {
					socket.on(Config.sockets.onReceive, this.handle);
				}
			},
			handle: function(data) {
				var shoutBox = Base.getShoutPanel();
				if (shoutBox.length > 0) {
					Base.addShout(shoutBox, data);
					if (data.fromuid !== app.uid) {
						if (Config.getSetting('notification')) {
							app.alternatingTitle(Config.messages.alert.replace(/%u/g, data.username));
						}
						if (Config.getSetting('sound')) {
							$('#shoutbox-sounds-notification')[0].play();
						}
					}
				}
			}
		},
		ondelete: {
			register: function() {
				if (socket.listeners(Config.sockets.onDelete).length === 0) {
					socket.on(Config.sockets.onDelete, this.handle);
				}
			},
			handle: function(data) {
				$('data-sid=' + data.id).remove();
			}
		},
		onedit: {
			register: function() {
				if (socket.listeners(Config.sockets.onEdit).length === 0) {
					socket.on(Config.sockets.onEdit, this.handle);
				}
			},
			handle: function(data) {
				$(data.id).find('.shoutbox-shout-content').html('*' + S(data.content).stripTags('p').s);
			}
		}
	};

	return Sockets;
});