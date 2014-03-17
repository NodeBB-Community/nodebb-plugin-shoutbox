define(function() {
	var Base;

	var module = {
		init: function(url, callback) {
			console.log("Init");
			require([
				'plugins/nodebb-plugin-shoutbox/public/js/lib/base.js'], function(b){
				console.log(b);
				b.init(function() {
					Base = b;
					Base.load(callback);
				});
			});
		},
		showUserPanel: function() {
			Base.getUsersPanel().parent().removeClass('hidden');
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