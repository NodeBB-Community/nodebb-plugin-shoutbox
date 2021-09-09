<div class="row">
    <div class="col-lg-9">
        <form class="form shoutbox-settings">
            <div class="panel panel-default">
                <div class="panel-heading">[[shoutbox:shoutbox]]</div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-lg-6">
                            <div class="form-group">
                                <label for="shoutlimit">[[admin:max_shouts_number]]</label>
                                <select class="form-control" data-key="limits.shoutLimit">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                                <p class="help-block"><small>[[admin:deleted_shouts_included]]</small></p>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.guestsAllowed" data-trim="false"> [[admin:allow_guest_read_access]]
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" data-key="toggles.headerLink" data-trim="false"> [[admin:show_navigation_link]]
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">[[admin:features]]</div>
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
            <div class="panel-heading">[[admin:control_panel]]</div>
            <div class="panel-body">
                <button type="button" class="btn btn-primary btn-block" id="save">[[admin:save_settings]]</button>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">[[admin:administrative_actions]]</div>
            <div class="panel-body">
                <div class="alert alert-warning">[[admin:warning_permanent]]</div>

                <button type="button" class="btn btn-danger btn-block" id="shoutbox-remove-deleted-button">[[admin:remove_deleted]]</button>
                <button type="button" class="btn btn-danger btn-block" id="shoutbox-remove-all-button">[[admin:remove_all]]</button>
            </div>
        <div
    </div>
</div>
