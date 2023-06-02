<!-- BEGIN shouts -->
<!-- IF !shouts.isChained -->
<div class="shoutbox-user mt-2 d-flex gap-1 align-items-center {shouts.typeClasses}" data-uid="{shouts.fromuid}">
    <a class="d-flex justify-content-center align-items-center shoutbox-avatar position-relative text-decoration-none {shouts.user.status} {shouts.typeClasses}" href="/user/{shouts.user.userslug}" data-uid="{shouts.fromuid}">
        {buildAvatar(shouts.user, "28px", true)}

        <div class="shoutbox-avatar-overlay position-absolute top-0 start-0">
            <span class="shoutbox-avatar-typing">
                <i class="text-muted fa fa-keyboard-o"></i>
            </span>
        </div>
    </a>

    <a class="me-2 fw-semibold" href="/user/{shouts.user.userslug}">{shouts.user.username}</a>
    <span class="shoutbox-shout-timestamp">
        <span class="text-muted text-xs timeago timeago-update" title="{shouts.timeString}"></span>
    </span>
</div>
<!-- ENDIF !shouts.isChained -->

<div class="shoutbox-shout {shouts.typeClasses} d-flex align-items-center mb-1 gap-2" data-sid="{shouts.sid}" data-index="{shouts.index}" data-uid="{shouts.fromuid}">
    <div class="shoutbox-shout-text text-break">{shouts.content}</div>

    <!-- IF shouts.user.isMod -->
    <div class="shoutbox-shout-options d-flex gap-2">
        <a href="#" class="btn btn-light btn-sm shoutbox-shout-option-edit text-decoration-none"><i class="fa fa-pencil text-primary"></i></a>
        <a href="#" class="btn btn-light btn-sm shoutbox-shout-option-close text-decoration-none"><i class="fa fa-trash-o text-danger"></i></a>
    </div>
    <!-- ENDIF shouts.user.isMod -->
</div>
<!-- END shouts -->