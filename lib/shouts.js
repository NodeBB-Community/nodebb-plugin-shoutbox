"use strict";

var NodeBB = require('./nodebb'),

	async = require('async'),

	Shouts = {};

Shouts.addShout = function(fromuid, content, callback) {
	NodeBB.db.incrObjectField('global', 'nextSid', function(err, sid) {
		if (err) return callback(err);

		var shout = {
			sid: sid,
			content: content,
			timestamp: Date.now(),
			fromuid: fromuid,
			deleted: '0'
		};

		async.parallel([
			async.apply(NodeBB.db.setObject, 'shout:' + sid, shout),
			async.apply(NodeBB.db.listAppend, 'shouts', sid)
		], function(err) {
			if (err) return callback(err);

			getShouts([sid], callback);
		});
	});
};

Shouts.getPlainShouts = function(sids, callback) {
	var keys = sids.map(function(sid) {
		return 'shout:' + sid;
	});

	NodeBB.db.getObjects(keys, callback);
};

Shouts.getShouts = function(start, end, callback) {
	NodeBB.db.getListRange('shouts', start, end, function(err, sids) {
		if (err) return callback(err);

		if (!Array.isArray(sids) || !sids.length) {
			return callback(null, []);
		}

		getShouts(sids, callback);
	});
};

function getShouts(sids, callback) {
	var keys = sids.map(function(sid) {
		return 'shout:' + sid;
	}), userData, uids,
		userFields = ['uid', 'username', 'userslug', 'picture', 'status'];

	NodeBB.db.getObjects(keys, function(err, shouts) {
		if (err) return callback(err);

		// Get a list of unique uids of the users of non-deleted shouts
		uids = shouts.map(function(s) {
			return parseInt(s.deleted, 10) !== 1 ? parseInt(s.fromuid, 10) : null;
		}).filter(function(u, index, self) {
			return u === null ? false : self.indexOf(u) === index;
		});

		NodeBB.User.getUsersFields(uids, userFields, function(err, usersData) {
			if (err) return callback(err);

			async.map(shouts, function(shout, next) {
				if (parseInt(shout.deleted, 10) === 1) return next();

				userData = usersData[uids.indexOf(parseInt(shout.fromuid, 10))];

				Shouts.parse(shout.content, userData, function(err, s) {
					shout.user = s.user;
					shout.content = s.content;

					next(null, shout);
				});
			}, callback);
		});
	});
}

Shouts.parse = function(raw, userData, callback) {
	async.parallel({
		parsed: async.apply(NodeBB.Plugins.fireHook, 'filter:parse.raw', raw),
		isAdmin: async.apply(NodeBB.User.isAdministrator, userData.uid),
		isMod: async.apply(NodeBB.User.isGlobalModerator, userData.uid),
		status: function(next) {
			NodeBB.User.isOnline(userData.uid, function(err, isOnline) {
				next(null, isOnline ? (userData.status || 'online') : 'offline');
			});
		}
	}, function(err, result) {
		if (err) {
			callback(null, {
				user: userData,
				content: raw
			});
		}

		userData.status = result.status;
		userData.isAdmin = result.isAdmin;
		userData.isMod = result.isMod;

		callback(null, {
			user: userData,
			content: result.parsed
		});
	});
};

Shouts.removeShout = function(sid, uid, callback) {
	async.parallel({
		isAdmin: async.apply(NodeBB.User.isAdministrator, uid),
		isMod: async.apply(NodeBB.User.isGlobalModerator, uid),
		fromUid: async.apply(NodeBB.db.getObjectField, 'shout:' + sid, 'fromuid')
	}, function(err, result) {
		if (err) return callback(err);

		if (result.isAdmin || result.isMod || parseInt(result.fromUid, 10) === parseInt(uid, 10)) {
			NodeBB.db.setObjectField('shout:' + sid, 'deleted', '1', function (err, result) {
				if (err) return callback(err);

				return callback(null, true);
			});
		} else {
			return callback(new Error('not-authorized'));
		}
	});
};

Shouts.editShout = function(sid, msg, uid, callback) {
	async.parallel({
		isAdmin: async.apply(NodeBB.User.isAdministrator, uid),
		isMod: async.apply(NodeBB.User.isGlobalModerator, uid),
		fromUid: async.apply(NodeBB.db.getObjectField, 'shout:' + sid, 'fromuid')
	}, function(err, result) {
		if (err) return callback(err);

		if (result.isAdmin || result.isMod || parseInt(result.fromUid, 10) === parseInt(uid, 10)) {
			NodeBB.db.setObjectField('shout:' + sid, 'content', msg, function(err, result) {
				if (err) return callback(err);

				getShouts([sid], callback);
			});
		} else {
			return callback(new Error('not-authorized'));
		}
	});
};

Shouts.pruneDeleted = function(uid, callback) {
	NodeBB.User.isAdministrator(uid, function(err, isAdmin) {
		if (!isAdmin) return callback(new Error('not-authorized'));

		NodeBB.db.getListRange('shouts', 0, -1, function(err, sids) {
			if (err || !sids || !sids.length) return callback(err);

			var keys = sids.map(function(sid) {
				return 'shout:' + sid;
			});

			NodeBB.db.getObjectsFields(keys, ['sid', 'deleted'], function(err, items) {
				async.map(items, function(item, next) {
					if (parseInt(item.deleted, 10) === 0) {
						return next();
					}

					NodeBB.db.listRemoveAll('shouts', item.sid, function(err, result) {
						next(null, item.sid);
					});
				}, function(err, sids) {
					var keys = sids.map(function(sid) {
						return 'shout:' + sid;
					});

					NodeBB.db.deleteAll(keys, function(err, result) {
						if (err) return callback(err);

						callback(null, true);
					});
				});
			});
		});
	});
};

Shouts.removeAll = function(uid, callback) {
	NodeBB.User.isAdministrator(uid, function(err, isAdmin) {
		if (!isAdmin) return callback(new Error('not-authorized'));

		NodeBB.db.getListRange('shouts', 0, -1, function (err, sids) {
			if (err || !sids || !sids.length) return callback(err);

			var keys = sids.map(function (sid) {
				return 'shout:' + sid;
			});

			async.parallel([
				async.apply(NodeBB.db.deleteAll, keys),
				async.apply(NodeBB.db.delete, 'shouts'),
				async.apply(NodeBB.db.setObjectField, 'global', 'nextSid', 0)
			], function(err, result) {
				if (err) return callback(err);

				callback(null, true);
			});
		});
	});
};

module.exports = Shouts;