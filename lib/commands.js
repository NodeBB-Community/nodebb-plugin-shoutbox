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
					SocketIndex.getUserSockets(uid)[0].emit('event:shoutbox.wobble');;
				}
			});
		}
	};
})(module.exports);