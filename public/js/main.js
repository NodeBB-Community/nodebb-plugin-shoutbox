$(document).ready(function() {
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