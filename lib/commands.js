var NodeBB = module.require('./nodebb'),
	Sockets = require('./sockets'),
	User = NodeBB.User,

	SocketIndex = NodeBB.SocketIndex;

(function(Commands) {
	Commands.sockets = {
		wobble: function(socket, data, callback) {
			if (!socket.uid || !data) {
				return;
			}

			if (data.victim) {
				User.getUidByUserslug(data.victim, function(err, uid) {
					if (err) {
						return callback(err);
					}

					if (uid) {
						//We only update this index when a user requests shouts or sends one
						//So we can't guarantee we have the correct socket
						//Lucky user which manages to evade this ;)
						var userSocket = Sockets.uidSocketIndex[uid];
						if (userSocket) {
							userSocket.emit('event:shoutbox.wobble');
						}
					}
				});
			} else {
				for (var socket in Sockets.uidSocketIndex) {
					if (Sockets.uidSocketIndex.hasOwnProperty(socket)) {
						socket.emit('event:shoutbox.wobble');
					}
				}
			}
		}
	};
})(module.exports);