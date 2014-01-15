define(['string'], function(S) {
    var userCheckIntervalId = 0,
        loaded = false,
        socketEntries = {
            "get": "api:modules.shoutbox.get",
            "send": "api:modules.shoutbox.send",
            "remove" : "api:modules.shoutbox.remove",
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
        var anon = checkForAnon();
        if (!anon) {
            addSendHandler(module.getShoutPanel());
            addButtonHandlers(module.getShoutPanel());
        }
        registerSocket();
        getShouts(module.getShoutPanel());

        loaded = true;
        if (callback)
            callback();
    }

    module.appendShout = function(shoutBox, shout) {
        var shoutContent = shoutBox.find('#shoutbox-content');

        var date = new Date(parseInt(shout.timestamp, 10));
        var prefix = '<span class="shoutbox-timestamp">' + date.toLocaleTimeString() + '</span> ';
        var options = '';
        if (shout.fromuid === app.uid) {
            options = '<button type="button" class="close pull-right" aria-hidden="true">&times;</button>';
        }
        var shoutHTML = "<div id='shoutbox-shout-" + shout.sid + "'>" + options + S(prefix + shout.content).stripTags('p').s + "</div>";

        shoutContent.append(shoutHTML);
        scrollToBottom(shoutContent);
    }

    module.showUsers = function() {
        $('#shoutbox-users').parent().removeClass('hidden');
        checkUsers();
        checkOnlineUsers();
    }

    function checkForAnon() {
        if (app.uid === null) {
            $('#shoutbox .input-group').hide();
            $('#shoutbox .btn-group').hide();
            return true;
        }
        return false;
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
                module.appendShout(shoutBox, shouts[i]);
            }
        });
    }

    function registerSocket() {
        if (socket.listeners(socketEntries.receive).length === 0) {
            socket.on(socketEntries.receive, function(data) {
                if (module.hasLoaded) {
                    module.appendShout(module.getShoutPanel(), data);
                    app.alternatingTitle('[' + data.username + '] - new shout!');
                }
            });
        }
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

    function removeShout(sid, node) {
        socket.emit(socketEntries.remove, {"sid": sid}, function (err, result) {
            if (result === true) {
                node.remove();
            } else if (err) {
                app.alertError("Error deleting shout: " + err, 3000);
            }
        });
    }

    function addButtonHandlers(shoutBox) {
        //START DELETE BUTTON
        shoutBox.find('button.close').off('click');
        shoutBox.on('click', 'button.close', function(e) {
            removeShout(e.currentTarget.parentNode.id.match(/\d+/), e.currentTarget.parentNode);
        });
        //END DELETE BUTTON

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
        shoutBox.find('#view-archive-button').off('click');
        shoutBox.find('#view-archive-button').on('click', function(e) {
            app.alertError("Not implemented!", 3000);
        });
        //START ARCHIVE BUTTON

        //END ARCHIVE BUTTON
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