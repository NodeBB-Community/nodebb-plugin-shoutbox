'use strict';

const NodeBB = require('./nodebb');

const Shouts = module.exports;

Shouts.addShout = async function (fromuid, content) {
	const sid = await NodeBB.db.incrObjectField('global', 'nextSid');
	const shout = {
		sid: sid,
		content: content,
		timestamp: Date.now(),
		fromuid: fromuid,
		deleted: '0',
	};
	await Promise.all([
		NodeBB.db.setObject(`shout:${sid}`, shout),
		NodeBB.db.listAppend('shouts', sid),
	]);
	return await getShouts([sid]);
};

Shouts.getPlainShouts = async function (sids) {
	const keys = sids.map(sid => `shout:${sid}`);
	const shouts = await NodeBB.db.getObjects(keys);
	return addSids(shouts, sids);
};

function addSids(shouts, sids) {
	shouts.forEach((s, index) => {
		if (s && !s.hasOwnProperty('sid')) {
			s.sid = sids[index];
		}
	});
	return shouts;
}

Shouts.getShouts = async function (start, end) {
	const sids = await NodeBB.db.getListRange('shouts', start, end);
	if (!Array.isArray(sids) || !sids.length) {
		return [];
	}

	const shoutData = await getShouts(sids);
	shoutData.forEach((s, index) => {
		if (s) {
			s.index = start + index;
		}
	});
	return shoutData;
};

async function getShouts(sids) {
	const keys = sids.map(sid => `shout:${sid}`);
	const shouts = await NodeBB.db.getObjects(keys);
	addSids(shouts, sids);

	// Get a list of unique uids of the users of non-deleted shouts
	const uniqUids = shouts.map(s => (parseInt(s.deleted, 10) !== 1 ? parseInt(s.fromuid, 10) : null))
		.filter((u, index, self) => (u === null ? false : self.indexOf(u) === index));


	const usersData = await NodeBB.User.getUsersFields(uniqUids, ['uid', 'username', 'userslug', 'picture', 'status']);
	const uidToUserData = {};
	uniqUids.forEach((uid, index) => {
		uidToUserData[uid] = usersData[index];
	});
	return await Promise.all(shouts.map(async (shout) => {
		if (parseInt(shout.deleted, 10) === 1) {
			return null;
		}

		const userData = uidToUserData[parseInt(shout.fromuid, 10)];

		const s = await Shouts.parse(shout.content, userData);
		shout.user = s.user;
		shout.content = s.content;
		return shout;
	}));
}

Shouts.parse = async function (raw, userData) {
	const [parsed, isAdmin, isMod, status] = await Promise.all([
		NodeBB.Plugins.hooks.fire('filter:parse.raw', raw),
		NodeBB.User.isAdministrator(userData.uid),
		NodeBB.User.isGlobalModerator(userData.uid),
		NodeBB.User.isOnline(userData.uid),
	]);

	userData.status = status ? (userData.status || 'online') : 'offline';
	userData.isAdmin = isAdmin;
	userData.isMod = isMod;
	return {
		user: userData,
		content: parsed,
	};
};

Shouts.removeShout = async function (sid, uid) {
	const [isAdmin, isMod, fromUid] = await Promise.all([
		NodeBB.User.isAdministrator(uid),
		NodeBB.User.isGlobalModerator(uid),
		NodeBB.db.getObjectField(`shout:${sid}`, 'fromuid'),
	]);

	if (isAdmin || isMod || parseInt(fromUid, 10) === parseInt(uid, 10)) {
		await NodeBB.db.setObjectField(`shout:${sid}`, 'deleted', '1');
		return true;
	}
	throw new Error('[[error:no-privileges]]');
};

Shouts.editShout = async function (sid, msg, uid) {
	const [isAdmin, isMod, fromUid] = await Promise.all([
		NodeBB.User.isAdministrator(uid),
		NodeBB.User.isGlobalModerator(uid),
		NodeBB.db.getObjectField(`shout:${sid}`, 'fromuid'),
	]);

	if (isAdmin || isMod || parseInt(fromUid, 10) === parseInt(uid, 10)) {
		await NodeBB.db.setObjectField(`shout:${sid}`, 'content', msg);
		return await getShouts([sid]);
	}
	throw new Error('[[error:no-privileges]]');
};

Shouts.pruneDeleted = async function (uid) {
	const isAdmin = await NodeBB.User.isAdministrator(uid);
	if (!isAdmin) {
		throw new Error('[[error:no-privileges]]');
	}

	const sids = await NodeBB.db.getListRange('shouts', 0, -1);
	if (!sids || !sids.length) {
		return;
	}

	const keys = sids.map(sid => `shout:${sid}`);
	const items = await NodeBB.db.getObjectsFields(keys, ['deleted']);
	const toDelete = [];
	items.forEach((shout, index) => {
		shout.sid = sids[index];
		if (parseInt(shout.deleted, 10) === 1) {
			toDelete.push(shout);
		}
	});

	await Promise.all([
		NodeBB.db.listRemoveAll('shouts', toDelete.map(s => s.sid)),
		NodeBB.db.deleteAll(toDelete.map(s => `shout:${s.sid}`)),
	]);
	return true;
};

Shouts.removeAll = async function (uid) {
	const isAdmin = await NodeBB.User.isAdministrator(uid);
	if (!isAdmin) {
		throw new Error('not-authorized');
	}

	const sids = await NodeBB.db.getListRange('shouts', 0, -1);
	if (!sids || !sids.length) {
		return;
	}

	const keys = sids.map(sid => `shout:${sid}`);

	await Promise.all([
		NodeBB.db.deleteAll(keys),
		NodeBB.db.delete('shouts'),
		NodeBB.db.setObjectField('global', 'nextSid', 0),
	]);
	return true;
};
