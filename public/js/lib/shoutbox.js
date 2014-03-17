define([
	'plugins/nodebb-plugin-shoutbox/public/js/lib/base.js'], function(Base) {
	console.log(Base);

	var module = {
		init: function(url, callback) {
			Base.load(callback);
		},
		showUserPanel: function() {
			Base.getUsersPanel().parent().removeClass('hidden');
			//Utils.startUserPoll();
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