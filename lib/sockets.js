var S = require('string'),

	NodeBB = module.require('./nodebb'),
	Config = require('./config'),
	Backend = require('./backend'),
	Commands = require('./commands'),

	SocketIndex = NodeBB.SocketIndex;

//todo clean this up and improve
(function(Sockets) {

	var uidSocketIndex = {},
		handlers = {
		get: function(socket, data, callback) {
			var start, end;

			if (data && data.start) {
				start = parseInt(data.start, 10);
				end = start + parseInt(Config.global.get('limits.shoutLimit'), 10);
			} else {
				start = -(parseInt(Config.global.get('limits.shoutLimit'), 10));
				end = -1;
			}

			if (socket.uid) {
				updateUidSocketIndex(socket);
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

			updateUidSocketIndex(socket);

			var msg = S(data.message).stripTags().trim().s;

			if (msg.length) {
				Backend.addShout(socket.uid, msg, function(err, shout) {
					SocketIndex.server.sockets.emit('event:shoutbox.receive', shout);
					callback(null, true);
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
					if (err) {
						return callback(err);
					}

					SocketIndex.server.sockets.emit('event:shoutbox.edit', result);
					return callback(err, true);
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
		getSettings: Config.user.sockets.getSettings,
		saveSetting: Config.user.sockets.saveSettings
	};

	function updateUidSocketIndex(socket) {
		if (!socket.isBot) {
			uidSocketIndex[socket.uid] = socket;
			if (socket.listeners('disconnect').length === 0) {
				socket.on('disconnect', function() {
					delete uidSocketIndex[socket.uid];
				});
			}
		}
	}

	for (var s in Commands.sockets) {
		if (Commands.sockets.hasOwnProperty(s)) {
			handlers[s] = Commands.sockets[s];
		}
	}

	Sockets.events = handlers;
	Sockets.uidSocketIndex = uidSocketIndex;

})(module.exports);