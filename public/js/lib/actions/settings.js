"use strict";

(function(Shoutbox) {
	var Settings = function(sbInstance) {
		this.register = function() {
			sbInstance.dom.container
				.off('click', '.shoutbox-settings-menu a')
				.on('click', '.shoutbox-settings-menu a', handle);
		};

		function handle() {
			var el = $(this),
				key = el.data('shoutbox-setting'),
				statusEl = el.find('span'),
				status = statusEl.hasClass('fa-check');

			if (status) {
				statusEl.removeClass('fa-check').addClass('fa-times');
				status = 0;
			} else {
				statusEl.removeClass('fa-times').addClass('fa-check');
				status = 1;
			}

			sbInstance.settings.set(key, status);

			return false;
		}
	};

	Shoutbox.actions.register('settings', Settings);
})(window.Shoutbox);