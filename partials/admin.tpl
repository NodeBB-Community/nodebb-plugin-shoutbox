<h1>Shoutbox</h1>

<form class="form">
    <h3>Settings</h3>
    <div class="form-group">
        <label for="pageposition">Position on the homepage</label>
        <select class="form-control" id="pageposition" data-field="shoutbox:pageposition">
            <option value="top">Top of the page</option>
            <option value="bottom">Bottom of the page</option>
            <option value="none">Disabled</option>
        </select>
        <p class="help-block">Note: This settings requires a restart of NodeBB.</p>
    </div>

    <div class="form-group">
        <label for="shoutlimit">Maximum number of shouts that can be returned</label>
        <select class="form-control" id="shoutlimit" data-field="shoutbox:shoutlimit">
            <option value="10">10</option>
            <option value="25" selected>25</option>
            <option value="50">50</option>
        </select>
        <p class="help-block">Shouts marked as deleted will be included in this number</p>
    </div>

    <div class="form-group">
        <div class="checkbox">
            <label>
                <input type="checkbox" data-field="shoutbox:headerlink" id="headerlink"> Show navigation link
            </label>
        </div>
    </div>

    <button class="btn btn-lg btn-primary" id="save">Save</button>

    <h3>Actions</h3>
        <button type="button" class="btn btn-danger" id="shoutbox-remove-deleted-button">Remove deleted shouts</button>
        <button type="button" class="btn btn-danger" id="shoutbox-remove-all-button">Remove all shouts</button>
    <p class="help-block">Warning: These actions are permanent and <strong>cannot</strong> be undone!</p>
</form>

<script type="text/javascript">
    require(['forum/admin/settings'], function(Settings) {
        Settings.prepare();
    });
</script>
<script src="/plugins/nodebb-plugin-shoutbox/js/admin.js"></script>