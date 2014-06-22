(function(Shoutbox) {
	var shoutTpl, textTpl;

	var Utils = {
		initialize: function(shoutPanel, callback) {
			Shoutbox.sockets.initialize();
			Shoutbox.actions.initialize(shoutPanel);

			if (!shoutTpl || !textTpl) {
				window.ajaxify.loadTemplate('shoutbox/shout', function(shout) {
					window.ajaxify.loadTemplate('shoutbox/shout/text', function(text) {
						shoutTpl = shout;
						textTpl = text;
						Shoutbox.settings.load(shoutPanel, callback);
					});
				});
			} else {
				Shoutbox.settings.load(shoutPanel, callback);
			}
		},
		parseShout: function(shout, onlyText) {
			var tpl = onlyText ? textTpl : shoutTpl;
			shout.user.hasRights = shout.fromuid === app.uid || app.isAdmin === true;
			return window.templates.parse(tpl, shout);
		},
		scrollToBottom: function(shoutContent) {
			if(shoutContent[0] && (shoutContent[0].scrollHeight - shoutContent.scrollTop()) - shoutContent.height() < shoutContent.height()) {
				shoutContent.scrollTop(
					shoutContent[0].scrollHeight - shoutContent.height()
				);
			}
		},
		isAnon: function() {
			return app.uid === 0;
		},
		showMessage: function(message, shoutPanel) {
			shoutPanel.find('#shoutbox-content').html(message);
		}
	};

	Shoutbox.utils = {
		initialize: Utils.initialize,
		parseShout: Utils.parseShout,
		registerHandlers: Utils.registerHandlers,
		scrollToBottom: Utils.scrollToBottom,
		showMessage: Utils.showMessage,
		isAnon: Utils.isAnon
	};
})(window.Shoutbox);

