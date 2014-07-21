(function(Shoutbox) {
	var S, actions = [];

	var DefaultActions = {
		typing: {
			register: function(shoutPanel) {
				shoutPanel.find('#shoutbox-message-input').off('keyup.typing').on('keyup.typing', this.handle);
			},
			handle: function() {
				if ($(this).val()) {
					Shoutbox.sockets.notifyStartTyping();
				} else {
					Shoutbox.sockets.notifyStopTyping();
				}
			}
		},
		overlay: {
			register: function(shoutPanel) {
				var handle = this.handle;
				shoutPanel.find('#shoutbox-content-overlay').off('click.overlay', '.shoutbox-content-overlay-close').on('click.overlay', '.shoutbox-content-overlay-close', function(e){
					handle(shoutPanel);
					return false;
				});
			},
			handle: function(shoutPanel) {
				shoutPanel.find('#shoutbox-content-overlay').removeClass('active');
			}
		},
		scrolling: {
			register: function(shoutPanel) {
				var handle = this.handle,
					t,
					shoutContent = shoutPanel.find('#shoutbox-content'),
					shoutOverlay = shoutPanel.find('#shoutbox-content-overlay');

				shoutContent.scroll(function() {
					clearTimeout(t);
					t = setTimeout(function() {
						handle(shoutPanel);
					}, 200);
				});

				shoutOverlay.off('click.overlay', '#shoutbox-content-overlay-scrolldown').on('click.overlay', '#shoutbox-content-overlay-scrolldown', function(e) {
					shoutContent.scrollTop(
						shoutContent[0].scrollHeight - shoutContent.height()
					);
					return false;
				});
			},
			handle: function(shoutPanel) {
				var shoutContent = shoutPanel.find('#shoutbox-content'),
					shoutOverlay = shoutPanel.find('#shoutbox-content-overlay');

				if (!shoutOverlay.hasClass('active') &&
					(shoutContent[0].scrollHeight - shoutContent.scrollTop()) - shoutContent.height() >= Shoutbox.vars.scrollBreakpoint) {
					Shoutbox.utils.showMessage(Shoutbox.vars.messages.scrolled);
				} else if (shoutOverlay.hasClass('active') &&
					(shoutContent[0].scrollHeight - shoutContent.scrollTop()) - shoutContent.height() < Shoutbox.vars.scrollBreakpoint) {
					shoutOverlay.removeClass('active');
				}
			}
		},
		send: {
			register: function(shoutPanel) {
				var sendMessage = this.handle;

				shoutPanel.find('#shoutbox-message-input').off('keypress.send').on('keypress.send', function(e) {
					if(e.which === 13 && !e.shiftKey) {
						sendMessage(shoutPanel);
					}
				});

				shoutPanel.find('#shoutbox-message-send-btn').off('click.send').on('click.send', function(e){
					sendMessage(shoutPanel);
					return false;
				});
			},
			handle: function(shoutPanel) {
				var msg = S(shoutPanel.find('#shoutbox-message-input').val()).stripTags().trim().s;

				if (msg.length) {
					Shoutbox.commands.parse(msg, function() {
						Shoutbox.sockets.sendShout({ message: msg });
					});
				}
				shoutPanel.find('#shoutbox-message-input').val('');
			}
		},
		delete: {
			register: function(shoutPanel) {
				shoutPanel.off('click.delete', '.shoutbox-shout-option-close').on('click.delete', '.shoutbox-shout-option-close', this.handle);
			},
			handle: function(e) {
				var sid = $(e.currentTarget).parents('[data-sid]').data('sid');

				Shoutbox.sockets.removeShout({ sid: sid }, function (err, result) {
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
			register: function(shoutPanel) {
				var handle = this.handle;

				function eventsOff() {
					shoutPanel.off('click.edit', '.shoutbox-shout-option-edit')
						.off('dblclick.edit', '[data-sid]')
						.find('#shoutbox-message-input').off('keyup.edit');
				}

				function eventsOn() {
					shoutPanel.on('click.edit', '.shoutbox-shout-option-edit', function(e) {
						handle(shoutPanel, $(e.currentTarget).parents('[data-sid]').data('sid'));
					}).on('dblclick.edit', '[data-sid]', function(e) {
						handle(shoutPanel, $(e.currentTarget).data('sid'));
					}).find('#shoutbox-message-input').on('keyup.edit', function(e) {
						if(e.which === 38 && !$(this).val()) {
							handle(shoutPanel, shoutPanel.find('[data-uid="' + app.uid + '"] [data-sid]:last').data('sid'));
						}
					});
				}

				shoutPanel.find('#shoutbox-message-input').off('textComplete:show').on('textComplete:show', function() {
					eventsOff();
				});

				shoutPanel.find('#shoutbox-message-input').off('textComplete:hide').on('textComplete:hide', function() {
					eventsOn();
				});

				eventsOff();
				eventsOn();
			},
			handle: function(shoutPanel, sid) {
				var shout = shoutPanel.find('[data-sid="' + sid + '"]');

				if (shout.parents('[data-uid]').data('uid') === app.uid || app.isAdmin) {
					Shoutbox.vars.editing = sid;

					Shoutbox.sockets.getOriginalShout({ sid: sid }, function(err, orig) {
						shoutPanel.find('#shoutbox-message-send-btn').off('click.send').on('click.send', function(e){
							edit(orig);
						}).text('Edit');

						shoutPanel.find('#shoutbox-message-input').off('keyup.edit').off('keypress.send').on('keypress.send', function(e) {
							if (e.which === 13 && !e.shiftKey) {
								edit(orig);
							}
						}).on('keyup.edit', function(e) {
							if (e.currentTarget.value.length === 0) {
								DefaultActions.edit.finish(shoutPanel);
							}
						}).val(orig).focus().putCursorAtEnd().parents('.input-group').addClass('has-warning');
					});
				}

				function edit(orig) {
					var msg = S(shoutPanel.find('#shoutbox-message-input').val()).stripTags().s;

					if (msg === orig || msg === '' || msg === null) {
						return DefaultActions.edit.finish(shoutPanel);
					}

					Shoutbox.sockets.editShout({ sid: sid, edited: msg }, function (err, result) {
						if (result === true) {
							app.alertSuccess('Successfully edited shout!');
						} else if (err) {
							app.alertError('Error editing shout: ' + err.message, 3000);
						}
						DefaultActions.edit.finish(shoutPanel);
					});
				}

				return false;
			},
			finish: function(shoutPanel) {
				var inputGroup = shoutPanel.find('#shoutbox-message-input').val('').parents('.input-group');
				inputGroup.removeClass('has-warning').find('#shoutbox-message-send-btn').text('Send').removeClass('hide');
				DefaultActions.send.register(shoutPanel);
				DefaultActions.edit.register(shoutPanel);
				Shoutbox.vars.editing = 0;
			}
		}
	};

	require(['string'], function(String) {
		S = String;
	});

	for (var a in DefaultActions) {
		if (DefaultActions.hasOwnProperty(a))
			Shoutbox.actions.register(DefaultActions[a]);
	}

	Shoutbox.actions.finishEdit = DefaultActions.edit.finish;

})(window.Shoutbox);