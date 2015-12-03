<!-- BEGIN shouts -->
<!-- IF !shouts.isChained -->
<a class="shoutbox-avatar {shouts.user.status} {shouts.typeClasses}" href="/user/{shouts.user.userslug}" data-uid="{shouts.fromuid}">
    <!-- IF shouts.user.picture -->
    <img class="shoutbox-avatar-image" title="{shouts.user.username}" src="{shouts.user.picture}"/>
    <!-- ELSE -->
    <div class="shoutbox-avatar-icon user-icon" title="{shouts.user.username}" style="background-color: {shouts.user.icon:bgColor};">{shouts.user.icon:text}</div>
    <!-- ENDIF shouts.user.picture -->
    <div class="shoutbox-avatar-overlay">
        <span class="shoutbox-avatar-typing">
            <i class="text-muted fa fa-keyboard-o"></i>
        </span>
    </div>
</a>

<div class="shoutbox-user {shouts.typeClasses}" data-uid="{shouts.fromuid}">
    <a href="/user/{shouts.user.userslug}">{shouts.user.username}</a>
    <span class="shoutbox-shout-timestamp">
        <small class="text-muted"><i class="fa fa-clock-o"></i> <span class="timeago timeago-update" title="{shouts.timeString}"></span> </small>
    </span>
</div>
<!-- ENDIF !shouts.isChained -->

<div class="shoutbox-shout {shouts.typeClasses}" data-sid="{shouts.sid}" data-uid="{shouts.fromuid}">
    <div class="shoutbox-shout-text">{shouts.content}</div>

    <!-- IF shouts.user.isMod -->
    <div class="shoutbox-shout-options">
        <a href="#" class="shoutbox-shout-option-edit fa fa-pencil"></a>
        <a href="#" class="shoutbox-shout-option-close fa fa-trash-o"></a>
    </div>
    <!-- ENDIF shouts.user.isMod -->
</div>
<!-- END shouts -->