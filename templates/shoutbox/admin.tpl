<div class="row">
    <div class="col-md-12">
        <h1>Shoutbox</h1>
    </div>
</div>

<div class="row">
    <form class="form" id="shoutboxAdminForm">
        <div class="col-xs-6 pull-left">
            <h3>Settings
                <small>change settings</small>
            </h3>

            <hr>

            <div class="form-group">
                <label for="shoutlimit">Maximum number of shouts that can be returned</label>
                <select class="form-control" data-key="limits.shoutLimit">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
                <p class="help-block"><small>Shouts marked as deleted will be included in this number</small></p>
            </div>

            <div class="form-group">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" data-key="toggles.headerLink" data-empty="false" data-trim="false"> Show navigation link
                    </label>
                </div>
            </div>

            <h3>Features
                <small>enable or disable features</small>
            </h3>

            <hr>

            <div class="features">
                <!-- BEGIN features -->
                <div data-feature="{features.id}" class="panel panel-default pointer shoutbox-admin-feature">
                    <div class="panel-heading">
                        <strong>{features.name}</strong> <small>{features.description}</small>
                        <div class="pull-left pointer">
                            <span class="toggle-feature">
                                <i class="fa fa-check-circle"></i>
                            </span>&nbsp;
                        </div>
                        <div class="pull-right">
                            <span>
                                <i class="fa {features.icon} feature-icon"></i>
                            </span>&nbsp;
                        </div>
                    </div>
                    <input class="hidden" type="checkbox" data-key="toggles.features.{features.id}" data-empty="false" data-trim="false">
                </div>
                <!-- END features -->
            </div>
        </div>

        <div class="col-xs-6 pull-right">
            <h3>Actions</h3>

            <hr>

            <div class="alert alert-danger">Warning: These actions are permanent and <strong>cannot</strong> be undone!</div>

            <button type="button" class="btn btn-danger" id="shoutbox-remove-deleted-button">Remove deleted shouts</button>
            <button type="button" class="btn btn-danger" id="shoutbox-remove-all-button">Remove all shouts</button>
        </div>
    </form>
    <div class="col-xs-12">
        <hr>
        <div class="pull-left">
            Like my plugins? Consider buying me a beer!
            <br>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                <input type="hidden" name="cmd" value="_s-xclick">
                <input type="hidden" name="hosted_button_id" value="ALVPTE4H99RD4">
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                <img alt="" border="0" src="https://www.paypalobjects.com/nl_NL/i/scr/pixel.gif" width="1" height="1">
            </form>
        </div>

        <div class="pull-right">
            <small>
                Settings are saved automatically but here's a save button in case you don't trust me
            </small>
            <br>
            <button id="save" class="btn btn-success btn-xs pull-right">
                Save
            </button>
        </div>
    </div>
</div>

<script src="/plugins/nodebb-plugin-shoutbox/public/js/admin.js"></script>