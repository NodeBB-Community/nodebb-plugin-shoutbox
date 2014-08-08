(function(Shoutbox) {
	var SocketMessages = {
		wobble: 'plugins.shoutbox.wobble'
	};

	var SocketEvents = {
		onWobble: 'event:shoutbox.wobble'
	};

	var ArgumentHandlers = {
		username: function(argument) {
			if (argument.indexOf('@') === 0) {
				argument = argument.slice(1);
			}

			return utils.slugify(argument);
		}
	};

	var DefaultCommands = {
		help: {
			info: {
				usage: '/help',
				description: 'Displays the available commands'
			},
			handlers: {
				action: function(argument, sendShout) {
					var message = '<strong>Available commands:</strong><br>',
						commands = Shoutbox.commands.get();

					for (var c in commands) {
						if (commands.hasOwnProperty(c)) {
							message += commands[c].usage + ' - ' + commands[c].description + '<br>';
						}
					}

					Shoutbox.utils.showMessage(message);
				}
			}
		},
		wobble: {
			info: {
				usage: '/wobble &lt;username&gt;',
				description: 'WOBULLY SASUGE'
			},
			register: function() {
				Shoutbox.sockets.registerMessage('wobble', SocketMessages.wobble);
				Shoutbox.sockets.registerEvent(SocketEvents.onWobble, this.handlers.socket);
			},
			handlers: {
				action: function(argument, sendShout) {
					Shoutbox.sockets.wobble({
						victim: ArgumentHandlers.username(argument)
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
			if (DefaultCommands[c].register) {
				DefaultCommands[c].register();
			}
			Shoutbox.commands.register(c, DefaultCommands[c]);
		}
	}
})(window.Shoutbox);