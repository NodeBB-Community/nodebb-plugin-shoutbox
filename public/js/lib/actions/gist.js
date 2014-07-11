(function(Shoutbox) {
	var Gist = {
		register: function(shoutPanel) {
			var handle = this.handle;
			window.ajaxify.loadTemplate('shoutbox/features/gist', function(tpl){
				$(document.body).append(tpl);

				var gistModal = $('#shoutbox-modal-gist');

				shoutPanel.find('#shoutbox-button-gist').off('click').on('click', function(e) {
					handle(gistModal);
				});

				gistModal.find('#shoutbox-button-create-gist-submit').off('click').on('click', function(e) {
					createGist(gistModal.find('textarea').val(), gistModal, shoutPanel);
				});
			});
		},
		handle: function(gistModal) {
			gistModal.modal('show');
		}
	}

	function createGist(code, gistModal, shoutPanel) {
		if (app.uid === null) {
			gistModal.modal('hide');
			app.alertError('Only registered users can create Gists!', 3000);
			return;
		}

		var json = {
			"description": "Gist created from NodeBB shoutbox",
			"public": true,
			"files": {
				"file1.txt": {
					"content": code
				}
			}
		};

		$.post('https://api.github.com/gists', JSON.stringify(json), function(data) {
			gistModal.modal('hide');
			var input = shoutPanel.find('#shoutbox-message-input');
			var link = data.html_url;
			if (input.val().length > 0) {
				link = ' ' + link;
			}
			input.val(input.val() + link);
			app.alertSuccess('Successfully created Gist!', 3000);
			gistModal.find('textarea').val('');
		}).fail(function(data) {
			gistModal.modal('hide');
			app.alertError('Error while creating Gist, try again later!', 3000);
		});
	}

	Shoutbox.actions.register(Gist);
})(window.Shoutbox);