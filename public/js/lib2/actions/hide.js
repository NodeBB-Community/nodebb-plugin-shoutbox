"use strict";

(function(Shoutbox) {
	var Hide = function(sbInstance) {
		this.register = function() {
			sbInstance.dom.container
				.off('click', '.shoutbox-settings-hide')
				.on('click', '.shoutbox-settings-hide', handle);
		};
		
		function handle() {
			var el = $(this).find('span'),
				body = el.parents('.shoutbox').find('.panel-body'),
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

			sbInstance.settings.set('toggles.hide', newSetting);
		}
	};

	Shoutbox.actions.register('hide', Hide);
})(window.Shoutbox);