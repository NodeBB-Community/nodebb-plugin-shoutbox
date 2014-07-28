(function(NodeBB) {
	module.exports = {
		Settings: NodeBB.require('./settings'),
		Meta: NodeBB.require('./meta'),
		User: NodeBB.require('./user'),
		Plugins: NodeBB.require('./plugins'),
		SocketIndex: NodeBB.require('./socket.io/index'),
		SocketPlugins: NodeBB.require('./socket.io/plugins'),
		SocketAdmin: NodeBB.require('./socket.io/admin').plugins,
		db: NodeBB.require('./database')
	}
})(module.parent.parent);