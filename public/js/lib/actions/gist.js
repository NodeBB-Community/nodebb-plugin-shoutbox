'use strict';

(function (Shoutbox) {
	var Gist = function (sbInstance) {
		this.register = function () {
			app.parseAndTranslate('shoutbox/features/gist', {}, function (tpl) {
				$(document.body).append(tpl);

				var gistModal = $('#shoutbox-modal-gist');

				sbInstance.dom.container.find('.shoutbox-button-gist').off('click').on('click', function () {
					gistModal.modal('show');
				});

				gistModal.find('#shoutbox-button-create-gist-submit').off('click').on('click', function () {
					createGist(gistModal.find('textarea').val(), gistModal);
				});
			});
		};

		function createGist(code, gistModal) {
			if (app.user.uid === null) {
				gistModal.modal('hide');

				app.alertError('Only registered users can create Gists!', 3000);

				return;
			}

			var json = {
				description: 'Gist created from NodeBB shoutbox',
				public: true,
				files: {
					'Snippet.txt': {
						content: code,
					},
				},
			};

			$.post('https://api.github.com/gists', JSON.stringify(json), function (data) {
				var input = sbInstance.dom.textInput;
				var link = data.html_url;

				if (input.val().length > 0) {
					link = ' ' + link;
				}

				input.val(input.val() + link);

				gistModal.modal('hide');
				gistModal.find('textarea').val('');

				app.alertSuccess('Successfully created Gist!', 3000);
			}).fail(function () {
				gistModal.modal('hide');

				app.alertError('Error while creating Gist, try again later!', 3000);
			});
		}
	};

	$(window).on('action:app.load', function () {
		Shoutbox.actions.register('gist', Gist);
	});
}(window.Shoutbox));
