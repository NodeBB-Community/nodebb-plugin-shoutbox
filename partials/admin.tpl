<div class="row">
    <h1>Shoutbox</h1>
</div>

<form class="form">
    <div class="row">
        <div class="col-xs-6 pull-left">
            <h3>Settings <small>change settings</small> <button id="save" class="btn btn-success btn-xs pull-right">Save</button></h3>
            <div class="form-group">
                <label for="shoutlimit"><h4>Maximum number of shouts that can be returned</h4></label>
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
        <!--</div>
        <div class="col-xs-6 pull-left">-->
            <h3>Features <small>enable or disable features</small> <button class="features-save btn btn-success btn-xs pull-right">Save</button></h3>
            <div class="features">
                <!-- BEGIN features -->
                <div data-feature="{features.id}" class="panel panel-default pointer shoutbox-admin-feature disabled">
                    <div class="panel-heading">
                        <strong>{features.name}</strong> <small>{features.description}</small>
                        <div class="pull-left pointer">
                            <span class="toggle-feature">
                                <i class="fa fa-times-circle"></i>
                            </span>&nbsp;
                        </div>
                        <div class="pull-right">
                            <span class="feature-icon">
                                <i class="fa {features.icon}"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <!-- END features -->
            </div>
            <input id="features-settings" class="hidden" type="text" data-field="shoutbox:features">
        </div>
        <div class="col-xs-6 pull-right">
            <h3>Actions</h3>
            <div class="alert alert-danger">Warning: These actions are permanent and <strong>cannot</strong> be undone!</div>
            <button type="button" class="btn btn-danger" id="shoutbox-remove-deleted-button">Remove deleted shouts</button>
            <button type="button" class="btn btn-danger" id="shoutbox-remove-all-button">Remove all shouts</button>

            <hr>
            Like my plugins? Consider buying me a beer!<br>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                <input type="hidden" name="cmd" value="_s-xclick">
                <input type="hidden" name="hosted_button_id" value="ALVPTE4H99RD4">
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                <img alt="" border="0" src="https://www.paypalobjects.com/nl_NL/i/scr/pixel.gif" width="1" height="1">
            </form>
        </div>
    </div>
</form>
<script src="/plugins/nodebb-plugin-shoutbox/public/js/admin.js"></script>