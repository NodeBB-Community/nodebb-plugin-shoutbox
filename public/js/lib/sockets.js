'use strict';

(function (Shoutbox) {
	const Messages = {
		getShouts: 'plugins.shoutbox.get',
		sendShout: 'plugins.shoutbox.send',
		removeShout: 'plugins.shoutbox.remove',
		editShout: 'plugins.shoutbox.edit',
		notifyStartTyping: 'plugins.shoutbox.startTyping',
		notifyStopTyping: 'plugins.shoutbox.stopTyping',
		getOriginalShout: 'plugins.shoutbox.getPlain',
		saveSettings: 'plugins.shoutbox.saveSetting',
		getSettings: 'plugins.shoutbox.getSettings',
		getUsers: 'user.loadMore',
		getUserStatus: 'user.checkStatus',
	};

	const Events = {
		onUserStatusChange: 'event:user_status_change',
		onReceive: 'event:shoutbox.receive',
		onDelete: 'event:shoutbox.delete',
		onEdit: 'event:shoutbox.edit',
		onStartTyping: 'event:shoutbox.startTyping',
		onStopTyping: 'event:shoutbox.stopTyping',
	};

	const Handlers = {
		defaultSocketHandler: function (message) {
			const self = this;
			this.message = message;

			return function (data, callback) {
				if (typeof data === 'function') {
					callback = data;
					data = null;
				}

				socket.emit(self.message, data, callback);
			};
		},
	};

	const Sockets = function (sbInstance) {
		this.sb = sbInstance;

		this.messages = Messages;
		this.events = Events;
		// TODO: move this into its own file?
		this.handlers = {
			onReceive: function (data) {
				sbInstance.addShouts(data);

				if (parseInt(data[0].fromuid, 10) !== app.user.uid) {
					sbInstance.utils.notify(data[0]);
				}
			},
			onDelete: function (data) {
				const shout = $('[data-sid="' + data.sid + '"]');
				const uid = shout.data('uid');

				const prevUser = shout.prev('[data-uid].shoutbox-user');
				const prevUserUid = parseInt(prevUser.data('uid'), 10);

				const nextShout = shout.next('[data-uid].shoutbox-shout');
				const nextShoutUid = parseInt(nextShout.data('uid'), 10);

				const prevUserIsSelf = prevUser.length > 0 && prevUserUid === parseInt(uid, 10);
				const nextShoutIsSelf = nextShout.length > 0 && nextShoutUid === parseInt(uid, 10);

				if (shout.length > 0) {
					shout.remove();
				}

				if (prevUserIsSelf && !nextShoutIsSelf) {
					prevUser.prev('.shoutbox-avatar').remove();
					prevUser.remove();

					const lastShout = sbInstance.dom.shoutsContainer.find('[data-sid]:last');
					if (lastShout.length > 0) {
						sbInstance.vars.lastUid = parseInt(lastShout.data('uid'), 10);
						sbInstance.vars.lastSid = parseInt(lastShout.data('sid'), 10);
					} else {
						sbInstance.vars.lastUid = -1;
						sbInstance.vars.lastSid = -1;
					}
				}

				if (parseInt(data.sid, 10) === parseInt(sbInstance.vars.editing, 10)) {
					sbInstance.actions.edit.finish();
				}
			},
			onEdit: function (data) {
				$('[data-sid="' + data[0].sid + '"] .shoutbox-shout-text')
					.html(data[0].content).addClass('shoutbox-shout-edited');
			},
			onUserStatusChange: function (data) {
				sbInstance.updateUserStatus(data.uid, data.status);
			},
			onStartTyping: function (data) {
				$('[data-uid="' + data.uid + '"].shoutbox-avatar').addClass('isTyping');
			},
			onStopTyping: function (data) {
				$('[data-uid="' + data.uid + '"].shoutbox-avatar').removeClass('isTyping');
			},
		};

		for (const e of Object.keys(this.events)) {
			this.registerEvent(this.events[e], this.handlers[e]);
		}

		for (const m of Object.keys(this.messages)) {
			this.registerMessage(m, this.messages[m]);
		}
	};

	Sockets.prototype.registerMessage = function (handle, message) {
		if (!this.hasOwnProperty(handle)) {
			this[handle] = new Handlers.defaultSocketHandler(message);
		}
	};

	Sockets.prototype.registerEvent = function (event, handler) {
		socket.on(event, handler);
	};

	Shoutbox.sockets = {
		init: function (instance) {
			return new Sockets(instance);
		},
	};
}(window.Shoutbox));
