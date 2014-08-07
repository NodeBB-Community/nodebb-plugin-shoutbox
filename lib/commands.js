var NodeBB = module.require('./nodebb'),
	User = NodeBB.User,

	SocketIndex = NodeBB.SocketIndex;

(function(Commands) {
	Commands.sockets = {
		wobble: function(socket, data, callback) {
			if (!socket.uid || !data || !data.victim) {
				return;
			}

			User.getUidByUserslug(data.victim, function(err, uid) {
				if (err) {
					return callback(err);
				}

				if (uid) {
					var userSockets = SocketIndex.getUserSockets(uid);
					if (userSockets && userSockets.length > 0) {
						userSockets[0].emit('event:shoutbox.wobble');
					}
				}
			});
		}
	};
})(module.exports);