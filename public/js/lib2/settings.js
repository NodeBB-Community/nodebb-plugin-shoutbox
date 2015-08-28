"use strict";

(function(Shoutbox) {

	var Settings = function(instance) {
		this.sb = instance;
		this.settings = null;
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
						// Not the best way but it'll have to do for now
						if (key === 'toggles.hide') {
							if (parseInt(value, 10) == 1) {
								el.removeClass('fa-arrow-up').addClass('fa-arrow-down');
							} else {
								el.removeClass('fa-arrow-down').addClass('fa-arrow-up');
							}
						} else {
							if (parseInt(value, 10) === 1) {
								el.removeClass('fa-times').addClass('fa-check');
							} else {
								el.removeClass('fa-check').addClass('fa-times');
							}
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
		key = formalString(key);
		this.settings[key] = value;

		this.sb.sockets.saveSettings({settings: this.settings}, function(err, result) {
			if (err) {
				app.alertError('Error saving settings!');
			}
		});
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