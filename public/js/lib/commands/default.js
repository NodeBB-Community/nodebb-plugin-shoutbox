/* global utils */
"use strict";

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
				action: function(argument, sendShout, sbInstance) {
					var message = '<strong>Available commands:</strong><br>',
						commands = sbInstance.commands.getCommands();

					for (var c in commands) {
						if (commands.hasOwnProperty(c)) {
							message += commands[c].info.usage + ' - ' + commands[c].info.description + '<br>';
						}
					}

					sbInstance.utils.showOverlay(message);
				}
			}
		},
		wobble: {
			info: {
				usage: '/wobble &lt;username&gt;',
				description: 'WOBULLY SASUGE'
			},
			register: function(sbInstance) {
				sbInstance.sockets.registerMessage('wobble', SocketMessages.wobble);
				sbInstance.sockets.registerEvent(SocketEvents.onWobble, function() {
					sbInstance.utils.playSound('wobblysausage');
				});
			},
			handlers: {
				action: function(argument, sendShout, sbInstance) {
					sbInstance.sockets.wobble({
						victim: ArgumentHandlers.username(argument)
					});
				}
			}
		},
		thisagain: {
			info: {
				usage: '/thisagain',
				description: 'Remind the n00bs of the obvious'
			},
			handlers: {
				action: function(argument, sendShout) {
					sendShout('This again... Clear your cache and refresh.');
				}
			}
		}
	};

	for (var c in DefaultCommands) {
		if (DefaultCommands.hasOwnProperty(c)) {
			Shoutbox.commands.register(c, DefaultCommands[c]);
		}
	}

})(window.Shoutbox);