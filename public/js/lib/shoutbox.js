define(function() {
	var Shoutbox = {},
		Base;

	var module = {
		init: function(url, callback) {
			require([
				'plugins/nodebb-plugin-shoutbox/public/js/lib/base.js',
				'plugins/nodebb-plugin-shoutbox/public/js/lib/utils.js',
				'plugins/nodebb-plugin-shoutbox/public/js/lib/actions.js',
				'plugins/nodebb-plugin-shoutbox/public/js/lib/sockets.js',
				'plugins/nodebb-plugin-shoutbox/public/js/lib/config.js'
			], function(b, u, a, s, c){
				b(Shoutbox); u(Shoutbox); a(Shoutbox);
				s(Shoutbox); c(Shoutbox);
				Shoutbox.utils.init(function() {
					Shoutbox.base.load();
					if (url === 'shoutbox') {
						module.showUserPanel();
					}
					if (typeof(callback) === 'function') {
						callback();
					}
				});
			});
		},
		showUserPanel: function() {
			Shoutbox.base.getUsersPanel().parent().removeClass('hidden');
			Shoutbox.base.updateUsers();
		}
	};

	return module;
});