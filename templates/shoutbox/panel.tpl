<div class="shoutbox mb-3" id="shoutbox-main">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <a class="fs-5 fw-semibold" href="/shoutbox" title="Shoutbox">{{{ if title }}}{title}{{{ else}}}[[shoutbox:shoutbox]]{{{ end }}}</a>

            <div class="btn-group">
                <a href="#" class="shoutbox-button-settings dropdown-toggle text-reset" data-bs-toggle="dropdown">
                    <span class="fa fa-wrench"></span>
                </a>
                <ul class="shoutbox-settings-menu dropdown-menu dropdown-menu-end">
                    <li>
                        <a class="dropdown-item" data-shoutbox-setting="toggles.sound" href="#">
                            <span class="fa fa-fw fa-check"></span> [[shoutbox:sound]]
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" data-shoutbox-setting="toggles.notification" href="#">
                            <span class="fa fa-fw fa-check"></span> [[shoutbox:notification]]
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" data-shoutbox-setting="toggles.hide" href="#">
                            <span class="fa fa-fw fa-check"></span> [[shoutbox:hide]]
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="card-body d-flex flex-column gap-1 p-0 pb-2 {{{ if config.shoutbox.settings.shoutbox:toggles:hide}}}hidden{{{ end }}}" style="min-height:0px;">
            <div class="shoutbox-content-container position-relative" style="min-height:0px;">
                <div class="shoutbox-content-overlay p-2 position-absolute bg-body w-100 mh-100 border-bottom overflow-auto d-flex align-items-center justify-content-between">
                    <span class="shoutbox-content-overlay-message"></span>
                    <a href="#" class="shoutbox-content-overlay-close fa fa-times"></a>
                </div>
                <div class="shoutbox-content h-100 p-2 text-sm"></div>
            </div>

            <div class="d-flex gap-1 px-2">
                <input type="text" placeholder="[[shoutbox:enter_message]]" name="shoutbox-message" class="shoutbox-message-input form-control">
                <span class="input-group-btn">
                    <button class="shoutbox-message-send-btn btn btn-primary" type="button">[[shoutbox:send_message]]</button>
                </span>
            </div>

            {{{ if features.length }}}
            <div class="shoutbox-message-buttons px-2">
                {{{ each features }}}
                {{{ if ./enabled }}}
                <button type="button" class="shoutbox-button-{./id} btn btn-primary btn-sm">
                    <span class="fa {./icon}"></span> {./button}
                </button>
                {{{ end }}}
                {{{ end }}}
            </div>
            {{{ end }}}
        </div>
    </div>
</div>
