module.exports = {
	Meta: module.parent.parent.require('./meta'),
	User: module.parent.parent.require('./user'),
	Plugins: module.parent.parent.require('./plugins'),
	SocketIndex: module.parent.parent.require('./socket.io/index'),
	ModulesSockets: module.parent.parent.require('./socket.io/modules'),
	db: module.parent.parent.require('./database')
}