define(['string'], function(S) {
	var Base, Utils, Config;

	var Actions = {
		init: function(base, utils, config, callback) {
			//todo I hate this
			Base = base; Utils = utils; Config = config;
			callback();
		},
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
					socket.emit(Config.sockets.send, { message:msg });
					shoutBox.find('#shoutbox-message-input').val('');
				}
			}
		},
		delete: {
			register: function(shoutBox) {
				shoutBox.off('click', '.shoutbox-shout-option-close').on('click', '.shoutbox-shout-option-close', this.handle);
			},
			handle: function(e) {
				var sid = $(e.currentTarget).parents('[data-sid]').data('sid');
				socket.emit(Config.sockets.remove, { sid: sid }, function (err, result) {
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
				shoutBox.off('dblclick', '[data-sid]').on('dblclick', '[data-sid]', function(e) {
					handle(shoutBox, $(e.currentTarget).data('sid'));
				});
				shoutBox.find('#shoutbox-message-input').on('keypress', function(e) {
					if(e.keyCode === 38) {
						handle(shoutBox, shoutBox.find('[data-uid="' + app.uid + '"] [data-sid]:last').data('sid'));
					}
				});
			},
			handle: function(shoutBox, sid) {
				var shout,
					parent = shoutBox.find('#shoutbox-message-input').parent(),
					shout = shoutBox.find('[data-sid="' + sid + '"]');

				if (shout.parents('[data-uid]').data('uid') === app.uid || app.isAdmin) {
					socket.emit(Config.sockets.getOriginalShout, { sid: sid }, function(err, orig) {
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
				}

				function edit(orig) {
					var msg = S(parent.find('#shoutbox-message-input').val()).stripTags().s;
					if (msg === orig || msg === '' || msg === null) {
						return finish();
					}
					socket.emit(Config.sockets.edit, { sid: sid, edited: msg }, function (err, result) {
						if (result === true) {
							app.alertSuccess('Successfully edited shout!');
						} else if (err) {
							app.alertError('Error editing shout: ' + err.message, 3000);
						}
						finish();
					});
				}

				function finish() {
					parent.removeClass('has-warning').find('#shoutbox-message-send-btn').removeClass('hide');
					parent.find('#shoutbox-message-send-btn').text('Send');
					parent.find('#shoutbox-message-input').val('');
					Actions.send.register(shoutBox);
					Actions.edit.register(shoutBox);
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
				'create': function(code, gistModal) {
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
						var input = Base.getShoutPanel().find('#shoutbox-message-input');
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
					return app.alertError('Currently disabled');
					archiveModal.modal('show');
					if (!archiveModal.data('start')) {
						archiveModal.data('start', (-(Config.vars.shoutLimit - 1)).toString());
						archiveModal.data('end', '-1');
					}
					handle.get(archiveModal, handle);
				},
				prev: function(archiveModal, handle) {
					var curStart = parseInt(archiveModal.data('start'), 10);
					var curEnd = parseInt(archiveModal.data('end'));

					var newStart = curStart - Config.vars.shoutLimit;
					var newEnd = curEnd - Config.vars.shoutLimit;

					if (Math.abs(newStart) < (parseInt(Config.vars.lastSid, 10) + Config.vars.shoutLimit)) {
						archiveModal.data('start', newStart);
						archiveModal.data('end', newEnd);

						handle.get(archiveModal, handle);
					}
				},
				next: function(archiveModal, handle) {
					var curStart = parseInt(archiveModal.data('start'), 10);
					var curEnd = parseInt(archiveModal.data('end'));

					var newStart = curStart + Config.vars.shoutLimit;
					var newEnd = curEnd + Config.vars.shoutLimit;
					var startLimit = -(Config.vars.shoutLimit - 1);

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
					socket.emit(Config.sockets.get, { start: curStart, end: curEnd }, function(err, shouts) {
						for(var i = 0; i < shouts.length; i++) {
							addShout(archiveModal, shouts[i]);
						}
					});
				},
				addShout: function(archiveModal, shout) {
					if (shout && shout.sid) {
						var archiveContent = archiveModal.find('#shoutbox-archive-content');
						archiveContent.append(Utils.parseShout(shout));
						Base.scrollToBottom(archiveContent);
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
					key = el.attr('id').split('shoutbox-settings-')[1],
					status = statusEl.hasClass('fa-check');
				if (status) {
					statusEl.removeClass('fa-check').addClass('fa-times');
					status = 0;
				} else {
					statusEl.removeClass('fa-times').addClass('fa-check');
					status = 1;
				}
				Config.settings[key] = !status;
				socket.emit(Config.sockets.saveSettings, { key: key, value: status }, function(err, result) {
					if (err || result === false) {
						app.alertError('Error saving settings!');
					}
				});
				return false;
			}
		}
	};

	return Actions;
});