var	fs = require('fs'),
	path = require('path'),

	NodeBB = require('./lib/nodebb'),
	Config = require('./lib/config'),
	Sockets = require('./lib/sockets'),

	ModulesSockets = NodeBB.ModulesSockets,

	app;

var Shoutbox = {};

Shoutbox.init = {
	"load": function(expressApp, middleware, controllers) {
		app = expressApp;
		function renderGlobal(req, res, next) {
			Config.api(function(data) {
				res.render('shoutbox', data);
			});
		}
		function renderAdmin(req, res, next) {
			Config.api(function(data) {
				res.render('admin/shoutbox', data);
			});
		}
		app.get('/shoutbox', middleware.buildHeader, renderGlobal);
		app.get('/api/shoutbox', renderGlobal);

		app.get('/admin/shoutbox', middleware.admin.buildHeader, renderAdmin);
		app.get('/api/admin/shoutbox', renderAdmin);
		ModulesSockets.shoutbox = Sockets;
	},
	"global": {
		"addNavigation": function(custom_header, callback) {
			if (Config.get('headerlink') === '1') {
				custom_header.navigation.push({
					"class": "",
					"iconClass": "fa fa-fw " + Config.constants.icon,
					"route": Config.constants.global.route,
					"text": Config.constants.name
				});
			}
			callback(null, custom_header);
		}
	},
	"admin": {
		"addNavigation": function(custom_header, callback) {
			custom_header.plugins.push({
				"route": Config.constants.admin.route,
				"icon": Config.constants.icon,
				"name": Config.constants.name
			});

			callback(null, custom_header);
		}
	}
}

Shoutbox.widget = {
	"define": function(widgets, callback) {
		widgets.push({
			widget: "shoutbox",
			name: "Shoutbox",
			description: "Shoutbox widget.",
			content: ""
		});
		callback(null, widgets);
	},
	"render": function(widget, callback) {
		//We don't do anything fancy for now
		//Remove any container
		widget.data.container = '';
		if (widget.uid !== 0) {
			Config.api(function(data) {
				app.render('shoutbox', data, callback);
			});
		}
	}
}

module.exports = Shoutbox;
