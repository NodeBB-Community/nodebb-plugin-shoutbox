define(function() {
	var Config = {
		sockets: {
			get: 'modules.shoutbox.get',
			send: 'modules.shoutbox.send',
			remove : 'modules.shoutbox.remove',
			edit: 'modules.shoutbox.edit',
			saveSettings: 'modules.shoutbox.saveSetting',
			//getUsers: 'modules.shoutbox.getUsers',
			getUsers: 'user.loadMore',
			getUserStatus: 'user.isOnline',
			getOriginalShout: 'modules.shoutbox.getOriginalShout',
			getSettings: 'modules.shoutbox.getSettings',
			onReceive: 'event:shoutbox.receive',
			onDelete: 'event:shoutbox.delete',
			onEdit: 'event:shoutbox.edit'
		},
		messages: {
			alert: '[ %u ] - new shout!',
			empty: 'The shoutbox is empty, start shouting!'
		},
		vars: {

		},
		getSetting: function(key) {
			return Config.settings[key];
		}
	};

	return Config;
});