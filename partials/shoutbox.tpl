<div class="row shoutbox-row">
    <audio id="shoutbox-sounds-notification" src="/plugins/nodebb-plugin-shoutbox/public/notif.mp3" preload="auto"></audio>
    <div class="col-md-12">
        <div class="panel panel-default" id="shoutbox">
            <div class="panel-heading">
                <h3 class="panel-title"><a href="/shoutbox" title="Shoutbox">Shoutbox</a></h3>
            </div>
            <div class="panel-body">
                <div id="shoutbox-content" class="well well-sm"></div>
                <div class="input-group">
                    <input id="shoutbox-message-input" type="text" placeholder="enter message" name="shoutbox-message" class="form-control">
                    <span class="input-group-btn">
                        <button id="shoutbox-message-send-btn" class="btn btn-primary" href="#" type="button">Send</button>
                    </span>
                </div>
                <div class="btn-group">
                    <!-- BEGIN features -->
                    <!-- IF features.enabled -->
                    <button id="shoutbox-button-{features.id}" type="button" class="btn btn-primary btn-sm">
                        <span class="fa {features.icon}"></span> {features.button}
                    </button>
                    <!-- ENDIF features.enabled -->
                    <!-- END features -->
                </div>
                <div class="btn-group pull-right">
                    <button id="shoutbox-button-settings" type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
                        <span class="fa fa-wrench"></span>
                    </button>
                    <ul id="shoutbox-settings-menu" class="dropdown-menu" role="menu">
                        <li>
                            <a id="shoutbox-settings-sound" href="#">
                                <span class="fa fa-check"></span> Sound
                            </a>
                        </li>
                        <li>
                            <a id="shoutbox-settings-notification" href="#">
                                <span class="fa fa-check"></span> Notification
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-12 hidden">
        <div id="shoutbox-users" class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Users (0)</h3>
            </div>
            <div class="panel-body">

            </div>
        </div>
    </div>


    <div class="modal fade" id="shoutbox-modal-gist" role="dialog" aria-labelledby="shoutboxModalGist" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title" id="shoutboxModalGist">Create Gist</h4>
                </div>
                <div class="modal-body">
                    <textarea placeholder="Paste code here" class="form-control" rows="20"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="shoutbox-button-create-gist-submit">Submit</button>
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="shoutbox-archive-modal" role="dialog" aria-labelledby="shoutboxModalArchive" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title" id="shoutboxModalArchive">Archive</h4>
                </div>
                <div class="modal-body">
                    <div id="shoutbox-archive-content" class="well well-sm"></div>
                </div>
                <div class="modal-footer">
                    <button id="shoutbox-button-archive-prev" type="button" class="btn btn-default pull-left">&larr; Older</button>
                    <button id="shoutbox-button-archive-next" type="button" class="btn btn-default pull-right">Newer &rarr;</button>
                </div>
            </div>
        </div>
    </div>
</div>