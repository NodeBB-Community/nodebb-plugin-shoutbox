"use strict";
/*global templates, Mentions, emojiExtended*/

(function(Shoutbox) {
	var Instance = function(container, options) {
		var self = this;

		this.options = options || {};

		setupDom.apply(this, [container]);
		setupVars.apply(this);
		setupDependencies.apply(this);

		this.settings.load();
		getShouts();

		window.sb = this;

		function getShouts() {
			self.sockets.getShouts(function(err, shouts) {
				shouts = shouts.filter(function(el) {
					return el !== null;
				});

				if (shouts.length === 0) {
					self.utils.showOverlay(self.vars.messages.empty);
				} else {
					self.addShouts(shouts);
				}
			});
		}
	};

	function setupDependencies() {
		this.utils = Shoutbox.utils.init(this);
		this.sockets = Shoutbox.sockets.init(this);
		this.settings = Shoutbox.settings.init(this);
		this.actions = Shoutbox.actions.init(this);
		this.commands = Shoutbox.commands.init(this);
	}

	Instance.prototype.addShouts = function(shouts) {
		var self = this,
			lastUid = this.vars.lastUid,
			lastSid = this.vars.lastSid,
			timeStampUpdates = {},
			uid, sid;

		shouts = shouts.map(function(el) {
			uid = parseInt(el.fromuid, 10);
			sid = parseInt(el.sid, 10);

			// Own shout
			el.isOwn = parseInt(app.user.uid, 10) === uid;

			// Permissions
			el.user.isMod = el.isOwn || app.user.isAdmin || app.user.isGlobalMod;

			// Add shout chain information to shout
			el.isChained = lastUid === uid;

			// Add timeString to shout
			// jQuery.timeago only works properly with ISO timestamps
			el.timeString = (new Date(parseInt(el.timestamp, 10)).toISOString());

			// Do we need to update the user timestamp?
			if (el.isChained) {
				if (timeStampUpdates[lastSid]) {
					delete timeStampUpdates[lastSid];
				}

				timeStampUpdates[sid] = el.timeString;
			}

			// Extra classes
			el.typeClasses = el.isOwn ? "shoutbox-shout-self " : "";
			el.typeClasses += el.user.isAdmin ? "shoutbox-shout-admin " : "";

			lastUid = uid;
			lastSid = sid;

			return el;
		});

		this.vars.lastUid = lastUid;
		this.vars.lastSid = lastSid;

		templates.parse('shoutbox/shouts', {
			shouts: shouts
		}, function(html) {
			self.dom.shoutsContainer.append(html);
			self.utils.scrollToBottom(shouts.length > 1);

			// Chaos begins here
			if (Object.keys(timeStampUpdates).length > 0) {
				// Get all the user elements that belong to the sids that need their timestamp updated
				var userElements = $('[data-sid]').filter(function() {
					return timeStampUpdates[$(this).data('sid')] !== undefined;
				}).prevUntil('.shoutbox-avatar', '.shoutbox-user');

				var i = 0;
				for (var sid in timeStampUpdates) {
					if (timeStampUpdates.hasOwnProperty(sid)) {
						userElements.eq(i).find('span.timeago')
							.attr('title', timeStampUpdates[sid])
							.data('timeago', null)
							.addClass('timeago-update');

						i++;
					}
				}
			}

			if (jQuery.timeago) {
				$('.timeago-update').removeClass('timeago-update').timeago();
			}
		});
	};

	Instance.prototype.updateUserStatus = function(uid, status) {
		var self = this;

		var getStatus = function(uid) {
			self.sockets.getUserStatus(uid, function(err, data) {
				setStatus(uid, data.status);
			});
		};

		var setStatus = function(uid, status) {
			self.dom.shoutsContainer.find('[data-uid="' + uid + '"].shoutbox-avatar').removeClass().addClass('shoutbox-avatar ' + status);
		};

		if (!uid) {
			uid = [];

			self.dom.shoutsContainer.find('[data-uid].shoutbox-avatar').each(function(index, el){
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
	};

	Instance.prototype.showUserPanel = function() {
		this.dom.onlineUsers.parent().removeClass('hidden');
	};

	Instance.prototype.hideUserPanel = function() {
		this.dom.onlineUsers.parent().addClass('hidden');
	};

	Instance.prototype.startUserPanelUpdater = function() {
		var self = this;

		update();

		function update() {
			this.sockets.getUsers({ set: 'users:online', after: 0 }, function(err, data) {
				var userCount = data.users.length,
					usernames = data.users.map(function(i) {
						return (i.username === null ? 'Anonymous' : i.username);
					}),
					userString = usernames.join('; ');

				self.dom.onlineUsers.find('.panel-body').text(userString);
				self.dom.onlineUsers.find('.panel-title').text('Users (' + userCount + ')');
			});

			setInterval(update, 10000);
		}
	};

	function setupDom(container) {
		var self = this;

		this.dom = {};
		this.dom.container = container;
		this.dom.overlay = container.find('.shoutbox-content-overlay');
		this.dom.overlayMessage = this.dom.overlay.find('.shoutbox-content-overlay-message');
		this.dom.shoutsContainer = container.find('.shoutbox-content');
		this.dom.settingsMenu = container.find('.shoutbox-settings-menu');
		this.dom.textInput = container.find('.shoutbox-message-input');
		this.dom.sendButton = container.find('.shoutbox-message-send-btn');
		this.dom.onlineUsers = container.parents('.shoutbox-row').find('.shoutbox-users');

		//Add mentions autofill
		if (typeof window.Mentions !== 'undefined' && typeof window.Mentions.addAutofill !== 'undefined') {
			window.Mentions.addAutofill(this.dom.textInput, []);
		}

		//Add emoji autocomplete
		function addEmoji(emoji) {
			emoji.addCompletion(self.dom.textInput);
		}

		if (typeof window.emojiExtended !== 'undefined') {
			addEmoji(window.emojiExtended);
		} else {
			$(window).one('emoji-extended:initialized', addEmoji);
		}

		if (this.options.showUserPanel) {
			this.showUserPanel();
			this.startUserPanelUpdater();
		}
	}

	function setupVars() {
		this.vars = {
			lastUid: -1,
			lastSid: -1,
			scrollBreakpoint: 50,
			messages: {
				alert: '[ %u ] - new shout!',
				empty: 'The shoutbox is empty, start shouting!',
				scrolled: '<a href="#" id="shoutbox-content-overlay-scrolldown">Scroll down</a>'
			},
			userCheck: 0
		};
	}

	Shoutbox.base = {
		init: function(container, options) {
			return new Instance(container, options);
		}
	};

})(window.Shoutbox);
