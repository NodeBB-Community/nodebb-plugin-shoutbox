var	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	S = require('string'),
	User = module.parent.require('./user'),
	Meta = module.parent.require('./meta'),
	Plugins = module.parent.parent.require('./plugins'),
	db = module.parent.require('./database'),
	winston = module.parent.require('winston'),
	webserver = module.parent.require('./webserver'),
	SocketIndex = module.parent.require('./socket.io/index'),
	ModulesSockets = module.parent.require('./socket.io/modules');

var constants = Object.freeze({
	'name': "Shoutbox",
	'icon': 'fa-bullhorn',
	'setting_prefix': 'shoutbox:',
	'global': {
		'route': '/shoutbox'
	},
	'admin': {
		'route': '/plugins/shoutbox'
	},
	'config_keys': ['headerlink','pageposition','shoutlimit'],
	'config_defaults': {
		'headerlink': '0',
		'pageposition': 'top',
		'shoutlimit': 25
	},
	'setting_keys': ['sound', 'notification'],
	'setting_defaults': {
		'sound': true,
		'notification': true
	}
});

var Shoutbox = {};
Shoutbox.config = {
	"get": function(key) {
		if (constants.config_keys.indexOf(key) !== -1) {
			return Meta.config[constants.setting_prefix + key] || constants.config_defaults[key];
		}
	}
};

Shoutbox.init = {
	"load": function() {
		ModulesSockets.shoutbox = Shoutbox.sockets;
	},
	"global": {
		"addNavigation": function(custom_header, callback) {
			if (Shoutbox.config.get('headerlink') === '1') {
				custom_header.navigation.push({
					"class": "",
					"iconClass": "fa fa-fw " + constants.icon,
					"route": constants.global.route,
					"text": constants.name
				});
			}
			return custom_header;
		},
		"addRoute": function(custom_routes, callback) {
			fs.readFile(path.resolve(__dirname, './partials/shoutbox.tpl'), function (err, partial) {
				custom_routes.routes.push({
					route: constants.global.route,
					method: "get",
					options: function(req, res, callback) {
						callback({
							req: req,
							res: res,
							content: '<script> \
								ajaxify.initialLoad = true; \
								templates.ready(function(){ajaxify.go("shoutbox", null, true);}); \
							</script>'
						});
					}
				});

				custom_routes.api.push({
					route: constants.global.route,
					method: "get",
					callback: function(req, res, callback) {
						callback({});
					}
				});

				custom_routes.templates.push({
					"template": "shoutbox.tpl",
					"content": partial
				});

				callback(null, custom_routes);
			});

		},
		"addScripts": function(scripts, callback) {
			return scripts.concat([
				'plugins/shoutbox/js/main.js'
			]);
		}
	},
	"admin": {
		"addNavigation": function(custom_header, callback) {
			custom_header.plugins.push({
				"route": constants.admin.route,
				"icon": constants.icon,
				"name": constants.name
			});

			return custom_header;
		},
		"addRoute": function(custom_routes, callback) {
			fs.readFile(path.join(__dirname, './partials/admin.tpl'), function(err, tpl) {
				custom_routes.routes.push({
					route: constants.admin.route,
					method: "get",
					options: function(req, res, callback) {
						callback({
							req: req,
							res: res,
							route: constants.admin.route,
							name: constants.name,
							content: tpl
						});
					}
				});

				callback(null, custom_routes);
			});
		},
		"addWidget": function(widgets, callback) {
			widgets.push({
				widget: "shoutbox",
				name: "Shoutbox",
				description: "Shoutbox widget.",
				content: "<label>Custom Title:</label><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Shoutbox\" />"
			});
			callback(null, widgets);
		}
	}
}

Shoutbox.sockets = {
	"get": function(socket, data, callback) {
		var start, end;
		if (data && (data.start && data.end)) {
			start = parseInt(data.start, 10);
			end = parseInt(data.end, 10);
		} else {
			start = -(parseInt(Shoutbox.config.get('shoutlimit'), 10) - 1);
			end = -1;
		}
		if (socket.uid) {
			Shoutbox.backend.getShouts(start, end, function(err, messages) {
				if (err)
					return callback(null, []);

				callback(null, messages);
			});
		} else {
			callback(null, []);
		}
	},
	"send": function(socket, data, callback) {
		if (socket.uid === 0) {
			return;
		}

		var msg = S(data.message).stripTags().s;
		User.getMultipleUserFields([socket.uid], ['username', 'picture', 'userslug'], function(err, userData) {
			if(err) {
				return;
			}

			userData = userData[0];
			userData.uid = socket.uid;

			Shoutbox.backend.parse(msg, userData, true, function(err, parsed) {
				Shoutbox.backend.addShout(socket.uid, msg, function(err, message) {
					SocketIndex.server.sockets.in('global').emit('event:shoutbox.receive', {
						fromuid: message.fromuid,
						username: userData.username,
						content: parsed,
						sid: message.sid,
						timestamp: message.timestamp
					});
				});
			});
		});
	},
	"remove": function(socket, data, callback) {
		if (typeof(data.sid) === 'string') {
			Shoutbox.backend.removeShout(data.sid, socket.uid, function(err, result) {
				if (result === true) {
					SocketIndex.server.sockets.in('global').emit('event:shoutbox.delete', {
						'id': '#shoutbox-shout-' + data.sid
					});
				}
				callback(err, result);
			});
		}
	},
	"edit": function(socket, data, callback) {
		if (typeof(data.sid) === 'string' && typeof(data.user) === 'string') {
			var msg = S(data.edited).stripTags().s;
			Shoutbox.backend.editShout(data.sid, msg, socket.uid, data.user, function(err, result) {
				if (result !== false) {
					SocketIndex.server.sockets.in('global').emit('event:shoutbox.edit', {
						'id': '#shoutbox-shout-' + data.sid,
						'content': result
					});
					result = true;
				}
				callback(err, result);
			});
		}
	},
	"saveSetting": function(socket, data, callback) {
		if (!data.key || !socket.uid) {
			return callback(null, false);
		}
		var key = constants.setting_prefix + data.key;
		User.setUserField(socket.uid, key, data.value, callback);
	},
	"removeAll": function(socket, data, callback) {
		if (data !== null && data !== undefined) {
			if (typeof(data.which) === "string") {
				if (data.which === 'deleted') {
					return Shoutbox.backend.pruneDeleted(socket.uid, callback);
				} else if (data.which ==='all') {
					return Shoutbox.backend.removeAll(socket.uid, callback);
				}
			}
		}
		return callback(null, false);
	},
	"getUsers": function(socket, data, callback){
		var users = Object.keys(SocketIndex.getConnectedClients());
		User.getMultipleUserFields(users, ['username'], function(err, usersData) {
			if(err) {
				return callback(null, []);
			}
			return callback(null, usersData);
		});
	},
	"getConfig": function(socket, data, callback) {
		User.getUserFields(socket.uid, constants.setting_keys.map(function(e) {
			return constants.setting_prefix + e;
		}), function(err, result) {
			callback(null, {
				'maxShouts': parseInt(Shoutbox.config.get('shoutlimit'), 10),
				'pagePosition': Shoutbox.config.get('pageposition'),
				'settings': result
			});
		});
	},
	"getOriginalShout": function(socket, data, callback) {
		if (data.sid && data.sid.length > 0) {
			Shoutbox.backend.getShout(data.sid, function(err, shout) {
				if (err) {
					return callback(err);
				}
				return callback(null, shout.content);
			});
		}
	}
}

Shoutbox.backend = {
	"addShout": function(fromuid, content, callback) {
		db.incrObjectField('global', 'nextSid', function(err, sid) {
			if (err) {
				return callback(err, null);
			}

			var shout = {
				content: content,
				timestamp: Date.now(),
				fromuid: fromuid,
				deleted: '0'
			};

			db.setObject('shout:' + sid, shout);
			db.listAppend('shouts', sid);

			Shoutbox.backend.updateShoutTime(fromuid);
			shout.sid = sid;
			callback(null, shout);
		});
	},
	"getShout": function(sid, callback) {
		db.getObject('shout:' + sid, function(err, shout) {
			if (err) {
				return callback(err);
			}
			return callback(null, shout);
		});
	},
	"getShouts": function(start, end, callback) {
		db.getListRange('shouts', start, end, function(err, sids) {
			if (err) {
				return callback(err, null);
			}

			if (!sids || !sids.length) {
				return callback(null, []);
			}

			function getShout(sid, next) {
				db.getObject('shout:' + sid, function(err, message) {
					if (err) {
						return next(err);
					}
					if (message.deleted === '1') {
						return next(null);
					}
					User.getMultipleUserFields([message.fromuid], ['username', 'picture', 'userslug'], function(err, userData) {
						userData = userData[0];
						userData.uid = message.fromuid;
						Shoutbox.backend.parse(message.content, userData, false, function(err, parsed) {
							message.content = parsed;
							message.sid = sid;
							next(null, message);
						});
					});
				});
			}

			async.map(sids, getShout, callback);
		});
	},
	"parse": function(message, userData, isNew, callback) {
		Plugins.fireHook('filter:post.parse', message, function(err, parsed) {
			User.isAdministrator(userData.uid, function(err, isAdmin) {
				var username,
					picture,
					userclass = "shoutbox-user";

				if (isAdmin) {
					userclass += " shoutbox-user-admin";
				}

				username = '<a href="/user/' + userData.userslug + '" ' +
					'class="' + userclass + '">' + userData.username + '</a>: ';
				picture = '<img class="shoutbox-user-image" src="' + userData.picture + '">';

				var shoutData = {
					message: message,
					parsed: parsed,
					fromuid: userData.uid,
					myuid: userData.uid,
					toUserData: userData,
					myUserData: userData,
					isNew: isNew,
					parsedMessage: picture + username + parsed
				};

				Plugins.fireHook('filter:messaging.parse', shoutData, function(err, messageData) {
					callback(null, messageData.parsedMessage);
				});
			});
		});
	},
	"removeShout": function(sid, uid, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			db.getObjectField('shout:' + sid, 'fromuid', function(err, fromuid) {
				if (err) {
					return callback("Unknown error", false);
				}
				if (fromuid === uid || isAdmin) {
					db.setObjectField('shout:' + sid, 'deleted', '1', function (err, result) {
						if (err) {
							return callback("Unknown error", false);
						}
						return callback(null, true);
					});
				} else {
					return callback("Shout does not belong to you", false);
				}
			});
		});
	},
	"editShout": function(sid, msg, uid, username, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			db.getObjectField('shout:' + sid, 'fromuid', function(err, fromuid) {
				if (err) {
					return callback("Unknown error", false);
				}
				if (fromuid === uid || isAdmin) {
					db.setObjectField('shout:' + sid, 'content', msg, function (err, result) {
						if (err) {
							return callback("Unknown error", false);
						}
						User.getMultipleUserFields([fromuid], ['username', 'picture', 'userslug'], function(err, userData) {
							userData = userData[0];
							userData.uid = fromuid;
							Shoutbox.backend.parse(msg, userData, false, function(err, result) {
								return callback(null, result);
							});
						});
					});
				} else {
					return callback("Shout does not belong to you", false);
				}
			});
		});
	},
	"pruneDeleted": function(uid, callback) {
		User.isAdministrator(uid, function(err, isAdmin) {
			if (isAdmin === true) {
				db.getListRange('shouts', 0, -1, function(err, sids) {
					if (err || !sids || !sids.length) {
						return callback(err, false);
					}

					function deleteShout(sid, next) {
						db.getObjectField('shout:' + sid, 'deleted', function(err, isDeleted) {
							if (isDeleted === '1') {
								db.delete('shout:' + sid);
								db.listRemoveAll('shouts', sid);
								next()
							}
							next(null);
						});
					}

					async.map(sids, deleteShout, function(err) {
						if (err) {
							return callback(err, false);
						}
						return callback(null, true);
					});
				});
			} else {
				return callback("Not allowed", false);
			}
		});
	},
	"removeAll": function(uid, callback) {
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
				return callback("Not allowed", false);
			}
		});
	},
	"updateShoutTime": function(uid, callback) {
		db.sortedSetAdd('uid:' + uid + ':shouts', Date.now(), 0, function(err) {
			if (callback) {
				callback(err);
			}
		});
	},
	"renderWidget": function(widget, callback) {

	}
}

module.exports = Shoutbox;
