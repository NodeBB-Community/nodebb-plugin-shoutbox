(function(Shoutbox) {
	var DefaultCommands = {
		wobble: function(argument, sendShout) {
			Shoutbox.sockets.wobble({
				victim: utils.slugify(argument)
			});
		}
	};

	for (var c in DefaultCommands) {
		if (DefaultCommands.hasOwnProperty(c))
			Shoutbox.commands.register(c, DefaultCommands[c]);
	}
})(window.Shoutbox);