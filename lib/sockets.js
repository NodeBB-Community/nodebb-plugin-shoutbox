var S = require('string'),

	NodeBB = module.require('./nodebb'),
	Config = require('./config'),
	Backend = require('./backend'),

	User = NodeBB.User,
	SocketIndex = NodeBB.SocketIndex;

var Sockets = {
	get: function(socket, data, callback) {
		var start, end;
		if (data && (data.start && data.end)) {
			start = parseInt(data.start, 10);
			end = parseInt(data.end, 10);
		} else {
			start = -(parseInt(Config.get('shoutlimit'), 10) - 1);
			end = -1;
		}
		if (socket.uid) {
			Backend.getShouts(start, end, function(err, messages) {
				if (err)
					return callback(null, []);

				callback(null, messages);
			});
		} else {
			callback(null, []);
		}
	},
	send: function(socket, data, callback) {
		if (socket.uid === 0) {
			return;
		}

		var msg = S(data.message).stripTags().s;
		User.getMultipleUserFields([socket.uid], ['username', 'picture', 'userslug'], function(err, userData) {
			if(err) {
				return;
			}

			userData = userData[0];
			userData.uid = socket.uid;
			//todo return data should be the same as getShouts
			Backend.parse(msg, userData, true, function(err, parsed) {
				Backend.addShout(socket.uid, msg, function(err, message) {
					SocketIndex.server.sockets.emit('event:shoutbox.receive', {
						fromuid: message.fromuid,
						username: userData.username,
						content: parsed,
						sid: message.sid,
						timestamp: message.timestamp
					});
				});
			});
		});
	},
	remove: function(socket, data, callback) {
		if (data.sid) {
			Backend.removeShout(data.sid.toString(), socket.uid, function(err, result) {
				if (result === true) {
					SocketIndex.server.sockets.emit('event:shoutbox.delete', {
						id: data.sid
					});
				}
				callback(err, result);
			});
		}
	},
	edit: function(socket, data, callback) {
		if (data.sid) {
			var msg = S(data.edited).stripTags().s;
			Backend.editShout(data.sid.toString(), msg, socket.uid, function(err, result) {
				if (result !== false) {
					SocketIndex.server.sockets.emit('event:shoutbox.edit', {
						id: data.sid,
						content: result.content
					});
					result = true;
				}
				callback(err, result);
			});
		}
	},
	removeAll: function(socket, data, callback) {
		if (data !== null && data !== undefined) {
			if (typeof(data.which) === 'string') {
				if (data.which === 'deleted') {
					return Backend.pruneDeleted(socket.uid, callback);
				} else if (data.which ==='all') {
					return Backend.removeAll(socket.uid, callback);
				}
			}
		}
		return callback(null, false);
	},
	getUsers: function(socket, data, callback){
		var users = SocketIndex.getConnectedClients();
		User.getMultipleUserFields(users, ['username'], function(err, usersData) {
			if(err) {
				return callback(null, []);
			}
			return callback(null, usersData);
		});
	},
	getSettings: function(socket, data, callback) {
		User.getUserFields(socket.uid, Config.settings.keys.map(function(e) {
			return Config.prefix + e;
		}), function(err, result) {
			callback(null, {
				settings: result,
				shoutLimit: parseInt(Config.get('shoutlimit'), 10)
			});
		});
	},
	saveSetting: function(socket, data, callback) {
		if (!data.key || !socket.uid) {
			return callback(null, false);
		}
		var key = Config.prefix + data.key;
		User.setUserField(socket.uid, key, data.value, callback);
	},
	getOriginalShout: function(socket, data, callback) {
		if (data.sid) {
			Backend.getShout(data.sid, function(err, shout) {
				if (err) {
					return callback(err);
				}
				return callback(null, shout.content);
			});
		}
	}
}

module.exports = Sockets;