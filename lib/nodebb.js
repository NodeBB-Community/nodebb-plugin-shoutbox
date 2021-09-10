'use strict';

module.exports = {
	Settings: require.main.require('./src/settings'),
	Meta: require.main.require('./src/meta'),
	User: require.main.require('./src/user'),
	Plugins: require.main.require('./src/plugins'),
	SocketIndex: require.main.require('./src/socket.io/index'),
	SocketPlugins: require.main.require('./src/socket.io/plugins'),
	SocketAdmin: require.main.require('./src/socket.io/admin').plugins,
	db: require.main.require('./src/database'),
	winston: require.main.require('winston'),
	translator: require.main.require('./src/translator'),
	utils: require.main.require('./src/utils'),
};
