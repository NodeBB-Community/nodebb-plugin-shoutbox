'use strict';

module.exports = {
	Settings: nodebb.require('./src/settings'),
	Meta: nodebb.require('./src/meta'),
	User: nodebb.require('./src/user'),
	Plugins: nodebb.require('./src/plugins'),
	SocketIndex: nodebb.require('./src/socket.io/index'),
	SocketPlugins: nodebb.require('./src/socket.io/plugins'),
	SocketAdmin: nodebb.require('./src/socket.io/admin').plugins,
	db: nodebb.require('./src/database'),
	winston: nodebb.require('winston'),
	translator: nodebb.require('./src/translator'),
	utils: nodebb.require('./src/utils'),
	api: nodebb.require('./src/api'),
};
