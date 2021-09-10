'use strict';

define('admin/plugins/shoutbox', ['settings'], function (Settings) {
	var wrapper;

	var ACP = {};

	ACP.init = function () {
		wrapper = $('.shoutbox-settings');

		Settings.sync('shoutbox', wrapper);

		$('#save').on('click', function () {
			save();
		});

		prepareButtons();
	};

	function save() {
		Settings.persist('shoutbox', wrapper, function () {
			socket.emit('admin.plugins.shoutbox.sync');
		});
	}

	function prepareButtons() {
		$('#shoutbox-remove-deleted-button').off('click').on('click', function () {
			bootbox.confirm('Are you sure you wish to remove all shouts marked as deleted from the database?', function (confirm) {
				if (confirm) {
					socket.emit('plugins.shoutbox.removeAll', { which: 'deleted' }, function (err) {
						if (err) {
							return app.alertError(err.message);
						}
						app.alertSuccess('Successfully removed all shouts marked as deleted from the database');
					});
				}
			});
		});

		$('#shoutbox-remove-all-button').off('click').on('click', function () {
			bootbox.confirm('Are you sure you wish to remove all shouts from the database?', function (confirm) {
				if (confirm) {
					socket.emit('plugins.shoutbox.removeAll', { which: 'all' }, function (err) {
						if (err) {
							return app.alertError(err.message);
						}
						app.alertSuccess('Successfully removed all shouts from the database');
					});
				}
			});
		});
	}

	return ACP;
});
