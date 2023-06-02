<!-- BEGIN shouts -->
<!-- IF !shouts.isChained -->
<a class="shoutbox-avatar {shouts.user.status} {shouts.typeClasses}" href="/user/{shouts.user.userslug}" data-uid="{shouts.fromuid}">
    {buildAvatar(shouts.user, "28px", true)}

    <div class="shoutbox-avatar-overlay">
        <span class="shoutbox-avatar-typing">
            <i class="text-muted fa fa-keyboard-o"></i>
        </span>
    </div>
</a>

<div class="shoutbox-user {shouts.typeClasses}" data-uid="{shouts.fromuid}">
    <a class="me-2" href="/user/{shouts.user.userslug}">{shouts.user.username}</a>
    <span class="shoutbox-shout-timestamp">
        <span class="text-muted text-xs timeago timeago-update" title="{shouts.timeString}"></span>
    </span>
</div>
<!-- ENDIF !shouts.isChained -->

<div class="shoutbox-shout {shouts.typeClasses} d-flex align-items-center mb-1 gap-2" data-sid="{shouts.sid}" data-index="{shouts.index}" data-uid="{shouts.fromuid}">
    <div class="shoutbox-shout-text">{shouts.content}</div>

    <!-- IF shouts.user.isMod -->
    <div class="shoutbox-shout-options d-flex gap-2">
        <a href="#" class="btn btn-light btn-sm shoutbox-shout-option-edit text-decoration-none"><i class="fa fa-pencil text-primary"></i></a>
        <a href="#" class="btn btn-light btn-sm shoutbox-shout-option-close text-decoration-none"><i class="fa fa-trash-o text-danger"></i></a>
    </div>
    <!-- ENDIF shouts.user.isMod -->
</div>
<!-- END shouts -->