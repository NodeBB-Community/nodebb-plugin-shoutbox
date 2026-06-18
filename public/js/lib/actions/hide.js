'use strict';

(function (Shoutbox) {
	const Hide = function (sbInstance) {
		this.register = function () {
			sbInstance.settings
				.off('toggles.hide')
				.on('toggles.hide', handle);
		};

		function handle(value) {
			const body = sbInstance.dom.container.find('.card-body');
			body.toggleClass('hidden', value === 1);
		}
	};
	$(window).on('action:app.load', function () {
		Shoutbox.actions.register('hide', Hide);
	});
}(window.Shoutbox));
