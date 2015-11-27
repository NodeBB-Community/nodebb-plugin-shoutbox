"use strict";
/* global app */

(function(Shoutbox) {
	var sounds = null;

	var Utils = function(instance) {
		this.sb = instance;
	};

	Utils.prototype.isAnon = function() {
		return app.user.uid === 0;
	};

	Utils.prototype.notify = function(data) {
		if (parseInt(this.sb.settings.get('toggles.notification'), 10) === 1) {
			app.alternatingTitle(this.sb.vars.messages.alert.replace(/%u/g, data.user.username));
		}
		if (parseInt(this.sb.settings.get('toggles.sound'), 10) === 1) {
			this.playSound('notification');
		}
	};

	Utils.prototype.playSound = function(sound) {
		var self = this;
		if (sounds === null) {
			require(['sounds'], function(s) {
				sounds = s;

				self.playSound(sound);
			});
		} else {
			sounds.playFile('shoutbox-' + sound + '.mp3');
		}
	};

	Utils.prototype.showOverlay = function(message) {
		this.sb.dom.overlayMessage.html(message);
		this.sb.dom.overlay.addClass('active');
	};

	Utils.prototype.closeOverlay = function() {
		this.sb.dom.overlay.removeClass('active');
	};

	Utils.prototype.scrollToBottom = function(force) {
		var	shoutsContainer = this.sb.dom.shoutsContainer,
			lastShoutHeight = shoutsContainer.find('[data-sid]:last').height(),
			scrollHeight = getScrollHeight(shoutsContainer) - lastShoutHeight;

		if (scrollHeight < this.sb.vars.scrollBreakpoint || force) {
			shoutsContainer.scrollTop(
				shoutsContainer[0].scrollHeight - shoutsContainer.height()
			);
		}
	};

	function getScrollHeight(container) {
		if (container[0]) {
			var padding = container.css('padding-top').replace('px', '') + container.css('padding-bottom').replace('px', '');
			return (((container[0].scrollHeight - container.scrollTop()) - container.height()) - padding);
		} else {
			return -1;
		}
	}

	Shoutbox.utils = {
		init: function(instance) {
			return new Utils(instance);
		},
		getScrollHeight: getScrollHeight
	}

})(window.Shoutbox);

