(function(Shoutbox) {
	var Settings = {
		settings: null,
		get: function(key) {
			return Settings.settings[key];
		},
		set: function(key, value) {
			Settings.settings[key] = value;

			Shoutbox.sockets.saveSettings({ key: key, value: value }, function(err, result) {
				if (err || result === false) {
					app.alertError('Error saving settings!');
				}
			});
		},
		load: function(shoutPanel, callback) {
			Shoutbox.sockets.getSettings(function(err, settings) {
				Settings.settings = settings.settings;

				Settings.parse(shoutPanel);

				if (callback) {
					callback();
				}
			});
		},
		parse: function(shoutPanel) {
			var settings = Settings.settings;

			if (!settings) {
				return;
			}

			for (var key in settings) {
				if (settings.hasOwnProperty(key)) {
					var value = settings[key];
					var el = shoutPanel.find('#shoutbox-settings-' + key + ' span');

					if (el.length > 0) {
						// Not the best way but it'll have to do for now
						if (key !== 'hide') {
							if (parseInt(value, 10) === 1) {
								el.removeClass('fa-times').addClass('fa-check');
							} else {
								el.removeClass('fa-check').addClass('fa-times');
							}
						} else {
							if (parseInt(value, 10) == 1) {
								el.removeClass('fa-arrow-up').addClass('fa-arrow-down');
							} else {
								el.removeClass('fa-arrow-down').addClass('fa-arrow-up');
							}
						}
					}
				}
			}
		}
	};

	Shoutbox.settings = {
		get: Settings.get,
		set: Settings.set,
		load: Settings.load
	};
})(window.Shoutbox);