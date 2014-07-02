var async = require('async'),

	NodeBB = module.require('./nodebb'),

	db = NodeBB.db,
	User = NodeBB.User,
	Plugins = NodeBB.Plugins;

(function(Backend) {

	Backend.addShout = function(fromuid, content, callback) {
		db.incrObjectField('global', 'nextSid', function(err, sid) {
			if (err) {
				return callback(err);
			}

			var shout = {
				content: content,
				timestamp: Date.now(),
				fromuid: fromuid,
				deleted: '0'
			};

			db.setObject('shout:' + sid, shout, function(err) {
				if (err) {
					return callback(err);
				}

				db.listAppend('shouts', sid);

				getShouts([sid], true, function(err, shouts) {
					callback(err, shouts ? shouts[0] : null);
				});
			});
		});
	};

	Backend.getRawShout = function(sid, callback) {
		db.getObject('shout:' + sid, function(err, shout) {
			if (err) {
				return callback(err);
			}
			return callback(null, shout);
		});
	};

	Backend.getShouts =  function(start, end, callback) {
		db.getListRange('shouts', start, end, function(err, sids) {
			if (err) {
				return callback(err);
			}

			if (!sids || !sids.length) {
				return callback(null, []);
			}

			getShouts(sids, false, callback);
		});
	};

	function getShouts(sids, isNew, callback) {
		var keys = sids.map(function(sid) {
			return 'shout:' + sid;
		});

		db.getObjects(keys, function(err, shouts) {
			if (err) {
				return callback(err);
			}

			var uids = shouts.map(function(s) {
				return parseInt(s.deleted, 10) !== 1 ? parseInt(s.fromuid, 10) : null;
			}).filter(function(u, index, self) {
				return u === null ? false : self.indexOf(u) === index;
			}), userData;

			User.getMultipleUserFields(uids, ['username', 'userslug', 'picture', 'status'], function(err, usersData) {
				if (err) {
					return callback(err);
				}

				async.map(shouts, function(shout, next) {
					if (parseInt(shout.deleted, 10) === 1) {
						return next(null);
					}

					userData = usersData[uids.indexOf(shout.fromuid)];
					userData.uid = shout.fromuid;

					Backend.parse(shout.content, userData, isNew, function(err, s) {
						shout.user = s.user;
						shout.isNew = s.isNew;
						shout.content = s.content;
						shout.sid = shout._key.split(':')[1];

						next(null, shout);
					});
				}, callback);
			});
		});
	}

	Backend.parse = function(message, userData, isNew, callback) {
		Plugins.fireHook('filter:post.parse', message, function(err, parsed) {
			User.isAdministrator(userData.uid, function(err, isAdmin) {
				userData.status = NodeBB.SocketIndex.isUserOnline(userData.uid) ? (userData.status || 'online') : 'offline';
				userData.isAdmin = isAdmin;

				var shout = {
					user: userData,
					isNew: isNew,
					content: parsed
				};

				callback(null, shout);
			});
		});
	};

	Backend.removeShout = function(sid, uid, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			db.getObjectField('shout:' + sid, 'fromuid', function(err, fromuid) {
				if (err) {
					return callback(new Error('Unknown error'), false);
				}

				if (fromuid === uid || isAdmin) {
					db.setObjectField('shout:' + sid, 'deleted', '1', function (err, result) {
						if (err) {
							return callback(new Error('Unknown error'), false);
						}
						return callback(null, true);
					});
				} else {
					return callback(new Error('Shout does not belong to you'), false);
				}
			});
		});
	};

	Backend.editShout = function(sid, msg, uid, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			db.getObjectField('shout:' + sid, 'fromuid', function(err, fromuid) {
				if (err) {
					return callback(new Error('Unknown error'), false);
				}

				if (fromuid === uid || isAdmin) {
					db.setObjectField('shout:' + sid, 'content', msg, function (err, result) {
						if (err) {
							return callback(new Error('Unknown error'), false);
						}

						getShouts([sid], false, function(err, shouts) {
							callback(err, shouts ? shouts[0] : null);
						});
					});
				} else {
					return callback(new Error('Shout does not belong to you'), false);
				}
			});
		});
	};

	Backend.pruneDeleted = function(uid, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			if (isAdmin) {
				db.getListRange('shouts', 0, -1, function(err, sids) {
					if (err || !sids || !sids.length) {
						return callback(err, false);
					}

					function deleteShout(sid, next) {
						db.getObjectField('shout:' + sid, 'deleted', function(err, isDeleted) {
							if (parseInt(isDeleted, 10) === 1) {
								db.delete('shout:' + sid);
								db.listRemoveAll('shouts', sid);
							}
							next();
						});
					}

					async.eachSeries(sids, deleteShout, function(err) {
						if (err) {
							return callback(err, false);
						}
						return callback(null, true);
					});
				});
			} else {
				return callback(new Error('Not allowed'), false);
			}
		});
	};

	Backend.removeAll = function(uid, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			if (isAdmin === true) {
				db.getListRange('shouts', 0, -1, function(err, sids) {
					if (err || !sids || !sids.length) {
						return callback(err, false);
					}

					function deleteShout(sid, next) {
						db.delete('shout:' + sid);
						db.listRemoveAll('shouts', sid);
						next();
					}

					async.eachSeries(sids, deleteShout, function(err) {
						db.setObjectField('global', 'nextSid', 0, function(err, result) {
							if (err) {
								return callback(err, null);
							}
							return callback(null, true);
						});
					});
				});
			} else {
				return callback(new Error('Not allowed'), false);
			}
		});
	};

})(module.exports);
