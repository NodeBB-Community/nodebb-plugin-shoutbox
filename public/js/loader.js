(function() {
	$(window).on('action:widgets.loaded', function() {
		if ($('#shoutbox-main').length > 0) {
			Shoutbox.init();
		}
	});

	window.Shoutbox = {
		init: function() {
			Shoutbox.instances.main = Shoutbox.base.init($('#shoutbox-main'), {});
		},
		instances: {}
	};
})();