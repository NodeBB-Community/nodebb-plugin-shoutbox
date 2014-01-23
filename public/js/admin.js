(function() {
	$(document).ready(function() {
		$('#shoutbox-remove-deleted-button').off('click').on('click', function(e) {
			bootbox.confirm('Are you sure you wish to remove all shouts marked as deleted from the database?', function(confirm) {
				if (confirm) {
					socket.emit('modules.shoutbox.removeAll', {'which':'deleted'}, function(err, result) {
						console.log(err, result);
						if(err) {
							return app.alertError(err.message);
						} else {
							return app.alertSuccess("Successfully removed all shouts marked as deleted from the database");
						}
					});
				}
			});
		});

		$('#shoutbox-remove-all-button').off('click').on('click', function(e) {
			bootbox.confirm('Are you sure you wish to remove all shouts from the database?', function(confirm) {
				if (confirm) {
					socket.emit('modules.shoutbox.removeAll', {'which':'all'}, function(err, result) {
						console.log(err, result);
						if(err) {
							return app.alertError(err.message);
						} else {
							return app.alertSuccess("Successfully removed all shouts from the database");
						}
					});
				}
			});
		});
	});
}());