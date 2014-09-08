(function(Shoutbox) {
	var regex = /^\/(\w+)\s?(.+)?/, commandActions = {}, commandInfo = {};

	Shoutbox.commands = {
		get: function() {
			return commandInfo;
		},
		register: function(command, commandObj) {
			commandActions[command] = commandObj.handlers.action;
			commandInfo[command] = commandObj.info;
		},
		parse: function(msg, sendShout) {
			var match = msg.match(regex);
			if (match && typeof commandActions[match[1]] === 'function') {
				commandActions[match[1]](match[2] || '', sendShout);
			} else {
				sendShout(msg);
			}
		}
	};
})(window.Shoutbox);