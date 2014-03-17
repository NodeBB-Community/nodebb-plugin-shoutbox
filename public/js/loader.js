$(document).ready(function() {
	$(window).on('action:ajaxify.end', function(e, data) {
		if (data.url === "" || data.url === "shoutbox") {
			require([
				'plugins/nodebb-plugin-shoutbox/public/js/lib/shoutbox.js'
			], function(shoutBox) {
				shoutBox.init(data.url);
				if (data.url === 'shoutbox') {
					shoutBox.showUserPanel();
				}
			});
		}
	});
});