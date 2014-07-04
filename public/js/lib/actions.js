(function(Shoutbox) {
	var actions = [];

	Shoutbox.actions = {
		register: function(obj) {
			actions.push(obj);
		},
		initialize: function(shoutPanel) {
			for (var a in actions) {
				if (actions.hasOwnProperty(a)) {
					actions[a].register(shoutPanel);
				}
			}
		}
	};
})(window.Shoutbox);