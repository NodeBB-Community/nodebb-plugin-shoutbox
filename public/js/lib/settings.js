(function(Shoutbox) {
	var Settings = {
		settings: null,
		get: function(key) {
			key = Settings.formalString(key);
			return Settings.settings[key];
		},
		set: function(key, value) {
			key = Settings.formalString(key);
			Settings.settings[key] = value;

			Shoutbox.sockets.saveSettings({ key: key, value: value }, function(err, result) {
				if (err || result === false) {
					app.alertError('Error saving settings!');
				}
			});
		},
		load: function(shoutPanel, callback) {
			Shoutbox.sockets.getSettings(function(err, result) {
				Settings.settings = result.settings;

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
					key = Settings.prettyString(key);
					var el = shoutPanel.find('[data-shoutbox-setting="' + key + '"] span');

					if (el.length > 0) {
						// Not the best way but it'll have to do for now
						if (key !== 'toggles.hide') {
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
		},
		prettyString: function(key) {
			return key.replace('shoutbox:', '').replace(/:/g, '.');
		},
		formalString: function(key) {
			return 'shoutbox:' + key.replace(/\./g, ':');
		},
		inflate: function(object, startIndex, separator) {
			var keys = Object.keys(object),
				obj = {};

			for (var i = 0, l = keys.length; i < l; i++) {
				var cur = keys[i],
					parts = cur.split(separator || ':'),
					curObj = obj;

				for (var j = startIndex || 0; j < parts.length; j++) {
					if (typeof curObj[parts[j]] !== 'object' && j !== parts.length - 1) {
						curObj = curObj[parts[j]] = {};
					} else if (j === parts.length - 1) {
						curObj[parts[j]] = object[cur];
					} else {
						curObj = curObj[parts[j]];
					}
				}
			}

			return obj;
		},
		deflate: function(object, separator) {
			var result = {},
				sep = separator || ':';

			function iterate(obj, path) {
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						if (typeof obj[prop] === 'object') {
							path.push(prop);
							iterate(obj[prop], path);
						} else {
							result[path.join(sep) + sep + prop] = obj[prop];
						}
					}
				}
			}

			iterate(object, ['shoutbox']);

			return result;
		}
	};

	Shoutbox.settings = {
		get: Settings.get,
		set: Settings.set,
		load: Settings.load
	};
})(window.Shoutbox);