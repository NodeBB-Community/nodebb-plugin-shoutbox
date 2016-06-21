/* global utils */
"use strict";

(function(Shoutbox) {
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
		},
		wobble: soundCommand('wobble', 'WOBULLY SASUGE'),
		cena: soundCommand('cena', 'AND HIS NAME IS')
	};

	function soundCommand(sound, description) {
		return {
			info: {
				usage: '/' + sound + ' &lt;username&gt;',
				description: description
			},
			register: function(sbInstance) {
				sbInstance.sockets.registerMessage(sound, 'plugins.shoutbox.' + sound);
				sbInstance.sockets.registerEvent('event:shoutbox.' + sound, function() {
					sbInstance.utils.playSound(sound);
				});
			},
			handlers: {
				action: function(argument, sendShout, sbInstance) {
					sbInstance.sockets[sound]({
						victim: ArgumentHandlers.username(argument)
					});
				}
			}
		}
	}

	for (var c in DefaultCommands) {
		if (DefaultCommands.hasOwnProperty(c)) {
			Shoutbox.commands.register(c, DefaultCommands[c]);
		}
	}

})(window.Shoutbox);