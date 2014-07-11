(function(Shoutbox) {
	var Base = {
		initialize: function(url, shoutPanel) {
			Base.vars.shoutPanel = shoutPanel;
			if (!Shoutbox.utils.isAnon()) {
				Shoutbox.utils.initialize(shoutPanel, function() {
					Base.getShouts(shoutPanel);

					//Add mentions autofill
					if (typeof Mentions !== 'undefined' && typeof Mentions.addAutofill !== 'undefined') {
						Mentions.addAutofill(shoutPanel.find('#shoutbox-message-input'), []);
					}

					//Add emoji autocomplete
					function addEmoji(emoji) {
						emoji.addCompletion(shoutPanel.find('#shoutbox-message-input'));
					}

					if (typeof emojiExtended !== 'undefined') {
						addEmoji(emojiExtended);
					} else {
						$(window).one('emoji-extended:initialized', addEmoji);
					}

					if (url === 'shoutbox') {
						Shoutbox.base.showUserPanel();
					}
				});
			}
		},
		addShout: function(shout, shoutPanel) {
			if (shout && shout.sid) {
				var shoutContent = shoutPanel.find('#shoutbox-content');

				// add timeString to shout
				// jQuery.timeago only works properly with ISO timestamps
				shout.timeString = (new Date( parseInt( shout.timestamp, 10 ) ).toISOString() );

				if (parseInt(shout.fromuid, 10) === shoutContent.find('[data-uid]:last').data('uid')) {
					shoutContent.find('[data-sid]:last').after(Shoutbox.utils.parseShout(shout, true));
				} else {
					shoutContent.append(Shoutbox.utils.parseShout(shout));
				}

				// We need to update the timestring on every new activity. Shout.tpl is only parsed for the shout of a
				// chain breaking user, after that only text.tpl is parsed.
				shoutContent.find('[data-uid="' + shout.fromuid + '"] span.timeago').attr('title', shout.timeString);

				// execute jQuery.timeago() on shout's span.timeago
				if (jQuery.timeago) {
					// Reset timeago to use the new timestamp
					shoutContent.find('[data-uid="' + shout.fromuid + '"] span.timeago').data('timeago', null).timeago();
				}
				// else span.timeago text will be empty, but timeString will appear on hover <-- see templates/shoutbox/shout.tpl

				Shoutbox.utils.scrollToBottom(shoutContent);
				Shoutbox.vars.lastSid = shout.sid;
			}
		},
		getShouts: function(shoutPanel) {
			Shoutbox.sockets.getShouts(function(err, shouts) {
				if (shouts.length === 0) {
					Shoutbox.utils.showMessage(Shoutbox.vars.messages.empty, shoutPanel);
				} else {
					for(var i = 0; i < shouts.length; i++) {
						Shoutbox.base.addShout(shouts[i], shoutPanel);
					}
				}
			});
		},
		updateUserStatus: function(uid, status, shoutPanel) {
			var getStatus = function(uid) {
				Shoutbox.sockets.getUserStatus(uid, function(err, data) {
					setStatus(uid, data.status);
				});
			};

			var setStatus = function(uid, status) {
				shoutPanel.find('[data-uid="' + uid + '"] .shoutbox-shout-avatar').removeClass().addClass('shoutbox-shout-avatar ' + status);
			};

			if (!uid) {
				uid = [];
				shoutPanel.find('[data-uid]').each(function(index, el){
					uid.push($(el).data('uid'))
				});
				uid = uid.filter(function(el, index) {
					return uid.indexOf(el) === index;
				});
			}

			if (!status) {
				if (typeof(uid) === 'number') {
					getStatus(uid);
				} else if (Array.isArray(uid)) {
					for (var i = 0, l = uid.length; i < l; i++) {
						getStatus(uid[i]);
					}
				}
			} else {
				if (typeof(uid) === 'number') {
					setStatus(uid, status);
				} else if (Array.isArray(uid)) {
					for (var i = 0, l = uid.length; i < l; i++) {
						setStatus(uid[i], status);
					}
				}
			}
		},
		updateUsers: function() {
			Shoutbox.sockets.getUsers({ set: 'users:online', after: 0 }, function(err, data) {
				var userCount = data.users.length,
					usernames = data.users.map(function(i) {
						return (i.username === null ? 'Anonymous' : i.username);
					}),
					userString = usernames.join('; ');

				Shoutbox.base.getUsersPanel().find('.panel-body').text(userString);
				Shoutbox.base.getUsersPanel().find('.panel-title').text('Users (' + userCount + ')');
			});

			if(Shoutbox.base.userCheck === 0) {
				Shoutbox.base.userCheck = setInterval(function() {
					Shoutbox.base.updateUsers();
				}, 10000);
			}
		},
		showUserPanel: function() {
			Base.getUsersPanel().parent().removeClass('hidden');
			Base.updateUsers();
		},
		getShoutPanel: function() {
			return Base.vars.shoutPanel || $('#shoutbox');
		},
		getUsersPanel: function() {
			return $('#shoutbox-users');
		},
		vars: {
			shoutPanel: null,
			userCheck: 0
		}
	};

	Shoutbox.base = {
		initialize: Base.initialize,
		addShout: Base.addShout,
		getShoutPanel: Base.getShoutPanel,
		updateUserStatus: Base.updateUserStatus
	};
})(window.Shoutbox);
