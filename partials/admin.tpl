<h1>Shoutbox</h1>

<form class="form">
    <h3>Switches</h3>
    <div class="checkbox">
        <label>
            <input type="checkbox" data-field="shoutbox:headerlink" id="headerlink"> Show navigation link
        </label>
    </div>

    <button class="btn btn-lg btn-primary" id="save">Save</button>

</form>

<script type="text/javascript">
    require(['forum/admin/settings'], function(Settings) {
        Settings.prepare();
    });
</script>