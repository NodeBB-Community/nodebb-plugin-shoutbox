(function() {
	$(document).ready(function() {
		require(['forum/admin/settings'], function(Settings) {
			Settings.prepare(function() {
				prepareFeatures();
			});
		});
		prepareButtons();
	});

	function prepareFeatures() {
		function updateSettings() {
			var features = {};
			$('[data-feature]').each(function() {
				var feature = $(this).data('feature');
				features[feature] = {
					feature: feature,
					enabled: $(this).find('.fa').hasClass('fa-check-circle')
				};
			});
			$('#features-settings').val(JSON.stringify(features));
		}

		function on(feature) {
			var el = $('[data-feature="' + feature + '"]');
			el.find('.fa').removeClass('fa-times-circle').addClass('fa-check-circle');
			el.removeClass('disabled');
		}
		function off(feature) {
			var el = $('[data-feature="' + feature + '"]');
			el.find('.fa').removeClass('fa-check-circle').addClass('fa-times-circle');
			el.addClass('disabled');
		}

		function toggleFeature(el) {
			var feature = $(el).parents("[data-feature]").data('feature');
			if ($(el).find('.fa').hasClass('fa-times-circle')) {
				on(feature);
			} else {
				off(feature);
			}
			updateSettings();
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

		var saved = JSON.parse($('#features-settings').val());
		for (var feature in saved) {
			if (saved.hasOwnProperty(feature)) {
				if (!saved[feature].enabled) {
					off(feature);
				}
			}
		}
		updateSettings();
	}

	function prepareButtons() {
		$('#shoutbox-remove-deleted-button').off('click').on('click', function(e) {
			bootbox.confirm('Are you sure you wish to remove all shouts marked as deleted from the database?', function(confirm) {
				if (confirm) {
					socket.emit('modules.shoutbox.removeAll', {'which':'deleted'}, function(err, result) {
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
					socket.emit('modules.shoutbox.removeAll', {'which':'all'}, function(err, result) {
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