<div class="row">
    <div class="col-lg-9">
        <form class="form shoutbox-settings">
            <div class="panel panel-default">
                <div class="panel-heading">Shoutbox</div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-lg-6">
                            <div class="form-group">
                                <label for="shoutlimit">Maximum number of shouts that can be returned</label>
                                <select class="form-control" data-key="limits.shoutLimit">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                                <p class="help-block"><small>Shouts marked as deleted will be included in this number</small></p>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.guestsAllowed" data-trim="false"> Allow read access to guests
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.headerLink" data-trim="false"> Show navigation link
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">Features</div>
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
            <div class="panel-heading">Shoutbox control panel</div>
            <div class="panel-body">
                <button type="button" class="btn btn-primary btn-block" id="save">Save settings</button>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">Administrative actions</div>
            <div class="panel-body">
                <div class="alert alert-warning">Warning: These actions are permanent and <strong>cannot</strong> be undone!</div>

                <button type="button" class="btn btn-danger btn-block" id="shoutbox-remove-deleted-button">Remove deleted shouts</button>
                <button type="button" class="btn btn-danger btn-block" id="shoutbox-remove-all-button">Remove all shouts</button>
            </div>
        <div
    </div>
</div>