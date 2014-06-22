(function(Shoutbox) {
	var Bug = {
		register: function(shoutPanel) {
			shoutPanel.find('#shoutbox-button-bug').off('click').on('click', this.handle);
		},
		handle: function(e) {
			window.open('https://github.com/Schamper/nodebb-plugin-shoutbox/issues/new', '_blank').focus();
		}
	};

	Shoutbox.actions.register(Bug);
})(window.Shoutbox);