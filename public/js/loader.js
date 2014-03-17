$(document).ready(function() {
	console.log("Test");
	$(window).on('action:ajaxify.end', function(e, data) {
		console.log("Ajaxify");
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