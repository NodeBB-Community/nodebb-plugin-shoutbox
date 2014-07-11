(function(Shoutbox) {
	var Hide = {
		register: function(shoutPanel) {
			shoutPanel.off('click', '#shoutbox-settings-hide').on('click', '#shoutbox-settings-hide', this.handle);
		},
		handle: function(e) {
			var el = $(e.currentTarget).find('span'),
				body = el.parents('#shoutbox').find('.panel-body');

			if (el.hasClass('fa-arrow-up')) {
				body.slideUp();
				el.removeClass('fa-arrow-up').addClass('fa-arrow-down');
				Shoutbox.settings.set('hide', 1);
			} else {
				body.slideDown();
				el.removeClass('fa-arrow-down').addClass('fa-arrow-up');
				Shoutbox.settings.set('hide', 0);
			}
		}
	};

	Shoutbox.actions.register(Hide);
})(window.Shoutbox);