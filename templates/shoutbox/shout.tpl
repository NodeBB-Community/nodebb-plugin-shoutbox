<div data-uid="{fromuid}" class="shoutbox-shout-container">
    <a class="shoutbox-shout-avatar-link" href="/user/{user.userslug}">
        <img class="shoutbox-shout-avatar {user.status}" title="{user.username}" src="{user.picture}"/>
    </a>

    <div class="shoutbox-shout-content">
        <div class="shoutbox-shout-details">
            <a href="/user/{user.userslug}">{user.username}</a>
            <span class="shoutbox-shout-typing">
                <i class="text-muted fa fa-keyboard-o"></i>
            </span>
            <span class="shoutbox-shout-timestamp">
                <small class="text-muted"><i class="fa fa-clock-o"></i> <span></span> </small>
            </span>
        </div>
        <!-- IMPORT shoutbox/shout/text.tpl -->
    </div>
</div>