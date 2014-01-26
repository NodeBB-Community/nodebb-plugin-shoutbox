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
	'global': {
		'route': '/shoutbox'
	},
	'admin': {
		'route': '/plugins/shoutbox',
		'icon': 'fa-bullhorn'
	},
	'config_keys': ['headerlink','pageposition','shoutlimit'],
	'config_defaults': {
		'headerlink': '0',
		'pageposition': 'top',
		'shoutlimit': 25
	}
});

var Shoutbox = {};
Shoutbox.config = {
	'get': function(key) {
		if (constants.config_keys.indexOf(key) !== -1) {
			return Meta.config['shoutbox:' + key] || constants.config_defaults[key];
		}
	}
};

Shoutbox.init = {
	"load": function() {
		ModulesSockets.shoutbox = Shoutbox.sockets;
	},
	"global": {
		addNavigation: function(custom_header, callback) {
			if (Shoutbox.config.get('headerlink') === '1') {
				custom_header.navigation.push({
					"class": "",
					"iconClass": "fa fa-fw fa-bullhorn",
					"route": constants.global.route,
					"text": constants.name
				});
			}
			return custom_header;
		},
		addRoute: function(custom_routes, callback) {
			function getBaseTemplate(next) {
				fs.readFile(path.resolve(__dirname, '../../public/templates/home.tpl'), function (err, template) {
					next(err, template);
				});
			}

			function getPartial(next) {
				fs.readFile(path.resolve(__dirname, './partials/shoutbox.tpl'), function (err, template) {
					next(err, template);
				});
			}

			async.parallel([getBaseTemplate, getPartial], function(err, results) {
				var template = results[0],
					partial = results[1];

				// todo: this line should become a templates.js method, ie. templates.replaceBLock(blockname, partial);
				if (Shoutbox.config.get('pageposition') === "top") {
					template = template.toString().replace(/<div class="row home"/g, partial + "$&");
				} else if (Shoutbox.config.get('pageposition') === "bottom") {
					template = template.toString().replace(/<div class="row footer-stats"/g, partial + "$&");
				} else {
					template = template;
				}


				custom_routes.templates.push({
					"template": "home.tpl",
					"content": template
				});

				fs.readFile(path.resolve(__dirname, './partials/shoutbox.tpl'), function (err, tpl) {
					custom_routes.routes.push({
						route: constants.global.route,
						method: "get",
						options: function(req, res, callback) {
							callback({
								req: req,
								res: res,
								content: tpl
							});
						}
					});

					callback(null, custom_routes);
				});
			});


		},
		addScripts: function(scripts, callback) {
			return scripts.concat([
				'plugins/nodebb-plugin-shoutbox/js/main.js'
			]);
		}
	},
	"admin": {
		addNavigation: function(custom_header, callback) {
			custom_header.plugins.push({
				"route": constants.admin.route,
				"icon": constants.admin.icon,
				"name": constants.name
			});

			return custom_header;
		},
		addRoute: function(custom_routes, callback) {
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
		Shoutbox.backend.getShouts(start, end, function(err, messages) {
			if (err)
				return callback(null, []);

			callback(null, messages);
		});
	},
	"send": function(socket, data, callback) {
		if (socket.uid === 0) {
			return;
		}

		var msg = S(data.message).stripTags().s;
		User.getUserField(socket.uid, 'username', function(err, username) {
			if(err) {
				return;
			}

			Shoutbox.backend.parse(socket.uid, username, msg, function(err, parsed) {
				Shoutbox.backend.addShout(socket.uid, msg, function(err, message) {
					SocketIndex.server.sockets.in('global').emit('event:shoutbox.receive', {
						fromuid: message.fromuid,
						username: username,
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
	"get_users": function(socket, data, callback){
		var users = Object.keys(SocketIndex.getConnectedClients());
		User.getMultipleUserFields(users, ['username'], function(err, usersData) {
			if(err) {
				return callback(null, []);
			}
			return callback(null, usersData);
		});
	},
	"getConfig": function(socket, data, callback) {
		User.isAdministrator(socket.uid, function(err, isAdmin) {
			callback(null, {
				'maxShouts': parseInt(Shoutbox.config.get('shoutlimit'), 10),
				'isAdmin': isAdmin
			});
		});
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
	"getShouts": function(start, end, callback) {
		db.getListRange('shouts', start, end, function(err, sids) {
			if (err) {
				return callback(err, null);
			}

			if (!sids || !sids.length) {
				return callback(null, []);
			}

			var messages = [];

			function getShout(sid, next) {
				db.getObject('shout:' + sid, function(err, message) {
					if (err) {
						return next(err);
					}
					if (message.deleted === '1') {
						return next(null);
					}
					User.getUserField(message.fromuid, 'username', function(err, username) {
						Shoutbox.backend.parse(message.fromuid, username, message.content, function(err, parsed) {
							message.content = parsed;
							message.sid = sid;
							messages.push(message);
							next(null);
						});
					});
				});
			}

			async.eachSeries(sids, getShout, function(err) {
				if (err) {
					return callback(err, null);
				}
				callback(null, messages);
			});
		});
	},
	"parse": function (uid, username, message, callback) {
		Plugins.fireHook('filter:post.parse', message, function(err, parsed) {
			User.isAdministrator(uid, function(err, isAdmin) {
				if (isAdmin) {
					username = "<span class='shoutbox-user-admin'>" + username + "</span>: ";
					//putTogether(username, message);
				} else {
					username = "<span class='shoutbox-user'>" + username + "</span>: ";
				}
				//var result = parsed.replace("<p>", "<p>" + username + ": ");
				var result = username + parsed;
				callback(null, result);
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
						Shoutbox.backend.parse(uid, username, msg, function(err, result) {
							return callback(null, result);
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
					var removedSids = [];

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

					async.eachSeries(sids, deleteShout, function(err) {
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
	}
}

module.exports = Shoutbox;
