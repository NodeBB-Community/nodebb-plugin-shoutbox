<div class="row shoutbox-row">
    <div class="col-md-12">
        <div class="panel panel-default" id="shoutbox">
            <div class="panel-heading">
                <h3 class="panel-title"><a href="/shoutbox" title="Shoutbox">Shoutbox</a></h3>
            </div>
            <div class="panel-body">
                <div id="shoutbox-content" class="well well-sm" style="height:200px; overflow-y:scroll;"></div>
                <div class="input-group">
                    <input id="shoutbox-message-input" type="text" placeholder="enter message" name="shoutbox-message" class="form-control">
                    <span class="input-group-btn">
                        <button id="shoutbox-message-send-btn" class="btn btn-primary" href="#" type="button">Send</button>
                    </span>
                </div>
                <div class="btn-group">
                    <button id="create-gist-button" type="button" class="btn btn-default btn-sm">
                        <span class="fa fa-github-alt"></span> Create Gist
                    </button>
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

    <div class="modal fade" id="create-gist-modal" role="dialog" aria-labelledby="createGistModal" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title" id="createGistModal">Create Gist</h4>
                </div>
                <div class="modal-body">
                    <textarea placeholder="Paste code here" class="form-control" rows="20"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="create-gist-submit">Submit</button>
                </div>
            </div>
        </div>
    </div>
</div>