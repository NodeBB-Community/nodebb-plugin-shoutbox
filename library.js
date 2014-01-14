var	async = require('async'),
    fs = require('fs'),
    path = require('path'),
    S = require('string'),
    User = module.parent.require('./user'),
    Meta = module.parent.require('./meta'),
    Plugins = module.parent.parent.require('./plugins'),
    db = module.parent.require('./database'),
    ModulesSockets = module.parent.require('./socket.io/modules');

var constants = Object.freeze({
    'name': "Shoutbox",
    'global': {
        'route': '/shoutbox'
    },
    'admin': {
        'route': '/plugins/shoutbox',
        'icon': 'fa-edit'
    }
});

var Shoutbox = {};

Shoutbox.init = {
    "load": function() {
        ModulesSockets.shoutbox = Shoutbox.sockets;
    },
    "global": {
        addNavigation: function(custom_header, callback) {
            custom_header.navigation.push({
                "class": "",
                "route": constants.global.route,
                "text": constants.name
            });

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
                template = template.toString().replace(/<div class="row home"/g, partial + "$&");

                custom_routes.templates.push({
                    "template": "home.tpl",
                    "content": template
                });

                fs.readFile(path.resolve(__dirname, './partials/page.tpl'), function (err, tpl) {
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

Shoutbox.sockets = {
    "get": function(callback) {
        Shoutbox.backend.getShouts(function(err, messages) {
            if (err)
                return callback(null);

            callback(messages);
        });
    },
    "send": function(data, sessionData) {
        if (sessionData.uid === 0) {
            return;
        }

        var msg = S(data.message).stripTags().s;
        User.getUserField(sessionData.uid, 'username', function(err, username) {
            if(err) {
                return;
            }

            Shoutbox.backend.parse(sessionData.uid, username, msg, function(parsed) {
                Shoutbox.backend.addShout(sessionData.uid, msg, function(err, message) {
                    sessionData.server.sockets.in('global').emit('event:shoutbox.receive', {
                        fromuid: sessionData.uid,
                        username: username,
                        message: parsed,
                        timestamp: Date.now()
                    });
                });
            });
        });
    },
    "get_users": function(data, callback, sessionData){
        var users = [];
        for(var i in sessionData.userSockets) {
            if (sessionData.userSockets.hasOwnProperty((i))) {
                users.push(i);
            }
        }
        User.getMultipleUserFields(users, ['username'], function(err, usersData) {
            if(err) {
                return callback([]);
            }
            return callback(usersData);
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
                fromuid: fromuid
            };

            db.setObject('shout:' + sid, shout);
            db.listAppend('shouts', sid);

            Shoutbox.backend.updateShoutTime(fromuid);
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
                    User.getUserField(message.fromuid, 'username', function(err, username) {
                        Shoutbox.backend.parse(message.fromuid, username, message.content, function(parsed) {
                            message.content = parsed;
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
                callback(result);
            });
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
