'use strict';

(function (Shoutbox) {
	const ArgumentHandlers = {
		username: function (argument) {
			if (argument.indexOf('@') === 0) {
				argument = argument.slice(1);
			}
			return argument;
		},
	};

	const DefaultCommands = {
		help: {
			info: {
				usage: '/help',
				description: 'Displays the available commands',
			},
			handlers: {
				action: function (argument, sendShout, sbInstance) {
					let message = '<strong>Available commands:</strong><br>';
					const commands = sbInstance.commands.getCommands();

					for (const c of Object.keys(commands)) {
						message += commands[c].info.usage + ' - ' + commands[c].info.description + '<br>';
					}

					sbInstance.utils.showOverlay(message);
				},
			},
		},
		thisagain: {
			info: {
				usage: '/thisagain',
				description: 'Remind the n00bs of the obvious',
			},
			handlers: {
				action: function (argument, sendShout) {
					sendShout('This again... Clear your cache and refresh.');
				},
			},
		},
		wobble: soundCommand('wobble', 'WOBULLY SASUGE'),
		cena: soundCommand('cena', 'AND HIS NAME IS'),
	};

	function soundCommand(sound, description) {
		return {
			info: {
				usage: '/' + sound + ' &lt;username&gt;',
				description: description,
			},
			register: function (sbInstance) {
				sbInstance.sockets.registerMessage(sound, 'plugins.shoutbox.' + sound);
				sbInstance.sockets.registerEvent('event:shoutbox.' + sound, function () {
					sbInstance.utils.playSound('shoutbox-' + sound + '.mp3');
				});
			},
			handlers: {
				action: function (argument, sendShout, sbInstance) {
					sbInstance.sockets[sound]({
						victim: ArgumentHandlers.username(argument),
					});
				},
			},
		};
	}
	$(window).on('action:app.load', function () {
		for (const c of Object.keys(DefaultCommands)) {
			Shoutbox.commands.register(c, DefaultCommands[c]);
		}
	});
}(window.Shoutbox));
