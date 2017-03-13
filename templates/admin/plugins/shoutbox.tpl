<div class="row">
    <div class="col-lg-9">
        <form class="form shoutbox-settings">
            <div class="panel panel-default">
                <div class="panel-heading">[[shoutbox:shoutbox]]</div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-lg-6">
                            <div class="form-group">
                                <label for="shoutlimit">[[shoutbox:admin_shoutlimit]]</label>
                                <select class="form-control" data-key="limits.shoutLimit">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                                <p class="help-block"><small>[[shoutbox:admin_shoutlimit_help]]</small></p>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.guestsAllowed" data-trim="false"> [[shoutbox:admin_guestsallowed]]
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.headerLink" data-trim="false"> [[shoutbox:admin_headerlink]]
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">[[shoutbox:features]]</div>
                <div class="panel-body">
                    <div class="features">
                        <!-- BEGIN features -->
                        <div data-feature="{features.id}" class="shoutbox-admin-feature">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.features.{features.id}" data-trim="false">
                                    &nbsp;
                                    <span>
                                        <i class="fa {features.icon} feature-icon"></i>
                                    </span>
                                    &nbsp;
                                    {features.name} - {features.description}
                                </label>
                            </div>
                        </div>
                        <!-- END features -->
                    </div>
                </div>
            </div>
        </form>
    </div>

    <div class="col-lg-3">
        <div class="panel panel-default">
            <div class="panel-heading">[[shoutbox:admin_controlpanel]]</div>
            <div class="panel-body">
                <button type="button" class="btn btn-primary btn-block" id="save">[[shoutbox:admin_savesettings]]</button>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">[[shoutbox:admin_adminactions]]</div>
            <div class="panel-body">
                <div class="alert alert-warning">[[shoutbox:admin_warning]]</div>

                <button type="button" class="btn btn-danger btn-block" id="shoutbox-remove-deleted-button">[[shoutbox:admin_removedeletedshouts]]</button>
                <button type="button" class="btn btn-danger btn-block" id="shoutbox-remove-all-button">[[shoutbox:admin_removeallshouts]]</button>
            </div>
        <div
    </div>
</div>