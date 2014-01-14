define(['string'], function(S) {
    var userCheckIntervalId = 0,
        loaded = false,
        socketEntries = {
            "get": "api:modules.shoutbox.get",
            "send": "api:modules.shoutbox.send",
            "get_users": "api:modules.shoutbox.get_users",
            "receive": "event:shoutbox.receive"
        },

        module = {};

    module.hasLoaded = function() {
        return loaded;
    }

    module.getShoutPanel = function() {
        return $('#shoutbox');
    }

    module.getUsersPanel = function() {
        return $('#shoutbox-users');
    }

    module.init = function(callback) {
        addSendHandler(module.getShoutPanel());
        addButtonHandlers(module.getShoutPanel());
        getShouts(module.getShoutPanel());
        registerSocket();
        loaded = true;
        if (callback)
            callback();
    }

    module.appendShout = function(shoutBox, message, timestamp) {
        var shoutContent = shoutBox.find('#shoutbox-content');

        var date = new Date(parseInt(timestamp, 10));
        var prefix = '<span class="shoutbox-timestamp">' + date.toLocaleTimeString() + '</span> ';
        var shout = "<div>" + S(prefix + message).stripTags('p').s + "</div>";

        shoutContent.append(shout);
        scrollToBottom(shoutContent);
    }

    module.showUsers = function() {
        $('#shoutbox-users').parent().removeClass('hidden');
        checkUsers();
        checkOnlineUsers();
    }

    function scrollToBottom(shoutContent) {
        if (module.getShoutPanel().length > 0) {
            shoutContent.scrollTop(
                shoutContent[0].scrollHeight - shoutContent.height()
            );
        }
    }

    function getShouts(shoutBox) {
        socket.emit(socketEntries.get, function(shouts) {
            for(var i = 0; i<shouts.length; ++i) {
                module.appendShout(shoutBox, shouts[i].content, shouts[i].timestamp);
            }
        });
    }

    function registerSocket() {
        socket.removeListener(socketEntries.receive);
        socket.on(socketEntries.receive, function(data) {
            if (module.hasLoaded) {
                module.appendShout(module.getShoutPanel(), data.message, data.timestamp);
                app.alternatingTitle('[' + data.username + '] - new shout!');
            }
        });
    }

    function addSendHandler(shoutBox) {
        shoutBox.find('#shoutbox-message-input').off('keypress');
        shoutBox.find('#shoutbox-message-input').on('keypress', function(e) {
            if(e.which === 13 && !e.shiftKey) {
                sendMessage(shoutBox);
            }
        });

        shoutBox.find('#shoutbox-message-send-btn').off('click');
        shoutBox.find('#shoutbox-message-send-btn').on('click', function(e){
            sendMessage(shoutBox);
            return false;
        });
    }

    function addButtonHandlers(shoutBox) {
        //START GIST BUTTON
        var gistModal = $('#create-gist-modal');
        shoutBox.find('#create-gist-button').off('click');
        shoutBox.find('#create-gist-button').on('click', function(e) {
            gistModal.modal('show');
        });
        gistModal.find('#create-gist-submit').off('click');
        gistModal.find('#create-gist-submit').on('click', function(e) {
            createGist(gistModal.find('textarea').val(), gistModal);
        });
        //END GIST BUTTON
    }

    function createGist(code, gistModal) {
        if (app.uid === null) {
            gistModal.modal('hide');
            app.alertError('Only registered users can create Gists!', 3000);
            return;
        }
        var json = {
            "description": "Gist created from BitBangers shoutbox",
            "public": true,
            "files": {
                "file1.txt": {
                    "content": code
                }
            }
        }
        $.post("https://api.github.com/gists", JSON.stringify(json), function(data) {
            gistModal.modal('hide');
            var input = $('.shoutbox').find('.shoutbox-message-input');
            var link = data.html_url;
            if (input.val().length > 0) {
                link = " " + link;
            }
            input.val(input.val() + link);
            app.alertSuccess("Successfully created Gist!", 3000);
            gistModal.find('textarea').val('');
        }).fail(function(data) {
                gistModal.modal('hide');
                app.alertError("Error while creating Gist, try again later!", 3000);
            });
    }

    function sendMessage(shoutBox) {
        var msg = S(shoutBox.find('#shoutbox-message-input').val()).stripTags().s;
        if(msg.length) {
            socket.emit(socketEntries.send, {message:msg});
            shoutBox.find('#shoutbox-message-input').val('');
        }
    }

    function checkOnlineUsers() {
        if(userCheckIntervalId === 0) {
            userCheckIntervalId = setInterval(function() {
                checkUsers();
            }, 10000);
        }
    }

    function checkUsers() {
        socket.emit(socketEntries.get_users, {}, function(data) {
            var userCount = data.length;
            var usernames = [];
            for(var i = 0; i < userCount; i++) {
                var uname = data[i].username;
                if (uname === null ) {
                    uname = 'Anonymous';
                }
                usernames.push(uname);
            }
            var userString = usernames.join("; ");
            module.getUsersPanel().find('.panel-body').text(userString);
            module.getUsersPanel().find('.panel-title').text('Users (' + userCount + ')');
        });
    }

    return module;
});