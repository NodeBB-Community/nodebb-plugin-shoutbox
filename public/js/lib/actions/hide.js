'use strict';

(function (Shoutbox) {
	var Hide = function (sbInstance) {
		this.register = function () {
			sbInstance.settings
				.off('toggles.hide')
				.on('toggles.hide', handle);
		};

		function handle(value) {
			var body = sbInstance.dom.container.find('.card-body');

			if (value === 1) {
				body.slideUp();
			} else {
				body.slideDown();
			}
		}
	};
	$(window).on('action:app.load', function () {
		Shoutbox.actions.register('hide', Hide);
	});
}(window.Shoutbox));
