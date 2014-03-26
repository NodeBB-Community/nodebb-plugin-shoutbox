define(['string'], function(S) {
	var sb;

	var Actions = {
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
				var msg = S(shoutBox.find('#shoutbox-message-input').val()).stripTags().trim().s;
				if(msg.length) {
					socket.emit(sb.config.sockets.send, { message:msg });
				}
				shoutBox.find('#shoutbox-message-input').val('');
			}
		},
		delete: {
			register: function(shoutBox) {
				shoutBox.off('click', '.shoutbox-shout-option-close').on('click', '.shoutbox-shout-option-close', this.handle);
			},
			handle: function(e) {
				var sid = $(e.currentTarget).parents('[data-sid]').data('sid');
				socket.emit(sb.config.sockets.remove, { sid: sid }, function (err, result) {
					if (result === true) {
						app.alertSuccess('Successfully deleted shout!');
					} else if (err) {
						app.alertError('Error deleting shout: ' + err.message, 3000);
					}
				});
				return false;
			}
		},
		edit: {
			register: function(shoutBox) {
				var handle = this.handle;
				shoutBox.off('click', '.shoutbox-shout-option-edit').on('click', '.shoutbox-shout-option-edit', function(e) {
					handle(shoutBox, $(e.currentTarget).parents('[data-sid]').data('sid'));
				});
				shoutBox.off('dblclick', '[data-sid]').on('dblclick', '[data-sid]', function(e) {
					handle(shoutBox, $(e.currentTarget).data('sid'));
				});
				shoutBox.find('#shoutbox-message-input').off('keyup').on('keyup', function(e) {
					if(e.which === 38) {
						handle(shoutBox, shoutBox.find('[data-uid="' + app.uid + '"] [data-sid]:last').data('sid'));
					}
				});
			},
			handle: function(shoutBox, sid) {
				var shout = shoutBox.find('[data-sid="' + sid + '"]');

				if (shout.parents('[data-uid]').data('uid') === app.uid || app.isAdmin) {
					Actions.edit.editing = sid;
					socket.emit(sb.config.sockets.getOriginalShout, { sid: sid }, function(err, orig) {
						shoutBox.find('#shoutbox-message-send-btn').off('click').on('click', function(e){
							edit(orig);
						}).text('Edit');
						shoutBox.find('#shoutbox-message-input').off('keyup').off('keypress').on('keypress', function(e) {
							if (e.which === 13 && !e.shiftKey) {
								edit(orig);
							}
						}).on('keyup', function(e) {
							if (e.currentTarget.value.length === 0) {
								Actions.edit.finish(shoutBox);
							}
						}).val(orig).focus().putCursorAtEnd().parent().addClass('has-warning');
					});
				}

				function edit(orig) {
					var msg = S(shoutBox.find('#shoutbox-message-input').val()).stripTags().s;
					if (msg === orig || msg === '' || msg === null) {
						return Actions.edit.finish(shoutBox);
					}
					socket.emit(sb.config.sockets.edit, { sid: sid, edited: msg }, function (err, result) {
						if (result === true) {
							app.alertSuccess('Successfully edited shout!');
						} else if (err) {
							app.alertError('Error editing shout: ' + err.message, 3000);
						}
						Actions.edit.finish(shoutBox);
					});
				}

				return false;
			},
			finish: function(shoutBox) {
				var parent = shoutBox.find('#shoutbox-message-input').parent();
				parent.removeClass('has-warning').find('#shoutbox-message-send-btn').removeClass('hide');
				parent.find('#shoutbox-message-send-btn').text('Send');
				parent.find('#shoutbox-message-input').val('');
				Actions.send.register(shoutBox);
				Actions.edit.register(shoutBox);
				Actions.edit.editing = 0;
			},
			editing: 0
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
						var input = sb.base.getShoutPanel().find('#shoutbox-message-input');
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
					archiveModal = $('#shoutbox-archive-modal');

				shoutBox.find('#shoutbox-button-archive').off('click').on('click', function(e) {
					handle.show(archiveModal, handle);
				});
				archiveModal.find('#shoutbox-button-archive-prev').off('click').on('click', function(e) {
					handle.prev(archiveModal, handle);
				});
				archiveModal.find('#shoutbox-button-archive-next').off('click').on('click', function(e) {
					handle.next(archiveModal, handle);
				});
			},
			handle: {
				show: function(archiveModal, handle) {
					archiveModal.modal('show');
					if (!archiveModal.data('start')) {
						archiveModal.data('start', (-(sb.config.vars.shoutLimit - 1)).toString());
						archiveModal.data('end', '-1');
					}
					handle.get(archiveModal, handle);
				},
				prev: function(archiveModal, handle) {
					var start = parseInt(archiveModal.data('start'), 10) - sb.config.vars.shoutLimit,
						end = parseInt(archiveModal.data('end'), 10) - sb.config.vars.shoutLimit;

					if (Math.abs(start) < (parseInt(sb.config.vars.lastSid, 10) + sb.config.vars.shoutLimit)) {
						archiveModal.data('start', start);
						archiveModal.data('end', end);

						handle.get(archiveModal, handle);
					}
				},
				next: function(archiveModal, handle) {
					var start = parseInt(archiveModal.data('start'), 10) + sb.config.vars.shoutLimit,
						end = parseInt(archiveModal.data('end'), 10) + sb.config.vars.shoutLimit,
						startLimit = -(sb.config.vars.shoutLimit - 1);

					if (start <= startLimit && end < 0) {
						archiveModal.data('start', start);
						archiveModal.data('end', end);

						handle.get(archiveModal, handle);
					}
				},
				get: function(archiveModal, handle) {
					archiveModal.find('#shoutbox-archive-content').html('');
					var start = archiveModal.data('start'),
						end = archiveModal.data('end');

					socket.emit(sb.config.sockets.get, { start: start, end: end }, function(err, shouts) {
						for(var i = 0; i < shouts.length; i++) {
							handle.addShout(archiveModal, shouts[i]);
						}
						archiveModal.find('.shoutbox-shout-options').remove();
					});
				},
				addShout: function(archiveModal, shout) {
					if (shout && shout.sid) {
						var archiveContent = archiveModal.find('#shoutbox-archive-content');
						if (shout.fromuid === archiveContent.find('[data-uid]:last').data('uid')) {
							archiveContent.find('[data-sid]:last').after(sb.utils.parseShout(shout, true));
						} else {
							archiveContent.append(sb.utils.parseShout(shout));
						}
						sb.base.scrollToBottom(archiveContent);
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
				sb.config.settings[key] = !status;
				socket.emit(sb.config.sockets.saveSettings, { key: key, value: status }, function(err, result) {
					if (err || result === false) {
						app.alertError('Error saving settings!');
					}
				});
				return false;
			}
		}
	};

	return function(Shoutbox) {
		Shoutbox.actions = Actions;
		sb = Shoutbox;
	};
});