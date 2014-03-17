define(function() {
	var Base, Utils;

	var module = {
		init: function(url, callback) {
			require([
				'plugins/nodebb-plugin-shoutbox/public/js/lib/base.js'], function(b, u){
				b.init(function() {
					Base = b;
					Base.load(callback);
				});
			});
		},
		showUserPanel: function() {
			Base.getUsersPanel().parent().removeClass('hidden');
			Utils.startUserPoll();
			Base.updateUsers();
		},
		load: function(name, req, onload, config) {
			console.log(name);
			req(['plugins/nodebb-plugin-shoutbox/public/js/lib/' + name + '.js'], function(val) {
				onload(val);
			});
		}
	};

	return module;
});