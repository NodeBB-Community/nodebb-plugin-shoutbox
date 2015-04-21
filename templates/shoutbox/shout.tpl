<div data-uid="{fromuid}" class="shoutbox-shout-container <!-- IF ownShout -->ownShout<!-- ENDIF ownShout -->">
    <a class="shoutbox-shout-avatar-link {user.status}" href="/user/{user.userslug}">
        <img class="shoutbox-shout-avatar" title="{user.username}" src="{user.picture}"/>
        <div class="shoutbox-shout-avatar-overlay">
            <span class="shoutbox-shout-typing">
                <i class="text-muted fa fa-keyboard-o"></i>
            </span>
        </div>
    </a>

    <div class="shoutbox-shout-content">
        <div class="shoutbox-shout-details">
            <a href="/user/{user.userslug}">{user.username}</a>
            <span class="shoutbox-shout-timestamp">
                <small class="text-muted"><i class="fa fa-clock-o"></i> <span class="timeago" title="{timeString}"></span> </small>
            </span>
        </div>
        <!-- IMPORT shoutbox/shout/text.tpl -->
    </div>
</div>
