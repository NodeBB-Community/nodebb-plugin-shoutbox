<div class="shoutbox" id="shoutbox-main">
    <div class="panel panel-default">
        <div class="panel-heading">
            <h3 class="panel-title">
                <a href="/shoutbox" title="Shoutbox">Shoutbox</a>
                <a href="#" class="shoutbox-settings-hide" data-shoutbox-setting="toggles.hide"><span class="fa fa-arrow-up pull-right"></span></a>
            </h3>
        </div>

        <div class="panel-body" style="{hiddenStyle}">
            <div class="shoutbox-content-container">
                <div class="shoutbox-content-overlay">
                    <a href="#" class="shoutbox-content-overlay-close fa fa-times"></a>
                    <span class="shoutbox-content-overlay-message"></span>
                </div>
                <div class="shoutbox-content well well-sm"></div>
            </div>
            <div class="input-group">
                <input type="text" placeholder="enter message" name="shoutbox-message" class="shoutbox-message-input form-control">
            <span class="input-group-btn">
                <button class="shoutbox-message-send-btn btn btn-primary" type="button">Send</button>
            </span>
            </div>
            <div class="btn-group">
                <!-- BEGIN features -->
                <!-- IF features.enabled -->
                <button type="button" class="shoutbox-button-{features.id} btn btn-primary btn-sm">
                    <span class="fa {features.icon}"></span> {features.button}
                </button>
                <!-- ENDIF features.enabled -->
                <!-- END features -->
            </div>
            <div class="btn-group pull-right">
                <button type="button" class="shoutbox-button-settings btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
                    <span class="fa fa-wrench"></span>
                </button>
                <ul class="shoutbox-settings-menu dropdown-menu" role="menu">
                    <li>
                        <a data-shoutbox-setting="toggles.sound" href="#">
                            <span class="fa fa-check"></span> Sound
                        </a>
                    </li>
                    <li>
                        <a data-shoutbox-setting="toggles.notification" href="#">
                            <span class="fa fa-check"></span> Notification
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>