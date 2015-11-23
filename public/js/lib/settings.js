"use strict";

(function(Shoutbox) {

	var Settings = function(instance) {
		this.sb = instance;
		this.settings = null;
		this.listeners = {};
	};

	Settings.prototype.load = function() {
		var self = this;
		this.sb.sockets.getSettings(function(err, result) {
			if (err || !result || !result.settings) {
				return;
			}

			self.settings = result.settings;
			parse(self.settings);
		});

		function parse(settings) {
			var settingsMenu = self.sb.dom.container;

			for (var key in settings) {
				if (settings.hasOwnProperty(key)) {
					var value = settings[key];
					key = prettyString(key);
					var el = settingsMenu.find('[data-shoutbox-setting="' + key + '"] span');

					if (el.length > 0) {
						if (parseInt(value, 10) === 1) {
							el.removeClass('fa-times').addClass('fa-check');
						} else {
							el.removeClass('fa-check').addClass('fa-times');
						}
					}
				}
			}
		}
	};

	Settings.prototype.get = function(key) {
		key = formalString(key);
		return this.settings[key];
	};

	Settings.prototype.set = function(key, value) {
		var fullKey = formalString(key);
		this.settings[fullKey] = value;

		if (this.listeners.hasOwnProperty(key)) {
			this.listeners[key].forEach(function(cb) {
				cb(value);
			});
		}

		this.sb.sockets.saveSettings({settings: this.settings}, function(err, result) {
			if (err) {
				app.alertError('Error saving settings!');
			}
		});
	};

	Settings.prototype.on = function(key, callback) {
		if (!this.listeners.hasOwnProperty(key)) {
			this.listeners[key] = [];
		}

		this.listeners[key].push(callback);

		return this;
	};

	Settings.prototype.off = function(key) {
		delete this.listeners[key];

		return this;
	};

	function prettyString(key) {
		return key.replace('shoutbox:', '').replace(/:/g, '.');
	}

	function formalString(key) {
		return 'shoutbox:' + key.replace(/\./g, ':');
	}

	function inflate(object, startIndex, separator) {
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
	}

	function deflate(object, separator) {
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

	Shoutbox.settings = {
		init: function(instance) {
			return new Settings(instance);
		}
	};


})(window.Shoutbox);