(function(Shoutbox) {
	var DefaultCommands = {
		test: function(argument, sendShout) {
			alert(argument || "Yay!");
		}
	};

	for (var c in DefaultCommands) {
		if (DefaultCommands.hasOwnProperty(c))
			Shoutbox.commands.register(c, DefaultCommands[c]);
	}
})(window.Shoutbox);