define(['string'], function(S) {
    var box = {},
        module = {};

    box.vars = {
        "loaded": false,
        "userCheckIntervalId": 0,
		"maxShouts": 0,
		"lastSid": 0,
        "sockets": {
            "get": "modules.shoutbox.get",
            "send": "modules.shoutbox.send",
            "remove" : "modules.shoutbox.remove",
            "get_users": "modules.shoutbox.get_users",
            "receive": "event:shoutbox.receive"
        },
        "titleAlert": "[ %u ] - new shout!",
        "anonMessage": "You must be logged in to view the shoutbox!"
    };

    module.base = {
        "init": function(callback) {
            box.utils.checkAnon(function(isAnon) {
                var shoutBox = module.base.getShoutPanel();
                if (isAnon) {
                    box.utils.hideInputs();
                    box.utils.showAnonMessage(shoutBox);
                } else {
					box.utils.getConfig();
                    box.utils.registerHandlers(shoutBox);
                    box.base.getShouts(shoutBox);
                }
                box.vars.loaded = true;
                if (callback) {
                    callback();
                }
            });
        },

        "showUserPanel": function() {
            module.base.getUsersPanel().parent().removeClass('hidden');
            box.utils.startUserPoll();
            box.base.updateUsers();
        },

        "hasLoaded": function() {
            return box.vars.loaded;
        },

        "getShoutPanel": function() {
            return $('#shoutbox');
        },

        "getUsersPanel": function() {
            return $('#shoutbox-users');
        }
    };

    module.box = {
        "addShout": function(shoutBox, shout) {
            var shoutContent = shoutBox.find('#shoutbox-content');
            shoutContent.append(box.base.parseShout(shout));
            box.base.scrollToBottom(shoutContent);
			box.vars.lastSid = shout.sid;
        }
    };

    box.base = {
        "getShouts": function(shoutBox) {
            socket.emit(box.vars.sockets.get, function(err, shouts) {
                for(var i = 0; i<shouts.length; ++i) {
                    module.box.addShout(shoutBox, shouts[i]);
                }
            });
        },
        "parseShout": function(shout) {
            var date = new Date(parseInt(shout.timestamp, 10));
            var prefix = '<span class="shoutbox-timestamp">' + date.toLocaleTimeString() + '</span> ';
            var options = '';
            if (shout.fromuid === app.uid) {
                options = '<button type="button" class="close pull-right" aria-hidden="true">&times;</button>';
            }
            return "<div id='shoutbox-shout-" + shout.sid + "'>" + options + S(prefix + shout.content).stripTags('p').s + "</div>";
        },
        "scrollToBottom": function(shoutContent) {
            if(shoutContent[0]) {
                shoutContent.scrollTop(
                    shoutContent[0].scrollHeight - shoutContent.height()
                );
            }
        },
        "updateUsers": function() {
            socket.emit(box.vars.sockets.get_users, {}, function(err, data) {
                var userCount = data.length;
                var usernames = data.map(function(i) {
                    return (i.username === null ? 'Anonymous' : i.username);
                });
                var userString = usernames.join("; ");
                module.base.getUsersPanel().find('.panel-body').text(userString);
                module.base.getUsersPanel().find('.panel-title').text('Users (' + userCount + ')');
            });
        }
    };

    box.utils = {
        "checkAnon": function(callback) {
            if (app.uid === null) {
                return callback(true);
            }
            return callback(false);
        },
        "showAnonMessage": function(shoutBox) {
            shoutBox.find('#shoutbox-content').html(box.vars.anonMessage);
        },
		"getConfig": function() {
			socket.emit('modules.shoutbox.getShoutLimit', function(err, limit) {
				box.vars.maxShouts = parseInt(limit, 10);
			});
		},
        "startUserPoll": function() {
            if(box.vars.userCheckIntervalId === 0) {
                box.vars.userCheckIntervalId = setInterval(function() {
                    box.base.updateUsers();
                }, 10000);
            }
        },
        "hideInputs": function() {
            $('#shoutbox').find('.btn-group, .input-group').hide();
        },
        "registerHandlers": function(shoutBox) {
            box.utils.addActionHandlers(shoutBox);
            box.utils.addSocketHandlers();
        },
        "addActionHandlers": function(shoutBox) {
            var actions = box.actions;
            for (var a in actions) {
                if (actions.hasOwnProperty(a)) {
                    actions[a].register(shoutBox);
                }
            }
        },
        "addSocketHandlers": function() {
            var sockets = box.sockets;
            for (var s in sockets) {
                if (sockets.hasOwnProperty(s)) {
                    sockets[s].register();
                }
            }
        }
    };

    box.actions = {
        "send": {
            "register": function(shoutBox) {
                var sendMessage = this.handle;
                shoutBox.find('#shoutbox-message-input').off('keypress').on('keypress', function(e) {
                    if(e.which === 13 && !e.shiftKey) {
                        sendMessage(shoutBox);
                    }
                });

                shoutBox.find('#shoutbox-message-send-btn').off('click').on('click', function(e){
                    sendMessage(shoutBox);
                    return false;
                });
            },
            "handle": function(shoutBox) {
                var msg = S(shoutBox.find('#shoutbox-message-input').val()).stripTags().s;
                if(msg.length) {
                    socket.emit(box.vars.sockets.send, {message:msg});
                    shoutBox.find('#shoutbox-message-input').val('');
                }
            }
        },
        "delete": {
            "register": function(shoutBox) {
                shoutBox.find('button.close').off('click').on('click', 'button.close', this.handle);
            },
            "handle": function(e) {
                var sid = e.currentTarget.parentNode.id.match(/\d+/),
                    node = e.currentTarget.parentNode;
                socket.emit(box.vars.sockets.remove, {"sid": sid}, function (err, result) {
                    if (result === true) {
                        node.remove();
                    } else if (err) {
                        app.alertError("Error deleting shout: " + err, 3000);
                    }
                });
            }
        },
        "gist": {
            "register": function(shoutBox) {
                var show = this.handle.show,
                    create = this.handle.create,
                    gistModal = $('#shoutbox-modal-gist');
                shoutBox.find('#shoutbox-button-create-gist').off('click').on('click', function(e) {
                    show(gistModal);
                });
                gistModal.find('#shoutbox-button-create-gist-submit').off('click').on('click', function(e) {
                    create(gistModal.find('textarea').val(), gistModal);
                });
            },
            "handle": {
                "show": function(gistModal) {
                    gistModal.modal('show');
                },
                "create": function(code, gistModal) {
                    if (app.uid === null) {
                        gistModal.modal('hide');
                        app.alertError('Only registered users can create Gists!', 3000);
                        return;
                    }
                    var json = {
                        "description": "Gist created from BitBangers shoutbox",
                        "public": true,
                        "files": {
                            "file1.txt": {
                                "content": code
                            }
                        }
                    }
                    $.post("https://api.github.com/gists", JSON.stringify(json), function(data) {
                        gistModal.modal('hide');
                        var input = module.base.getShoutPanel().find('#shoutbox-message-input');
                        var link = data.html_url;
                        if (input.val().length > 0) {
                            link = " " + link;
                        }
                        input.val(input.val() + link);
                        app.alertSuccess("Successfully created Gist!", 3000);
                        gistModal.find('textarea').val('');
                    }).fail(function(data) {
                        gistModal.modal('hide');
                        app.alertError("Error while creating Gist, try again later!", 3000);
                    });
                }
            }
        },
        "archive": {
            "register": function(shoutBox) {
				var handle = this.handle,
					show = this.handle.show,
					prev = this.handle.prev,
					next = this.handle.next,
					archiveModal = $('#shoutbox-archive-modal');
                shoutBox.find('#shoutbox-button-archive').off('click').on('click', function(e) {
                    show(archiveModal, handle);
                });

				archiveModal.find('#shoutbox-button-archive-prev').off('click').on('click', function(e) {
					prev(archiveModal, handle);
				});
				archiveModal.find('#shoutbox-button-archive-next').off('click').on('click', function(e) {
					next(archiveModal, handle);
				});
            },
            "handle": {
				"show": function(archiveModal, handle) {
					archiveModal.modal('show');
					if (!archiveModal.data('start')) {
						archiveModal.data('start', (-(box.vars.maxShouts - 1)).toString());
						archiveModal.data('end', "-1");
					}
					handle.get(archiveModal, handle);
				},
				"prev": function(archiveModal, handle) {
					var curStart = parseInt(archiveModal.data('start'), 10);
					var curEnd = parseInt(archiveModal.data('end'));

					var newStart = curStart - box.vars.maxShouts;
					var newEnd = curEnd - box.vars.maxShouts;

					if (Math.abs(newStart) < (parseInt(box.vars.lastSid, 10) + box.vars.maxShouts)) {
						archiveModal.data('start', newStart);
						archiveModal.data('end', newEnd);

						handle.get(archiveModal, handle);
					}
				},
				"next": function(archiveModal, handle) {
					var curStart = parseInt(archiveModal.data('start'), 10);
					var curEnd = parseInt(archiveModal.data('end'));

					var newStart = curStart + box.vars.maxShouts;
					var newEnd = curEnd + box.vars.maxShouts;
					var startLimit = -(box.vars.maxShouts - 1);

					if (newStart <= startLimit && newEnd < 0) {
						archiveModal.data('start', newStart);
						archiveModal.data('end', newEnd);

						handle.get(archiveModal, handle);
					}
				},
				"get": function(archiveModal, handle) {
					archiveModal.find('#shoutbox-archive-content').html('');
					var curStart = archiveModal.data('start');
					var curEnd = archiveModal.data('end');
					var addShout = handle.addShout;
					socket.emit(box.vars.sockets.get, {'start': curStart, 'end': curEnd}, function(err, shouts) {
						for(var i = 0; i<shouts.length; ++i) {
							addShout(archiveModal, shouts[i]);
						}
					});
				},
				"addShout": function(archiveModal, shout) {
					var archiveContent = archiveModal.find('#shoutbox-archive-content');
					archiveContent.append(box.base.parseShout(shout));
					box.base.scrollToBottom(archiveContent);
				}
			}
        }
    };

    box.sockets = {
        "receive": {
            "register": function() {
                if (socket.listeners(box.vars.sockets.receive).length === 0) {
                    socket.on(box.vars.sockets.receive, this.handle);
                }
            },
            "handle": function(data) {
                if (module.base.hasLoaded) {
                    module.box.addShout(module.base.getShoutPanel(), data);
                    app.alternatingTitle(box.vars.titleAlert.replace(/%u/g, data.username));
                }
            }
        }
    }

    return module;
});