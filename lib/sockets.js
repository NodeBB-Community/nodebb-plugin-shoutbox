var S = require('string'),

	NodeBB = module.require('./nodebb'),
	Config = require('./config'),
	Backend = require('./backend'),
	User = NodeBB.User;

	SocketIndex = NodeBB.SocketIndex;

//todo clean this up and improve
var Sockets = {
	get: function(socket, data, callback) {
		var start, end;

		if (data && data.start) {
			start = parseInt(data.start, 10);
			end = start + parseInt(Config.get('shoutlimit'), 10);
		} else {
			start = -(parseInt(Config.get('shoutlimit'), 10));
			end = -1;
		}

		if (socket.uid) {
			Backend.getShouts(start, end, function(err, messages) {
				if (err) {
					return callback(null, []);
				}

				callback(null, messages);
			});
		} else {
			callback(null, []);
		}
	},
	send: function(socket, data, callback) {
		if (!data || socket.uid === 0) {
			return callback(new Error('invalid-data'));
		}

		var msg = S(data.message).stripTags().trim().s;

		if (msg.length) {
			Backend.addShout(socket.uid, msg, function(err, shout) {
				SocketIndex.server.sockets.emit('event:shoutbox.receive', shout);
			});
		}
	},
	remove: function(socket, data, callback) {
		if (data && data.sid) {
			Backend.removeShout(data.sid, socket.uid, function(err, result) {
				if (result === true) {
					SocketIndex.server.sockets.emit('event:shoutbox.delete', {
						sid: data.sid
					});
				}
				callback(err, result);
			});
		}
	},
	edit: function(socket, data, callback) {
		if (data && data.sid) {
			var msg = S(data.edited).stripTags().s;

			Backend.editShout(data.sid, msg, socket.uid, function(err, result) {
				if (err === null) {
					SocketIndex.server.sockets.emit('event:shoutbox.edit', result);
					result = true;
				}
				callback(err, result);
			});
		}
	},
	removeAll: function(socket, data, callback) {
		if(!data) {
			return callback(new Error('invalid-data'));
		}

		if (data.which === 'deleted') {
			return Backend.pruneDeleted(socket.uid, callback);
		} else if (data.which === 'all') {
			return Backend.removeAll(socket.uid, callback);
		}

		return callback(null, false);
	},
	getSettings: function(socket, data, callback) {
		if (socket.uid === 0) {
			return;
		}

		Config.settings.get({ uid: socket.uid, settings: {} }, function(err, result) {
			var settings = {};

			for (var i = 0, l = Config.settings.keys.length; i < l; i++) {
				settings[Config.settings.keys[i]] = result.settings[Config.prefix + Config.settings.keys[i]];
			}

			settings.shoutLimit = parseInt(Config.get('shoutlimit'), 10);

			callback(null, {
				settings: settings
			});
		});
	},
	saveSetting: function(socket, data, callback) {
		if (!data || !data.key || !socket.uid) {
			return callback(null, false);
		}

		var setting = {};
		setting[Config.prefix + data.key] = data.value;

		Config.settings.save({ uid: socket.uid, settings: setting}, callback);
	},
	getOriginalShout: function(socket, data, callback) {
		if (data.sid && socket.uid !== 0) {
			Backend.getRawShout(data.sid, function(err, shout) {
				if (err) {
					return callback(err);
				}
				return callback(null, shout.content);
			});
		}
	},
	notifyStartTyping: function(socket, data, callback) {
		if (!socket.uid) {
			return;
		}

		var uid = socket.uid;
		SocketIndex.server.sockets.emit('event:shoutbox.startTyping', { uid: uid });

		if (socket.listeners('disconnect').length === 0) {
			socket.on('disconnect', function() {
				Sockets.notifyStopTyping(socket, data, callback);
			});
		}
	},
	notifyStopTyping: function(socket, data, callback) {
		if (!socket.uid) {
			return;
		}

		var uid = socket.uid;
		SocketIndex.server.sockets.emit('event:shoutbox.stopTyping', { uid: uid });
	},
	wobble: function(socket, data, callback) {
		if (!socket.uid || !data || !data.victim) {
			return;
		}

		User.getUidByUserslug(data.victim, function(err, uid) {
			if (err) {
				return callback(err);
			}

			if (uid) {
				SocketIndex.getUserSockets(uid)[0].emit('event:shoutbox.wobble');;
			}
		});
	}
}

module.exports = Sockets;