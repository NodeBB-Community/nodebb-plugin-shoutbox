(function(Shoutbox) {
	var Hide = {
		register: function(shoutPanel) {
			shoutPanel.off('click', '#shoutbox-settings-hide').on('click', '#shoutbox-settings-hide', this.handle);
		},
		handle: function(e) {
			var el = $(e.currentTarget).find('span'),
				body = el.parents('#shoutbox').find('.panel-body'),
				newSetting;

			if (el.hasClass('fa-arrow-up')) {
				body.slideUp();
				el.removeClass('fa-arrow-up').addClass('fa-arrow-down');
				newSetting = 1;
			} else {
				body.slideDown();
				el.removeClass('fa-arrow-down').addClass('fa-arrow-up');
				newSetting = 0;
			}

			Shoutbox.settings.set('toggles.hide', newSetting);
		}
	};

	Shoutbox.actions.register(Hide);
})(window.Shoutbox);