(function() {
	$(window).on('action:widgets.loaded', function(e, data) {
		if ($('#shoutbox').length > 0) {
			Shoutbox.init(data.url);
		}
	});

	window.Shoutbox = {
		init: function(url) {
			Shoutbox.utils.init(function() {
				Shoutbox.base.load($('#shoutbox'));
				if (url === 'shoutbox') {
					Shoutbox.base.showUserPanel();
				}
			});
		}
	};
})();