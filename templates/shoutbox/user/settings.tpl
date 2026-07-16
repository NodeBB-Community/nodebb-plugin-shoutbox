<div class="form-check">
    <input class="form-check-input" type="checkbox" data-property="shoutbox:toggles:hide" {{{ if settings.shoutbox:toggles:hide }}}checked{{{ end }}}>
    <label class="form-check-label text-sm">{{tx("shoutbox:hide_shoutbox")}}</label>
</div>
<div class="form-check">
    <input class="form-check-input" type="checkbox" data-property="shoutbox:toggles:sound" {{{ if settings.shoutbox:toggles:sound }}}checked{{{ end }}}>
    <label class="form-check-label text-sm">{{tx("shoutbox:play_sound")}}</label>
</div>
<div class="form-check">
    <input class="form-check-input" type="checkbox" data-property="shoutbox:toggles:notification" {{{ if settings.shoutbox:toggles:notification }}}checked{{{ end }}}>
    <label class="form-check-label text-sm">{{tx("shoutbox:show_notification")}}</label>
</div>
