var	fs = require('fs'),
	path = require('path'),
	Templates = module.parent.require('../public/src/templates'),
	ModulesSockets = module.parent.require('./socket.io/modules'),

	Config = require('./lib/config'),
	Sockets = require('./lib/sockets');

var Shoutbox = {};

Shoutbox.init = {
	"load": function() {
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
			return custom_header;
		},
		"addRoute": function(custom_routes, callback) {
			fs.readFile(path.resolve(__dirname, './partials/shoutbox.tpl'), function (err, partial) {
				custom_routes.routes.push({
					route: Config.constants.global.route,
					method: "get",
					options: function(req, res, callback) {
						callback({
							req: req,
							res: res,
							content: '<script> \
								ajaxify.initialLoad = true; \
								templates.ready(function(){ajaxify.go("shoutbox", null, true);}); \
							</script>'
						});
					}
				});

				custom_routes.api.push({
					route: Config.constants.global.route,
					method: "get",
					callback: function(req, res, callback) {
						Config.api(callback);
					}
				});

				custom_routes.templates.push({
					"template": "shoutbox.tpl",
					"content": partial
				});

				Shoutbox.widget.template = partial.toString();

				callback(null, custom_routes);
			});
		},
		"addUserSettings": function(settings, callback) {
			settings.push({
				title: "Shoutbox",
				content: '<div class="checkbox"><label><input type="checkbox" data-property="shoutbox:hide"> Hide shoutbox</label></div>'
			});

			callback(null, settings);
		}
	},
	"admin": {
		"addNavigation": function(custom_header, callback) {
			custom_header.plugins.push({
				"route": Config.constants.admin.route,
				"icon": Config.constants.icon,
				"name": Config.constants.name
			});

			return custom_header;
		},
		"addRoute": function(custom_routes, callback) {
			fs.readFile(path.join(__dirname, './partials/admin.tpl'), function(err, tpl) {
				Config.api(function(data) {
					tpl = Templates.prepare(tpl.toString()).parse(data);
				});
				custom_routes.routes.push({
					route: Config.constants.admin.route,
					method: "get",
					options: function(req, res, callback) {
						callback({
							req: req,
							res: res,
							content: tpl
						});
					}
				});

				custom_routes.api.push({
					route: Config.constants.admin.route,
					method: "get",
					callback: function(req, res, callback) {
						Config.api(callback);
					}
				});

//				custom_routes.templates.push({
//					"template": "admin/plugins/shoutbox.tpl",
//					"content": tpl
//				});

				callback(null, custom_routes);
			});
		}
	}
}

Shoutbox.widget = {
	"template": '',
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
		var html = '';
		if (widget.uid !== 0) {
			Config.api(function(data) {
				html = Templates.prepare(Shoutbox.widget.template).parse(data);
			});
		}
		//Remove any container
		widget.data.container = '';
		callback(null, html);
	}
}

module.exports = Shoutbox;
