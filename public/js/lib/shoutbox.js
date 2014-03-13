define(['string'], function(S) {
	var box = {},
		module = {};

	box.vars = {
		config: {
			maxShouts: 0
		},
		loaded: false,
		userCheckIntervalId: 0,
		lastSid: 0,
		lastSidByUser: 0,
		sockets: {
			get: 'modules.shoutbox.get',
			send: 'modules.shoutbox.send',
			remove : 'modules.shoutbox.remove',
			edit: 'modules.shoutbox.edit',
			save_settings: 'modules.shoutbox.saveSetting',
			get_users: 'modules.shoutbox.getUsers',
			get_orig_shout: 'modules.shoutbox.getOriginalShout',
			get_partial: 'modules.shoutbox.getPartial',
			get_config: 'modules.shoutbox.getConfig',
			onreceive: 'event:shoutbox.receive',
			ondelete: 'event:shoutbox.delete',
			onedit: 'event:shoutbox.edit'
		},
		titleAlert: '[ %u ] - new shout!',
		anonMessage: 'You must be logged in to view the shoutbox!',
		emptyMessage: 'The shoutbox is empty, start shouting!',
		'settings-prefix': 'shoutbox-settings-'
	};

	module.base = {
		init: function(url, callback) {
			function load(callback) {
				var shoutBox = module.base.getShoutPanel();
				if (shoutBox.length > 0) {
					box.utils.parseSettings(shoutBox);
					box.utils.registerHandlers(shoutBox);
					box.base.getShouts(shoutBox);
				}
				box.vars.loaded = true;

				if (callback) {
					callback();
				}
			}

			box.utils.checkAnon(function(isAnon) {
				if(!isAnon) {
					if (url === '') {
						box.utils.prepareShoutbox(function(success) {
							if (success) {
								load(callback);
							}
						});
					} else {
						load(callback);
					}
				}
			});
		},
		showUserPanel: function() {
			module.base.getUsersPanel().parent().removeClass('hidden');
			box.utils.startUserPoll();
			box.base.updateUsers();
		},
		hasLoaded: function() {
			return box.vars.loaded;
		},
		getShoutPanel: function() {
			return $('#shoutbox');
		},
		getUsersPanel: function() {
			return $('#shoutbox-users');
		}
	};

	module.box = {
		addShout: function(shoutBox, shout) {
			if (shout && shout.sid) {
				var shoutContent = shoutBox.find('#shoutbox-content');
				if (shoutContent.find('div[id^="shoutbox-shout"]').length === 0) {
					shoutContent.html('');
				}
				shoutContent.append(box.base.parseShout(shout));
				box.base.scrollToBottom(shoutContent);
				box.vars.lastSid = shout.sid;
			}
		}
	};

	box.base = {
		getShouts: function(shoutBox) {
			socket.emit(box.vars.sockets.get, function(err, shouts) {
				if (shouts.length === 0) {
					box.utils.showEmptyMessage(shoutBox);
				} else {
					for(var i = 0; i < shouts.length; i++) {
						module.box.addShout(shoutBox, shouts[i]);
					}
				}
			});
		},
		parseShout: function(shout) {
			var date = new Date(parseInt(shout.timestamp, 10));
			var prefix = '<span class="shoutbox-timestamp">' + date.toLocaleTimeString() + '</span> ';
			var options = '';
			if (shout.fromuid === app.uid || app.isAdmin === true) {
				options += '<a href="#" class="shoutbox-shout-option shoutbox-shout-option-close pull-right fa fa-times"></a>';
				options += '<a href="#" class="shoutbox-shout-option shoutbox-shout-option-edit pull-right fa fa-pencil"></a>';
				box.vars.lastSidByUser = shout.sid;
			}
			var content = '<span class="shoutbox-shout-content">' + shout.content + '</span>';
			return '<div id="shoutbox-shout-' + shout.sid + '">' + options + S(prefix + content).stripTags('p').s + '</div>';
		},
		scrollToBottom: function(shoutContent) {
			if(shoutContent[0]) {
				shoutContent.scrollTop(
					shoutContent[0].scrollHeight - shoutContent.height()
				);
			}
		},
		updateUsers: function() {
			socket.emit(box.vars.sockets.get_users, {}, function(err, data) {
				var userCount = data.length;
				var usernames = data.map(function(i) {
					return (i.username === null ? 'Anonymous' : i.username);
				});
				var userString = usernames.join('; ');
				module.base.getUsersPanel().find('.panel-body').text(userString);
				module.base.getUsersPanel().find('.panel-title').text('Users (' + userCount + ')');
			});
		}
	};

	box.utils = {
		prepareShoutbox: function(callback) {
			box.utils.getConfig(function() {
				callback(true);
			});
		},
		checkAnon: function(callback) {
			if (app.uid === 0) {
				return callback(true);
			}
			return callback(false);
		},
		showAnonMessage: function(shoutBox) {
			shoutBox.find('#shoutbox-content').html(box.vars.anonMessage);
		},
		showEmptyMessage: function(shoutBox) {
			shoutBox.find('#shoutbox-content').html(box.vars.emptyMessage);
		},
		getConfig: function(callback) {
			socket.emit(box.vars.sockets.get_config, function(err, config) {
				box.vars.config = config;
				if(callback) {
					callback();
				}
			});
		},
		parseSettings: function(shoutBox) {
			var settings = box.vars.config.settings;
			var s = {};
			if (!settings) {
				return;
			}
			for(var key in settings) {
				if (settings.hasOwnProperty(key)) {
					var value = settings[key];
					var k = key.split(':')[1];
					s[k] = value;
					var el = shoutBox.find('#shoutbox-settings-' + k + ' span');
					if (value) {
						el.removeClass('fa-times').addClass('fa-check');
					} else {
						el.removeClass('fa-check').addClass('fa-times');
					}
				}
			}
			box.vars.config.settings = s;
		},
		getSetting: function(key) {
			return box.vars.config.settings[key];
		},
		startUserPoll: function() {
			if(box.vars.userCheckIntervalId === 0) {
				box.vars.userCheckIntervalId = setInterval(function() {
					box.base.updateUsers();
				}, 10000);
			}
		},
		hideInputs: function(shoutBox) {
			shoutBox.find('.btn-group, .input-group').hide();
		},
		hideShoutbox: function(shoutBox) {
			shoutBox.addClass('hidden');
		},
		registerHandlers: function(shoutBox) {
			box.utils.addActionHandlers(shoutBox);
			box.utils.addSocketHandlers();
		},
		addActionHandlers: function(shoutBox) {
			var actions = box.actions;
			for (var a in actions) {
				if (actions.hasOwnProperty(a)) {
					actions[a].register(shoutBox);
				}
			}
		},
		addSocketHandlers: function() {
			var sockets = box.sockets;
			for (var s in sockets) {
				if (sockets.hasOwnProperty(s)) {
					sockets[s].register();
				}
			}
		}
	};

	box.actions = {
		send: {
			register: function(shoutBox) {
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
			handle: function(shoutBox) {
				var msg = S(shoutBox.find('#shoutbox-message-input').val()).stripTags().s;
				if(msg.length) {
					socket.emit(box.vars.sockets.send, { message:msg });
					shoutBox.find('#shoutbox-message-input').val('');
				}
			}
		},
		delete: {
			register: function(shoutBox) {
				shoutBox.off('click', '.shoutbox-shout-option-close').on('click', '.shoutbox-shout-option-close', this.handle);
			},
			handle: function(e) {
				var sid = e.currentTarget.parentNode.id.match(/\d+/)[0];
				socket.emit(box.vars.sockets.remove, { sid: sid }, function (err, result) {
					if (result === true) {
						app.alertSuccess('Successfully deleted shout!');
					} else if (err) {
						app.alertError('Error deleting shout: ' + err, 3000);
					}
				});
				return false;
			}
		},
		edit: {
			register: function(shoutBox) {
				var handle = this.handle;
				shoutBox.off('click', '.shoutbox-shout-option-edit').on('click', '.shoutbox-shout-option-edit', function(e) {
					handle(shoutBox, e);
				});
				shoutBox.find('#shoutbox-message-input').on('keypress', function(e) {
					if(e.keyCode === 38) {
						handle(shoutBox, null, box.vars.lastSidByUser);
					}
				});
			},
			handle: function(shoutBox, e, sid) {
				var shout, user,
					parent = shoutBox.find('#shoutbox-message-input').parent();
				if (sid) {
					shout = shoutBox.find('#shoutbox-shout-' + sid);
					sid = sid + '';
				} else {
					shout = e.currentTarget.parentNode;
					sid = shout.id.match(/\d+/)[0];
				}

				user = $(shout).find('span[class^="shoutbox-user"]').text();

				socket.emit(box.vars.sockets.get_orig_shout, { sid: sid }, function(err, orig) {
					parent.addClass('has-warning');
					parent.find('#shoutbox-message-send-btn').text('Edit').off('click').on('click', function(e){
						edit(orig);
					});
					parent.find('#shoutbox-message-input').off('keypress').on('keypress', function(e) {
						if(e.which === 13 && !e.shiftKey) {
							edit(orig);
						}
					}).val(orig).focus().putCursorAtEnd();
				});

				function edit(orig) {
					var msg = S(parent.find('#shoutbox-message-input').val()).stripTags().s;
					if (msg === orig || msg === null) {
						return finish();
					}
					socket.emit(box.vars.sockets.edit, { sid: sid, user: user, edited: msg }, function (err, result) {
						if (result === true) {
							app.alertSuccess('Successfully edited shout!');
						} else if (err) {
							app.alertError('Error editing shout: ' + err, 3000);
						}
						finish();
					});
				}

				function finish() {
					parent.removeClass('has-warning').find('#shoutbox-message-send-btn').removeClass('hide');
					parent.find('#shoutbox-message-send-btn').text('Send');
					parent.find('#shoutbox-message-input').val('');
					box.actions.send.register(shoutBox);
					box.actions.edit.register(shoutBox);
				}

				return false;
			}
		},
		gist: {
			register: function(shoutBox) {
				var show = this.handle.show,
					create = this.handle.create,
					gistModal = $('#shoutbox-modal-gist');
				shoutBox.find('#shoutbox-button-gist').off('click').on('click', function(e) {
					show(gistModal);
				});
				gistModal.find('#shoutbox-button-create-gist-submit').off('click').on('click', function(e) {
					create(gistModal.find('textarea').val(), gistModal);
				});
			},
			handle: {
				show: function(gistModal) {
					gistModal.modal('show');
				},
				create: function(code, gistModal) {
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
					$.post('https://api.github.com/gists', JSON.stringify(json), function(data) {
						gistModal.modal('hide');
						var input = module.base.getShoutPanel().find('#shoutbox-message-input');
						var link = data.html_url;
						if (input.val().length > 0) {
							link = ' ' + link;
						}
						input.val(input.val() + link);
						app.alertSuccess('Successfully created Gist!', 3000);
						gistModal.find('textarea').val('');
					}).fail(function(data) {
							gistModal.modal('hide');
							app.alertError('Error while creating Gist, try again later!', 3000);
						});
				}
			}
		},
		archive: {
			register: function(shoutBox) {
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
			handle: {
				show: function(archiveModal, handle) {
					archiveModal.modal('show');
					if (!archiveModal.data('start')) {
						archiveModal.data('start', (-(box.vars.config.maxShouts - 1)).toString());
						archiveModal.data('end', '-1');
					}
					handle.get(archiveModal, handle);
				},
				prev: function(archiveModal, handle) {
					var curStart = parseInt(archiveModal.data('start'), 10);
					var curEnd = parseInt(archiveModal.data('end'));

					var newStart = curStart - box.vars.config.maxShouts;
					var newEnd = curEnd - box.vars.config.maxShouts;

					if (Math.abs(newStart) < (parseInt(box.vars.lastSid, 10) + box.vars.config.maxShouts)) {
						archiveModal.data('start', newStart);
						archiveModal.data('end', newEnd);

						handle.get(archiveModal, handle);
					}
				},
				next: function(archiveModal, handle) {
					var curStart = parseInt(archiveModal.data('start'), 10);
					var curEnd = parseInt(archiveModal.data('end'));

					var newStart = curStart + box.vars.config.maxShouts;
					var newEnd = curEnd + box.vars.config.maxShouts;
					var startLimit = -(box.vars.config.maxShouts - 1);

					if (newStart <= startLimit && newEnd < 0) {
						archiveModal.data('start', newStart);
						archiveModal.data('end', newEnd);

						handle.get(archiveModal, handle);
					}
				},
				get: function(archiveModal, handle) {
					archiveModal.find('#shoutbox-archive-content').html('');
					var curStart = archiveModal.data('start');
					var curEnd = archiveModal.data('end');
					var addShout = handle.addShout;
					socket.emit(box.vars.sockets.get, { start: curStart, end: curEnd }, function(err, shouts) {
						for(var i = 0; i < shouts.length; i++) {
							addShout(archiveModal, shouts[i]);
						}
					});
				},
				addShout: function(archiveModal, shout) {
					if (shout && shout.sid) {
						var archiveContent = archiveModal.find('#shoutbox-archive-content');
						archiveContent.append(box.base.parseShout(shout));
						box.base.scrollToBottom(archiveContent);
					}
				}
			}
		},
		settings: {
			register: function(shoutBox) {
				shoutBox.off('click', '#shoutbox-settings-menu a').on('click', '#shoutbox-settings-menu a', this.handle);
			},
			handle: function(e) {
				var el = $(e.currentTarget),
					statusEl = el.find('span'),
					key = el.attr('id').split(box.vars['settings-prefix'])[1],
					status = statusEl.hasClass('fa-check');
				if (status) {
					statusEl.removeClass('fa-check').addClass('fa-times');
				} else {
					statusEl.removeClass('fa-times').addClass('fa-check');
				}
				box.vars.config.settings[key] = !status;
				socket.emit(box.vars.sockets.save_settings, { key: key, value: !status }, function(err, result) {
					if (err || result === false) {
						app.alertError('Error saving settings!!');
					}
				});
				return false;
			}
		}
	};

	box.sockets = {
		onreceive: {
			register: function() {
				if (socket.listeners(box.vars.sockets.onreceive).length === 0) {
					socket.on(box.vars.sockets.onreceive, this.handle);
				}
			},
			handle: function(data) {
				if (module.base.hasLoaded) {
					module.box.addShout(module.base.getShoutPanel(), data);
					if (data.fromuid !== app.uid) {
						if (box.utils.getSetting('notification')) {
							app.alternatingTitle(box.vars.titleAlert.replace(/%u/g, data.username));
						}
						if (box.utils.getSetting('sound')) {
							$('#shoutbox-sounds-notification')[0].play();
						}
					}
				}
			}
		},
		ondelete: {
			register: function() {
				if (socket.listeners(box.vars.sockets.ondelete).length === 0) {
					socket.on(box.vars.sockets.ondelete, this.handle);
				}
			},
			handle: function(data) {
				$(data.id).remove();
			}
		},
		onedit: {
			register: function() {
				if (socket.listeners(box.vars.sockets.onedit).length === 0) {
					socket.on(box.vars.sockets.onedit, this.handle);
				}
			},
			handle: function(data) {
				$(data.id).find('.shoutbox-shout-content').html('*' + S(data.content).stripTags('p').s);
			}
		}
	}

	return module;
});