$(document).ready(function() {
	$('body').on('action:ajaxify.end', function(e, data) {
		if (data.url === "" || data.url === "shoutbox") {
			requirejs([
				'plugins/nodebb-plugin-shoutbox/js/shoutbox.js'
			], function(shoutBox) {
				shoutBox.base.init();
				if (data.url === "shoutbox") {
					shoutBox.base.showUserPanel();
				}
			});
		}
	});
});