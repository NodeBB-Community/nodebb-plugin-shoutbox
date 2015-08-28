"use strict";

(function(Shoutbox) {
	var allActions = [];
	
	var Actions = function(sbInstance) {
		var action;
		allActions.forEach(function(actObj) {
			action = new actObj.obj(sbInstance);
			action.register();

			this[actObj.name] = action;
		}, this);
	};
	
	Shoutbox.actions = {
		init: function(sbInstance) {
			return new Actions(sbInstance);
		},
		register: function(name, obj) {
			allActions.push({
				name: name,
				obj: obj
			});
		}
	};
	
})(window.Shoutbox);