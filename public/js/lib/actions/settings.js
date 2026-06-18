'use strict';

(function (Shoutbox) {
	const Settings = function (sbInstance) {
		this.register = function () {
			sbInstance.dom.container
				.off('click', '.shoutbox-settings-menu a')
				.on('click', '.shoutbox-settings-menu a', handle);
		};

		function handle() {
			const el = $(this);
			const key = el.data('shoutbox-setting');
			const statusEl = el.find('span');
			let status = statusEl.hasClass('fa-check');

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
	$(window).on('action:app.load', function () {
		Shoutbox.actions.register('settings', Settings);
	});
}(window.Shoutbox));
