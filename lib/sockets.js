"use strict";

var Config = require('./config'),
	Shouts = require('./shouts'),

	NodeBB = require('./nodebb'),

	S = require('string'),

	Sockets = {};

Sockets.events = {
	get: getShouts,
	send: sendShout,
	edit: editShout,
	getPlain: getPlainShout,
	remove: removeShout,
	removeAll: removeAllShouts,
	startTyping: startTyping,
	stopTyping: stopTyping,
	getSettings: Config.user.sockets.getSettings,
	saveSetting: Config.user.sockets.saveSettings
};

Sockets.uidIndex = {};

function getShouts(socket, data, callback) {
	var shoutLimit = parseInt(Config.global.get('limits.shoutLimit'), 10),
		guestsAllowed = Boolean(Config.global.get('toggles.guestsAllowed')),
		start = (-shoutLimit),
		end = -1;

	if (data && data.start) {
		var parsedStart = parseInt(data.start, 10);

		if (!isNaN(parsedStart)) {
			start = parsedStart;
			end = start + shoutLimit;
		}
	}

	if (!socket.uid && !guestsAllowed) {
		return callback(null, []);
	}

	Shouts.getShouts(start, end, callback);
	updateUidIndex(socket);
}

function sendShout(socket, data, callback) {
	if (!socket.uid || !data || !data.message || !data.message.length) {
		return callback(new Error('invalid-data'));
	}

	var msg = S(data.message).stripTags().trim().s;
	if (msg.length) {
		Shouts.addShout(socket.uid, msg, function(err, shout) {
			if (err) return callback(err);

			emitEvent('event:shoutbox.receive', shout);
			callback(null, true);
		});
		updateUidIndex(socket);
	}
}

function editShout(socket, data, callback) {
	if (!socket.uid || !data || !data.sid
		|| isNaN(parseInt(data.sid, 10))
		|| !data.edited || !data.edited.length) {

		return callback(new Error('invalid-data'));
	}

	var msg = S(data.edited).stripTags().s;
	if (msg.length) {
		Shouts.editShout(data.sid, msg, socket.uid, function(err, result) {
			if (err) return callback(err);

			emitEvent('event:shoutbox.edit', result);
			callback(err, true);
		});
		updateUidIndex(socket);
	}
}

function getPlainShout(socket, data, callback) {
	if (!socket.uid || !data || !data.sid || isNaN(parseInt(data.sid, 10))) {
		return callback(new Error('invalid-data'));
	}

	Shouts.getPlainShouts([data.sid], callback);
}

function removeShout(socket, data, callback) {
	if (!socket.uid || !data || !data.sid || isNaN(parseInt(data.sid, 10))) {
		return callback(new Error('invalid-data'));
	}

	Shouts.removeShout(data.sid, socket.uid, function(err, result) {
		if (result === true) {
			emitEvent('event:shoutbox.delete', {sid: data.sid});
		}

		callback(err, result);
	});
}

function removeAllShouts(socket, data, callback) {
	if (!socket.uid || !data || !data.which || !data.which.length) {
		return callback(new Error('invalid-data'));
	}

	switch (data.which) {
		case 'all':
			Shouts.removeAll(socket.uid, callback);
			break;
		case 'deleted':
			Shouts.pruneDeleted(socket.uid, callback);
			break;
		default:
			callback(new Error('invalid-data'));
	}
}

function startTyping(socket, data, callback) {
	if (!socket.uid) return callback(new Error('invalid-data'));

	notifyStartTyping(socket.uid);

	if (socket.listeners('disconnect').length === 0) {
		socket.on('disconnect', function() {
			notifyStopTyping(socket.uid);
		});
	}

	callback();
}

function stopTyping(socket, data, callback) {
	if (!socket.uid) return callback(new Error('invalid-data'));

	notifyStopTyping(socket.uid);

	callback();
}

function notifyStartTyping(uid) {
	emitEvent('event:shoutbox.startTyping', { uid: uid });
}

function notifyStopTyping(uid) {
	emitEvent('event:shoutbox.stopTyping', { uid: uid });
}

function emitEvent(event, data) {
	NodeBB.SocketIndex.server.sockets.emit(event, data);
}

function updateUidIndex(socket) {
	if (socket.uid && !socket.isBot) {
		Sockets.uidIndex[socket.uid] = socket;

		if (socket.listeners('disconnect').length === 0) {
			socket.on('disconnect', function() {
				delete Sockets.uidIndex[socket.uid];
			});
		}
	}
}

module.exports = Sockets;