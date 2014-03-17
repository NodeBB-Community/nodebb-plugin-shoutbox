define([
	'plugins/nodebb-plugin-shoutbox/public/js/lib/base.js',
	'plugins/nodebb-plugin-shoutbox/public/js/lib/utils.js',
	'plugins/nodebb-plugin-shoutbox/public/js/lib/actions.js',
	'plugins/nodebb-plugin-shoutbox/public/js/lib/sockets.js',
	'plugins/nodebb-plugin-shoutbox/public/js/lib/config.js'], function(Base, Utils, Actions, Sockets, Config) {

	return {
		Base: Base,
		Utils: Utils,
		Actions: Actions,
		Sockets: Sockets,
		Config: Config
	}
});