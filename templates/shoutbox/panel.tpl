<div class="shoutbox mb-3" id="shoutbox-main">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <a class="fs-5 fw-semibold" href="/shoutbox" title="Shoutbox">{{{ if title }}}{title}{{{ else}}}[[shoutbox:shoutbox]]{{{ end }}}</a>

            <div class="btn-group">
                <a href="#" class="shoutbox-button-settings dropdown-toggle" data-bs-toggle="dropdown">
                    <span class="fa fa-wrench"></span>
                </a>
                <ul class="shoutbox-settings-menu dropdown-menu">
                    <li>
                        <a class="dropdown-item" data-shoutbox-setting="toggles.sound" href="#">
                            <span class="fa fa-check"></span> [[shoutbox:sound]]
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" data-shoutbox-setting="toggles.notification" href="#">
                            <span class="fa fa-check"></span> [[shoutbox:notification]]
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" data-shoutbox-setting="toggles.hide" href="#">
                            <span class="fa fa-check"></span> [[shoutbox:hide]]
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="card-body d-flex flex-column gap-1" style="{hiddenStyle}">
            <div class="shoutbox-content-container">
                <div class="shoutbox-content-overlay">
                    <a href="#" class="shoutbox-content-overlay-close fa fa-times"></a>
                    <span class="shoutbox-content-overlay-message"></span>
                </div>
                <div class="shoutbox-content well well-sm"></div>
            </div>

            <div class="input-group">
                <input type="text" placeholder="[[shoutbox:enter_message]]" name="shoutbox-message" class="shoutbox-message-input form-control">
                <span class="input-group-btn">
                    <button class="shoutbox-message-send-btn btn btn-primary" type="button">[[shoutbox:send_message]]</button>
                </span>
            </div>

            {{{ if features.length }}}
            <div class="shoutbox-message-buttons">
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
