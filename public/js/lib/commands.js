(function(Shoutbox) {
	var regex = /\/(\w+)\s?(.+)?/, commands = {};

	Shoutbox.commands = {
		register: function(command, func) {
			commands[command] = func;
		},
		parse: function(msg, sendShout) {
			var match = msg.match(regex);
			if (match && typeof commands[match[1]] === 'function') {
				commands[match[1]](match[2], sendShout);
			} else {
				sendShout();
			}
		}
	};
})(window.Shoutbox);