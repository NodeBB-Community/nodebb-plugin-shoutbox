(function(Shoutbox) {
	Shoutbox.vars = {
		messages: {
			alert: '[ %u ] - new shout!',
			empty: 'The shoutbox is empty, start shouting!',
			scrolled: '<a href="#" id="shoutbox-content-overlay-scrolldown">Scroll down</a>'
		},
		editing: 0,
		lastSid: 0,
		scrollBreakpoint: 70
	};
})(window.Shoutbox);