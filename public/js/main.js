$(document).ready(function() {
	$(window).on('action:ajaxify.end', function(e, data) {
		if (data.url === "" || data.url === "shoutbox") {
			requirejs([
				'plugins/nodebb-plugin-shoutbox/public/js/shoutbox.js'
			], function(shoutBox) {
				shoutBox.base.init(data.url);
				if (data.url === "shoutbox") {
					shoutBox.base.showUserPanel();
				}
			});
		}
	});
});