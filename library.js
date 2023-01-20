'use strict';

const NodeBB = require('./lib/nodebb');
const Config = require('./lib/config');
const Sockets = require('./lib/sockets');
require('./lib/commands');

let app;

const Shoutbox = module.exports;

Shoutbox.init = {};
Shoutbox.widget = {};
Shoutbox.settings = {};

Shoutbox.init.load = function (params, callback) {
	const { router, middleware } = params;
	const routeHelpers = require.main.require('./src/routes/helpers');
	routeHelpers.setupPageRoute(router, `/${Config.plugin.id}`, middleware, [], async (req, res) => {
		const data = Config.getTemplateData();
		res.render(Config.plugin.id, data);
	});

	routeHelpers.setupAdminPageRoute(router, `/admin/plugins/${Config.plugin.id}`, middleware, [], async (req, res) => {
		const data = Config.getTemplateData();
		res.render(`admin/plugins/${Config.plugin.id}`, data);
	});

	NodeBB.SocketPlugins[Config.plugin.id] = Sockets.events;
	NodeBB.SocketAdmin[Config.plugin.id] = Config.adminSockets;

	app = params.app;

	Config.init(callback);
};

Shoutbox.init.filterConfigGet = async (config) => {
	config.shoutbox = Config.getTemplateData();
	config.shoutbox.settings = await Config.user.load(config.uid);
	return config;
};

Shoutbox.init.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: `/plugins/${Config.plugin.id}`,
		icon: Config.plugin.icon,
		name: Config.plugin.name,
	});

	callback(null, header);
};

Shoutbox.widget.define = function (widgets, callback) {
	widgets.push({
		name: Config.plugin.name,
		widget: Config.plugin.id,
		description: Config.plugin.description,
		content: '',
	});

	callback(null, widgets);
};

Shoutbox.widget.render = async function (widget) {
	if (widget.templateData.template.shoutbox) {
		return null;
	}
	// Remove any container
	widget.data.container = '';

	const settings = await Config.user.load(widget.uid);
	const data = Config.getTemplateData();

	data.hiddenStyle = '';
	if (settings && parseInt(settings['shoutbox:toggles:hide'], 10) === 1) {
		data.hiddenStyle = 'display: none;';
	}
	widget.html = await app.renderAsync('shoutbox/panel', data);
	return widget;
};

Shoutbox.settings.addUserSettings = async function (settings) {
	const html = await app.renderAsync('shoutbox/user/settings', { settings: settings.settings });
	settings.customSettings.push({
		title: Config.plugin.name,
		content: html,
	});

	return settings;
};

Shoutbox.settings.addUserFieldWhitelist = function (data, callback) {
	data.whitelist.push('shoutbox:toggles:sound');
	data.whitelist.push('shoutbox:toggles:notification');
	data.whitelist.push('shoutbox:toggles:hide');

	data.whitelist.push('shoutbox:muted');

	callback(null, data);
};

Shoutbox.settings.filterUserGetSettings = async function (data) {
	return await Config.user.get(data);
};

Shoutbox.settings.filterUserSaveSettings = async function (hookData) {
	return await Config.user.save(hookData);
};
