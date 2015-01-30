"use strict";

(function(NodeBB) {
	module.exports = {
		Settings: NodeBB.require('./src/settings'),
		Meta: NodeBB.require('./src/meta'),
		User: NodeBB.require('./src/user'),
		Plugins: NodeBB.require('./src/plugins'),
		SocketIndex: NodeBB.require('./src/socket.io/index'),
		SocketPlugins: NodeBB.require('./src/socket.io/plugins'),
		SocketAdmin: NodeBB.require('./src/socket.io/admin').plugins,
		db: NodeBB.require('./src/database'),
		winston: NodeBB.require('winston')
	}
})(require.main);