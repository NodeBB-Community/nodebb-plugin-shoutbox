'use strict';

(function (Shoutbox) {
	const allActions = [];

	const Actions = function (sbInstance) {
		allActions.forEach(function (actObj) {
			const action = new actObj.obj(sbInstance);
			action.register();

			this[actObj.name] = action;
		}, this);
	};

	Shoutbox.actions = {
		init: function (sbInstance) {
			return new Actions(sbInstance);
		},
		register: function (name, obj) {
			allActions.push({
				name: name,
				obj: obj,
			});
		},
	};
}(window.Shoutbox));
