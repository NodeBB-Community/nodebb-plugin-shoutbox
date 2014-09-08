(function(Shoutbox) {
	var shoutTpl, textTpl,
		sounds;

	require(['sounds'], function(s) {
		sounds = s;
	});

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
			if (shoutContent[0]) {
				var	lastShoutHeight = $('[data-sid]:last').height(),
					scrollHeight = Utils.getScrollHeight(shoutContent) - lastShoutHeight;

				if (scrollHeight < Shoutbox.vars.scrollBreakpoint) {
					shoutContent.scrollTop(
						shoutContent[0].scrollHeight - shoutContent.height()
					);
				}
			}
		},
		getScrollHeight: function(shoutContent) {
			if (shoutContent[0]) {
				var padding = shoutContent.css('padding-top').replace('px', '') + shoutContent.css('padding-bottom').replace('px', '');
				return (((shoutContent[0].scrollHeight - shoutContent.scrollTop()) - shoutContent.height()) - padding);
			} else {
				return -1;
			}
		},
		isAnon: function() {
			return app.uid === 0;
		},
		showMessage: function(message) {
			$('#shoutbox-content-overlay').find('span').html(message).parent().addClass('active');
		},
		closeMessage: function() {
			$('#shoutbox-content-overlay').removeClass('active');
		},
		notify: function(data) {
			if (Shoutbox.settings.get('toggles.notification') === 1) {
				app.alternatingTitle(Shoutbox.vars.messages.alert.replace(/%u/g, data.user.username));
			}
			if (Shoutbox.settings.get('toggles.sound') === 1) {
				Shoutbox.utils.playSound('notification');
			}
		},
		playSound: function(sound) {
			sounds.playFile('shoutbox-' + sound + '.mp3');
		}
	};

	Shoutbox.utils = {
		initialize: Utils.initialize,
		parseShout: Utils.parseShout,
		scrollToBottom: Utils.scrollToBottom,
		getScrollHeight: Utils.getScrollHeight,
		showMessage: Utils.showMessage,
		isAnon: Utils.isAnon,
		notify: Utils.notify,
		playSound: Utils.playSound
	};
})(window.Shoutbox);

