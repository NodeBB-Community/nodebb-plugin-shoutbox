<div class="modal fade" id="shoutbox-modal-gist" role="dialog" aria-labelledby="shoutboxModalGist" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="shoutboxModalGist">{{tx("shoutbox:create_gist")}}</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
            </div>
            <div class="modal-body">
                <textarea placeholder="{{tx("shoutbox:paste_code_here")}}" class="form-control" rows="20"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-bs-dismiss="modal">{{tx("shoutbox:close_gist")}}</button>
                <button type="button" class="btn btn-primary" id="shoutbox-button-create-gist-submit">{{tx("shoutbox:submit_gist")}}</button>
            </div>
        </div>
    </div>
</div>
