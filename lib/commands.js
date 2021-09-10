'use strict';

const NodeBB = module.require('./nodebb');
const Sockets = require('./sockets');

const Commands = {};

Commands.sockets = {
	wobble: soundCommand('wobble'),
	cena: soundCommand('cena'),
};

function soundCommand(sound) {
	return async function (socket, data) {
		if (!socket.uid || !data) {
			throw new Error('[[error:invalid-data]]');
		}

		if (data.victim && data.victim.length) {
			const uid = await NodeBB.User.getUidByUserslug(data.victim);
			if (uid) {
				NodeBB.SocketIndex.in(`uid_${uid}`).emit(`event:shoutbox.${sound}`);
			}
		} else {
			socket.emit(`event:shoutbox.${sound}`);
		}
	};
}
Object.keys(Commands.sockets).forEach((s) => {
	Sockets.events[s] = Commands.sockets[s];
});

module.exports = Commands;
