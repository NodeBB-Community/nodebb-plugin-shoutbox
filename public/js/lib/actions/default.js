(function(Shoutbox) {
	var S, actions = [];

	Shoutbox.actions = {
		register: function(obj) {
			actions.push(obj);
		},
		initialize: function(shoutPanel) {
			for (var a in actions) {
				if (actions.hasOwnProperty(a)) {
					actions[a].register(shoutPanel);
				}
			}
		}
	};

	var DefaultActions = {
		send: {
			register: function(shoutPanel) {
				var sendMessage = this.handle;

				shoutPanel.find('#shoutbox-message-input').off('keypress').on('keypress', function(e) {
					if(e.which === 13 && !e.shiftKey) {
						sendMessage(shoutPanel);
					}
				});

				shoutPanel.find('#shoutbox-message-send-btn').off('click').on('click', function(e){
					sendMessage(shoutPanel);
					return false;
				});
			},
			handle: function(shoutPanel) {
				var msg = S(shoutPanel.find('#shoutbox-message-input').val()).stripTags().trim().s;

				if (msg.length) {
					Shoutbox.sockets.sendShout({ message: msg });
				}
				shoutPanel.find('#shoutbox-message-input').val('');
			}
		},
		delete: {
			register: function(shoutPanel) {
				shoutPanel.off('click', '.shoutbox-shout-option-close').on('click', '.shoutbox-shout-option-close', this.handle);
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

				shoutPanel.off('click', '.shoutbox-shout-option-edit').on('click', '.shoutbox-shout-option-edit', function(e) {
					handle(shoutPanel, $(e.currentTarget).parents('[data-sid]').data('sid'));
				});

				shoutPanel.off('dblclick', '[data-sid]').on('dblclick', '[data-sid]', function(e) {
					handle(shoutPanel, $(e.currentTarget).data('sid'));
				});

				shoutPanel.find('#shoutbox-message-input').off('keyup').on('keyup', function(e) {
					if(e.which === 38) {
						handle(shoutPanel, shoutPanel.find('[data-uid="' + app.uid + '"] [data-sid]:last').data('sid'));
					}
				});
			},
			handle: function(shoutPanel, sid) {
				var shout = shoutPanel.find('[data-sid="' + sid + '"]');

				if (shout.parents('[data-uid]').data('uid') === app.uid || app.isAdmin) {
					Shoutbox.vars.editing = sid;

					Shoutbox.sockets.getOriginalShout({ sid: sid }, function(err, orig) {
						shoutPanel.find('#shoutbox-message-send-btn').off('click').on('click', function(e){
							edit(orig);
						}).text('Edit');

						shoutPanel.find('#shoutbox-message-input').off('keyup').off('keypress').on('keypress', function(e) {
							if (e.which === 13 && !e.shiftKey) {
								edit(orig);
							}
						}).on('keyup', function(e) {
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