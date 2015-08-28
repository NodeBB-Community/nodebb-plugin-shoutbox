"use strict";

(function(Shoutbox) {
	var regex = /^\/(\w+)\s?(.+)?/, allCommands = {};

	var Commands = function(instance) {
		this.sb = instance;
		this.commands = {};

		// TODO: Permission based
		for (var c in allCommands) {
			if (allCommands.hasOwnProperty(c)) {
				if (typeof allCommands[c].register === 'function') {
					allCommands[c].register(this.sb);
				}
				
				this.commands[c] = allCommands[c];
			}
		}
	};
	
	Commands.prototype.getCommands = function() {
		return this.commands;
	};

	Commands.prototype.parse = function(msg, sendShout) {
		var match = msg.match(regex);

		if (match && match.length > 0 && this.commands.hasOwnProperty(match[1])) {
			this.commands[match[1]].handlers.action(match[2] || '', sendShout, this.sb);
		} else {
			sendShout(msg);
		}
	};

	Shoutbox.commands = {
		init: function(instance) {
			return new Commands(instance);
		},
		getCommands: function() {
			return allCommands;
		},
		register: function(command, commandObj) {
			allCommands[command] = commandObj;
		}
	};

})(window.Shoutbox);