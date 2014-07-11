(function(Shoutbox) {
	var Messages = {
		wobble: 'plugins.shoutbox.wobble'
	};

	var Events = {
		onWobble: 'event:shoutbox.wobble'
	};

	var DefaultCommands = {
		wobble: {
			register: function() {
				Shoutbox.sockets.registerMessage('wobble', Messages.wobble);
				Shoutbox.sockets.registerEvent(Events.onWobble, this.handlers.socket);
			},
			handlers: {
				action: function(argument, sendShout) {
					Shoutbox.sockets.wobble({
						victim: utils.slugify(argument)
					});
				},
				socket: function(data) {
					Shoutbox.utils.playSound('wobblysausage');
				}
			}
		}
	};

	for (var c in DefaultCommands) {
		if (DefaultCommands.hasOwnProperty(c)) {
			DefaultCommands[c].register();
			Shoutbox.commands.register(c, DefaultCommands[c].handlers.action);
		}
	}
})(window.Shoutbox);