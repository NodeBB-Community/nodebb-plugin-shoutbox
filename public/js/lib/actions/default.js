'use strict';

(function (Shoutbox) {
	var DefaultActions = {
		typing: function (sbInstance) {
			this.register = function () {
				sbInstance.dom.container.find('.shoutbox-message-input')
					.off('keyup.typing').on('keyup.typing', utils.throttle(handle, 250));
			};

			function handle() {
				if ($(this).val()) {
					sbInstance.sockets.notifyStartTyping();
				} else {
					sbInstance.sockets.notifyStopTyping();
				}
			}
		},
		overlay: function (sbInstance) {
			this.register = function () {
				sbInstance.dom.overlay
					.off('click.overlay', '.shoutbox-content-overlay-close')
					.on('click.overlay', '.shoutbox-content-overlay-close', handle);
			};

			function handle() {
				sbInstance.dom.overlay.removeClass('active');
				return false;
			}
		},
		scrolling: function (sbInstance) {
			this.register = function () {
				var t;
				var shoutContent = sbInstance.dom.shoutsContainer;

				shoutContent.scroll(function () {
					clearTimeout(t);
					t = setTimeout(function () {
						handle();
					}, 200);
				});

				sbInstance.dom.overlay
					.off('click.overlay', '#shoutbox-content-overlay-scrolldown')
					.on('click.overlay', '#shoutbox-content-overlay-scrolldown', function () {
						shoutContent.scrollTop(
							shoutContent[0].scrollHeight - shoutContent.height()
						);
						return false;
					});
			};

			function handle() {
				var shoutContent = sbInstance.dom.shoutsContainer;
				var shoutOverlay = sbInstance.dom.overlay;
				var scrollHeight = Shoutbox.utils.getScrollHeight(shoutContent);

				var overlayActive = shoutOverlay.hasClass('active');
				var pastScrollBreakpoint = scrollHeight >= sbInstance.vars.scrollBreakpoint;
				var scrollMessageShowing = sbInstance.vars.scrollMessageShowing;

				if (!overlayActive && pastScrollBreakpoint && !scrollMessageShowing) {
					sbInstance.utils.showOverlay(sbInstance.vars.messages.scrolled);
					sbInstance.vars.scrollMessageShowing = true;
				} else if (overlayActive && !pastScrollBreakpoint && scrollMessageShowing) {
					shoutOverlay.removeClass('active');
					sbInstance.vars.scrollMessageShowing = false;
				}
			}
		},
		send: function (sbInstance) {
			this.register = function () {
				sbInstance.dom.textInput.off('keypress.send').on('keypress.send', function (e) {
					if (e.which === 13 && !e.shiftKey) {
						handle();
					}
				});

				sbInstance.dom.sendButton.off('click.send').on('click.send', function () {
					handle();
					return false;
				});
			};

			function handle() {
				var msg = utils.stripHTMLTags(sbInstance.dom.textInput.val());

				if (msg.length) {
					sbInstance.commands.parse(msg, function (msg) {
						sbInstance.sockets.sendShout({ message: msg });
					});
				}

				sbInstance.dom.textInput.val('');
			}
		},
		delete: function (sbInstance) {
			this.register = function () {
				sbInstance.dom.container
					.off('click.delete', '.shoutbox-shout-option-close')
					.on('click.delete', '.shoutbox-shout-option-close', handle);
			};

			function handle() {
				var sid = $(this).parents('[data-sid]').data('sid');

				sbInstance.sockets.removeShout({ sid: sid }, function (err, result) {
					if (result === true) {
						Shoutbox.alert('success', 'Successfully deleted shout!');
					} else if (err) {
						Shoutbox.alert('error', 'Error deleting shout: ' + err.message);
					}
				});

				return false;
			}
		},
		edit: function (sbInstance) {
			var self = this;

			this.register = function () {
				function eventsOff() {
					sbInstance.dom.shoutsContainer
						.off('click.edit', '.shoutbox-shout-option-edit')
						.off('dblclick.edit', '[data-sid]');

					sbInstance.dom.textInput.off('keyup.edit');
				}

				function eventsOn() {
					sbInstance.dom.shoutsContainer
						.on('click.edit', '.shoutbox-shout-option-edit', function () {
							handle(
								$(this).parents('[data-sid]').data('sid')
							);
						}).on('dblclick.edit', '[data-sid]', function () {
							handle(
								$(this).data('sid')
							);
						});

					sbInstance.dom.textInput.on('keyup.edit', function (e) {
						if (e.which === 38 && !$(this).val()) {
							handle(
								sbInstance.dom.shoutsContainer
									.find('[data-uid="' + app.user.uid + '"].shoutbox-shout:last')
									.data('sid')
							);
						}
					});
				}

				sbInstance.dom.textInput.off('textComplete:show').on('textComplete:show', function () {
					eventsOff();
				});

				sbInstance.dom.textInput.off('textComplete:hide').on('textComplete:hide', function () {
					eventsOn();
				});

				eventsOff();
				eventsOn();
			};

			function handle(sid) {
				var shout = sbInstance.dom.shoutsContainer.find('[data-sid="' + sid + '"]');

				if (shout.data('uid') === app.user.uid || app.user.isAdmin || app.user.isGlobalMod) {
					sbInstance.vars.editing = sid;

					sbInstance.sockets.getOriginalShout({ sid: sid }, function (err, orig) {
						if (err) {
							return Shoutbox.alert('error', err);
						}
						orig = orig[0].content;

						sbInstance.dom.sendButton.off('click.send').on('click.send', function () {
							edit(orig);
						}).text('Edit');

						sbInstance.dom.textInput.off('keyup.edit').off('keypress.send').on('keypress.send', function (e) {
							if (e.which === 13 && !e.shiftKey) {
								edit(orig);
							}
						}).on('keyup.edit', function (e) {
							if (e.currentTarget.value.length === 0) {
								self.finish();
							}
						})
							.val(orig)
							.focus()
							.putCursorAtEnd()
							.parents('.input-group')
							.addClass('has-warning');
					});
				}

				function edit(orig) {
					var msg = utils.stripHTMLTags(sbInstance.dom.textInput.val());

					if (msg === orig || msg === '' || msg === null) {
						return self.finish();
					}

					sbInstance.sockets.editShout({ sid: sid, edited: msg }, function (err, result) {
						if (result === true) {
							Shoutbox.alert('success', 'Successfully edited shout!');
						} else if (err) {
							Shoutbox.alert('error', 'Error editing shout: ' + err.message, 3000);
						}
						self.finish();
					});
				}

				return false;
			}

			this.finish = function () {
				sbInstance.dom.textInput.val('').parents('.input-group').removeClass('has-warning');
				sbInstance.dom.sendButton.text('Send').removeClass('hide');

				sbInstance.actions.send.register();
				sbInstance.actions.edit.register();

				sbInstance.vars.editing = 0;
			};
		},
	};

	$(window).on('action:app.load', function () {
		for (var a in DefaultActions) {
			if (DefaultActions.hasOwnProperty(a)) {
				Shoutbox.actions.register(a, DefaultActions[a]);
			}
		}
	});
}(window.Shoutbox));
