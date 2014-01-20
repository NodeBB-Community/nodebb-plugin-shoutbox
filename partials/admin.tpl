<h1>Shoutbox</h1>

<form class="form">
    <h3>Settings</h3>
    <p class="help-block">Note: Almost all settings require a restart of NodeBB.</p>
    <div class="form-group">
        <label for="pageposition">Position on the homepage</label>
        <select class="form-control" id="pageposition" data-field="shoutbox:pageposition">
            <option value="top">Top of the page</option>
            <option value="bottom">Bottom of the page</option>
            <option value="none">Disabled</option>
        </select>
    </div>

    <div class="form-group">
        <div class="checkbox">
            <label>
                <input type="checkbox" data-field="shoutbox:headerlink" id="headerlink"> Show navigation link
            </label>
        </div>
    </div>

    <button class="btn btn-lg btn-primary" id="save">Save</button>

</form>

<script type="text/javascript">
    require(['forum/admin/settings'], function(Settings) {
        Settings.prepare();
    });
</script>