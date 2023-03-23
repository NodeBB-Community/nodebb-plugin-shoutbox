'use strict';

/* globals Shoutbox, app */

$(window).on('action:ajaxify.end', function () {
	if ($('#shoutbox-main').length > 0) {
		Shoutbox.init();
	}
});

window.Shoutbox = {
	init: function () {
		Shoutbox.instances.main = Shoutbox.base.init($('#shoutbox-main'), {});
	},
	instances: {},
	alert: async function (type, message) {
		const alerts = await app.require('alerts');
		alerts[type](message);
	},
};
