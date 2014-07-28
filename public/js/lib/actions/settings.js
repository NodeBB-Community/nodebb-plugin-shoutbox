(function(Shoutbox) {
	var Settings = {
		register: function(shoutPanel) {
			shoutPanel.off('click', '#shoutbox-settings-menu a').on('click', '#shoutbox-settings-menu a', this.handle);
		},
		handle: function(e) {
			var el = $(e.currentTarget),
				statusEl = el.find('span'),
				key = el.data('shoutbox-setting'),
				status = statusEl.hasClass('fa-check');

			if (status) {
				statusEl.removeClass('fa-check').addClass('fa-times');
				status = 0;
			} else {
				statusEl.removeClass('fa-times').addClass('fa-check');
				status = 1;
			}

			Shoutbox.settings.set(key, status);

			return false;
		}
	};

	Shoutbox.actions.register(Settings);
})(window.Shoutbox);