'use strict';

const Config = require('./config');
const Shouts = require('./shouts');

const NodeBB = require('./nodebb');

const Sockets = module.exports;

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
	saveSetting: Config.user.sockets.saveSettings,
};

async function getShouts(socket, data) {
	const shoutLimit = parseInt(Config.global.get('limits.shoutLimit'), 10);
	const guestsAllowed = Boolean(Config.global.get('toggles.guestsAllowed'));
	let start = (-shoutLimit);
	let end = -1;

	if (data && data.start) {
		const parsedStart = parseInt(data.start, 10);

		if (!isNaN(parsedStart)) {
			start = parsedStart;
			end = start + shoutLimit;
		}
	}

	if (socket.uid <= 0 && !guestsAllowed) {
		return [];
	}

	return await Shouts.getShouts(start, end);
}

async function sendShout(socket, data) {
	if (!socket.uid || !data || !data.message || !data.message.length) {
		throw new Error('[[error:invalid-data]]');
	}

	const msg = NodeBB.utils.stripHTMLTags(data.message, NodeBB.utils.stripTags);
	if (msg.length) {
		const shout = await Shouts.addShout(socket.uid, msg);
		emitEvent('event:shoutbox.receive', shout);
		return true;
	}
}

async function editShout(socket, data) {
	if (!socket.uid || !data || !data.sid || isNaN(parseInt(data.sid, 10)) || !data.edited || !data.edited.length) {
		throw new Error('[[error:invalid-data]]');
	}

	const msg = NodeBB.utils.stripHTMLTags(data.edited, NodeBB.utils.stripTags);
	if (msg.length) {
		const result = await Shouts.editShout(data.sid, msg, socket.uid);
		emitEvent('event:shoutbox.edit', result);
		return true;
	}
}

async function getPlainShout(socket, data) {
	if (!socket.uid || !data || !data.sid || isNaN(parseInt(data.sid, 10))) {
		throw new Error('[[error:invalid-data]]');
	}

	return await Shouts.getPlainShouts([data.sid]);
}

async function removeShout(socket, data) {
	if (!socket.uid || !data || !data.sid || isNaN(parseInt(data.sid, 10))) {
		throw new Error('[[error:invalid-data]]');
	}

	const result = await Shouts.removeShout(data.sid, socket.uid);
	if (result === true) {
		emitEvent('event:shoutbox.delete', { sid: data.sid });
	}
	return result;
}

async function removeAllShouts(socket, data) {
	if (!socket.uid || !data || !data.which || !data.which.length) {
		throw new Error('[[error:invalid-data]]');
	}
	if (data.which === 'all') {
		return await Shouts.removeAll(socket.uid);
	} else if (data.which === 'deleted') {
		return await Shouts.pruneDeleted(socket.uid);
	}
	throw new Error('invalid-data');
}

function startTyping(socket, data, callback) {
	if (!socket.uid) return callback(new Error('invalid-data'));

	notifyStartTyping(socket.uid);

	if (socket.listeners('disconnect').length === 0) {
		socket.on('disconnect', () => {
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
