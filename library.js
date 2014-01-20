var	async = require('async'),
    fs = require('fs'),
    path = require('path'),
    S = require('string'),
    User = module.parent.require('./user'),
    Meta = module.parent.require('./meta'),
    Plugins = module.parent.parent.require('./plugins'),
    db = module.parent.require('./database'),
    winston = module.parent.require('winston'),
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
    'config_keys': ['headerlink','pageposition'],
    'config_defaults': {
        'headerlink': '0',
        'pageposition': 'top'
    }
});

var Shoutbox = {};
Shoutbox.config = {};

Shoutbox.init = {
    "setup": function() {
        var dbkeys = constants.config_keys.map(function (key) {
            return "shoutbox:" + key;
        });
        db.getObjectFields('config', dbkeys, function(err, values) {
            dbkeys.forEach(function(dbkey) {
                var realkey = dbkey.split(":")[1];
                Shoutbox.config[realkey] = values[dbkey] || constants.config_defaults[realkey];
            });
        });
    },
    "load": function() {
        ModulesSockets.shoutbox = Shoutbox.sockets;
    },
    "global": {
        addNavigation: function(custom_header, callback) {
            if (Shoutbox.config.headerlink === '1') {
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
                if (Shoutbox.config.pageposition === "top") {
                    template = template.toString().replace(/<div class="row home"/g, partial + "$&");
                } else if (Shoutbox.config.pageposition === "bottom") {
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
                                route: constants.global.route,
                                name: constants.name,
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
Shoutbox.init.setup();
Shoutbox.sockets = {
    "get": function(socket, data, callback) {
        Shoutbox.backend.getShouts(function(err, messages) {
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
        db.getObjectField('shout:' + data.sid, 'fromuid', function(err, uid) {
            if (err) {
                return callback("Unknown error", false);
            }
            if (uid === socket.uid) {
                Shoutbox.backend.markRemoved(data.sid, function(err, result) {
                    if (err) {
                        return callback("Unknown error", false);
                    }
                    return callback(null, true);
                });
            } else {
                return callback("Shout does not belong to you", false);
            }
        });
    },
    "get_users": function(socket, data, callback){
        var users = Object.keys(SocketIndex.getConnectedClients());
        User.getMultipleUserFields(users, ['username'], function(err, usersData) {
            if(err) {
                return callback(null, []);
            }
            return callback(null, usersData);
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
    "getShouts": function(callback) {
        db.getListRange('shouts', -((Meta.config.shoutsToDisplay || 25) - 1), -1, function(err, sids) {
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
    "markRemoved": function (sid, callback) {
        db.setObjectField('shout:' + sid, 'deleted', '1', function (err, result) {
            callback(err, result);
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
