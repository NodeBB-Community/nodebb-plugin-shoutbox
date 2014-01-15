$(document).ready(function() {
    if (document.location.pathname === "/shoutbox") {
        requirejs([
            'plugins/nodebb-plugin-shoutbox/js/shoutbox.js'
        ], function(shoutBox) {
            shoutBox.init();
            shoutBox.showUsers();
        });
    }

    $(document).bind('DOMNodeInserted', function(event) {
        // todo improve this
        if (event.target.className == 'row shoutbox-row') {
            requirejs([
                'plugins/nodebb-plugin-shoutbox/js/shoutbox.js'
            ], function(shoutBox) {
                shoutBox.init();
            });
        }
    });
});