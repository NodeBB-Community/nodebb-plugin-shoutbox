"use strict";

var NodeBB = module.require('./nodebb'),
	Sockets = require('./sockets'),

	Commands = {};

Commands.sockets = {
	wobble: soundCommand('wobble'),
	cena: soundCommand('cena')
};

function soundCommand(sound) {
	return function(socket, data, callback) {
		if (!socket.uid || !data) return callback(new Error('invalid-data'));

		if (data.victim && data.victim.length) {
			NodeBB.User.getUidByUserslug(data.victim, function(err, uid) {
				if (err) return callback(err);

				if (uid) {
					//We only update this index when a user requests shouts or sends one
					//So we can't guarantee we have the correct socket
					//Lucky user who manages to evade this ;)
					var userSocket = Sockets.uidIndex[uid];
					if (userSocket) {
						userSocket.emit('event:shoutbox.' + sound);
					}
				}
			});
		} else {
			socket.emit('event:shoutbox.' + sound);
		}
	}
}

for (var s in Commands.sockets) {
	if (Commands.sockets.hasOwnProperty(s)) {
		Sockets.events[s] = Commands.sockets[s];
	}
}

module.exports = Commands;