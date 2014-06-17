(function(Shoutbox) {
	var S;

	function initialise() {
		require(['string'], function(String) {
			S = String;
		});
	}

	initialise();

	var Actions = {
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
								Actions.edit.finish(shoutPanel);
							}
						}).val(orig).focus().putCursorAtEnd().parent().addClass('has-warning');
					});
				}

				function edit(orig) {
					var msg = S(shoutPanel.find('#shoutbox-message-input').val()).stripTags().s;

					if (msg === orig || msg === '' || msg === null) {
						return Actions.edit.finish(shoutPanel);
					}

					Shoutbox.sockets.editShout({ sid: sid, edited: msg }, function (err, result) {
						if (result === true) {
							app.alertSuccess('Successfully edited shout!');
						} else if (err) {
							app.alertError('Error editing shout: ' + err.message, 3000);
						}
						Actions.edit.finish(shoutPanel);
					});
				}

				return false;
			},
			finish: function(shoutPanel) {
				var parent = shoutPanel.find('#shoutbox-message-input').parent();
				parent.removeClass('has-warning').find('#shoutbox-message-send-btn').removeClass('hide');
				parent.find('#shoutbox-message-send-btn').text('Send');
				parent.find('#shoutbox-message-input').val('');
				Actions.send.register(shoutPanel);
				Actions.edit.register(shoutPanel);
				Shoutbox.vars.editing = 0;
			}
		},
		gist: {
			register: function(shoutPanel) {
				var show = this.handle.show,
					create = this.handle.create,
					gistModal = $('#shoutbox-modal-gist');

				shoutPanel.find('#shoutbox-button-gist').off('click').on('click', function(e) {
					show(gistModal);
				});

				gistModal.find('#shoutbox-button-create-gist-submit').off('click').on('click', function(e) {
					create(gistModal.find('textarea').val(), gistModal, shoutPanel);
				});
			},
			handle: {
				show: function(gistModal) {
					gistModal.modal('show');
				},
				create: function(code, gistModal, shoutPanel) {
					if (app.uid === null) {
						gistModal.modal('hide');
						app.alertError('Only registered users can create Gists!', 3000);
						return;
					}

					var json = {
						"description": "Gist created from NodeBB shoutbox",
						"public": true,
						"files": {
							"file1.txt": {
								"content": code
							}
						}
					};

					$.post('https://api.github.com/gists', JSON.stringify(json), function(data) {
						gistModal.modal('hide');
						var input = shoutPanel.find('#shoutbox-message-input');
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
			register: function(shoutPanel) {
				var handle = this.handle,
					archiveModal = $('#shoutbox-archive-modal');

				shoutPanel.find('#shoutbox-button-archive').off('click').on('click', function(e) {
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
						archiveModal.data('start', (-(Shoutbox.settings.get('shoutLimit') - 1)).toString());
						archiveModal.data('end', '-1');
					}
					handle.get(archiveModal, handle);
				},
				prev: function(archiveModal, handle) {
					var shoutLimit = Shoutbox.settings.get('shoutLimit'),
						start = parseInt(archiveModal.data('start'), 10) - shoutLimit,
						end = parseInt(archiveModal.data('end'), 10) - shoutLimit;

					if (Math.abs(start) < (parseInt(Shoutbox.vars.lastSid, 10) + shoutLimit)) {
						archiveModal.data('start', start);
						archiveModal.data('end', end);

						handle.get(archiveModal, handle);
					}
				},
				next: function(archiveModal, handle) {
					var shoutLimit = Shoutbox.settings.get('shoutLimit'),
						start = parseInt(archiveModal.data('start'), 10) + shoutLimit,
						end = parseInt(archiveModal.data('end'), 10) + shoutLimit,
						startLimit = -(shoutLimit - 1);

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

					Shoutbox.sockets.getShouts({ start: start, end: end }, function(err, shouts) {
						for(var i = 0; i < shouts.length; i++) {
							handle.addShout(shouts[i], archiveModal);
						}
						archiveModal.find('.shoutbox-shout-options').remove();
					});
				},
				addShout: function(shout, archiveModal) {
					if (shout && shout.sid) {
						var archiveContent = archiveModal.find('#shoutbox-archive-content');
						if (parseInt(shout.fromuid, 10) === archiveContent.find('[data-uid]:last').data('uid')) {
							archiveContent.find('[data-sid]:last').after(Shoutbox.utils.parseShout(shout, true));
						} else {
							archiveContent.append(Shoutbox.utils.parseShout(shout));
						}
						Shoutbox.utils.scrollToBottom(archiveContent);
					}
				}
			}
		},
		bug: {
			register: function(shoutPanel) {
				shoutPanel.find('#shoutbox-button-bug').off('click').on('click', this.handle);
			},
			handle: function(e) {
				window.open('https://github.com/Schamper/nodebb-plugin-shoutbox/issues/new', '_blank').focus();
			}
		},
		settings: {
			register: function(shoutPanel) {
				shoutPanel.off('click', '#shoutbox-settings-menu a').on('click', '#shoutbox-settings-menu a', this.handle);
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

				Shoutbox.settings.set(key, status);

				return false;
			}
		},
		hide: {
			register: function(shoutPanel) {
				shoutPanel.off('click', '#shoutbox-settings-hide').on('click', '#shoutbox-settings-hide', this.handle);
			},
			handle: function(e) {
				var el = $(e.currentTarget).find('span'),
					body = el.parents('#shoutbox');

				if (el.hasClass('fa-arrow-up')) {
					body.slideUp();
					el.removeClass('fa-arrow-up').addClass('fa-arrow-down');
					Shoutbox.settings.set('hide', 1);
				} else {
					body.slideDown();
					el.removeClass('fa-arrow-down').addClass('fa-arrow-up');
					Shoutbox.settings.set('hide', 0);
				}
			}
		}
	};

	Shoutbox.actions = {
		finishEdit: Actions.edit.finish,
		registerHandlers: function(shoutPanel) {
			for (var a in Actions) {
				if (Actions.hasOwnProperty(a)) {
					Actions[a].register(shoutPanel);
				}
			}
		}
	};
})(window.Shoutbox);