(function() {
	var settings, wrapper, saveInterval;

	$(document).ready(function() {
		require(['settings'], function(_settings) {
			settings = _settings;

			wrapper = $('#shoutboxAdminForm');

			settings.sync('shoutbox', wrapper, function() {
				prepareFeatures(settings.get().toggles.features);
			});

			$('#save').click(function(event) {
				event.preventDefault();
				save();
			});

			$('#reset').click(function(event) {
				event.preventDefault();
				reset();
			});

			prepareButtons();

			wrapper.on('change', function(event) {
				save();
			});
		});
	});

	function save() {
		clearTimeout(saveInterval);

		saveInterval = setTimeout(function() {
			settings.persist('shoutbox', wrapper, function() {
				socket.emit('admin.plugins.shoutbox.sync');
			});
		}, 1000);
	}

	function reset() {
		bootbox.confirm('Are you sure you wish to reset the settings?', function(sure) {
			if (sure) {
				socket.emit('admin.plugins.shoutbox.getDefaults', null, function (err, data) {
					settings.set('shoutbox', data, wrapper, function(){
						socket.emit('admin.plugins.shoutbox.sync');
					});
				});
			}
		});
	}

	function prepareFeatures(featureSettings) {
		function on(feature) {
			var el = $('[data-feature="' + feature + '"]');
			el.find('.fa').removeClass('fa-times-circle').addClass('fa-check-circle');
			el.removeClass('disabled');

			el.find('input:checkbox').prop('checked', true);
		}

		function off(feature) {
			var el = $('[data-feature="' + feature + '"]');
			el.find('.fa').removeClass('fa-check-circle').addClass('fa-times-circle');
			el.addClass('disabled');

			el.find('input:checkbox').prop('checked', false);
		}

		function toggleFeature(el) {
			var feature = $(el).parents("[data-feature]").data('feature');
			if ($(el).find('.fa').hasClass('fa-times-circle')) {
				on(feature);
			} else {
				off(feature);
			}
			save();
		}

		$('.features').on('click', '.toggle-feature', function() {
			toggleFeature(this);
		}).on('dblclick', '.panel-heading', function() {
			toggleFeature(this);
		}).disableSelection();

		$('.features-save').on('click', function(e) {
			$('#save').click();
			e.preventDefault();
			return false;
		});

		for (var feature in featureSettings) {
			if (featureSettings.hasOwnProperty(feature)) {
				if (!featureSettings[feature]) {
					off(feature);
				} else {
					on(feature);
				}
			}
		}
	}

	function prepareButtons() {
		$('#shoutbox-remove-deleted-button').off('click').on('click', function(e) {
			bootbox.confirm('Are you sure you wish to remove all shouts marked as deleted from the database?', function(confirm) {
				if (confirm) {
					socket.emit('plugins.shoutbox.removeAll', {'which':'deleted'}, function(err, result) {
						if(err) {
							return app.alertError(err.message);
						} else {
							return app.alertSuccess('Successfully removed all shouts marked as deleted from the database');
						}
					});
				}
			});
		});

		$('#shoutbox-remove-all-button').off('click').on('click', function(e) {
			bootbox.confirm('Are you sure you wish to remove all shouts from the database?', function(confirm) {
				if (confirm) {
					socket.emit('plugins.shoutbox.removeAll', {'which':'all'}, function(err, result) {
						if(err) {
							return app.alertError(err.message);
						} else {
							return app.alertSuccess('Successfully removed all shouts from the database');
						}
					});
				}
			});
		});
	}
}());