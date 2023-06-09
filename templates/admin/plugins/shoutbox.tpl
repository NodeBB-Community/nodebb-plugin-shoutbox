<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 px-0 mb-4" tabindex="0">
			<div class="row">
				<div class="col-lg-8">
					<form class="form shoutbox-settings">
						<div class="card">
							<div class="card-header">[[shoutbox:shoutbox]]</div>
							<div class="card-body">
								<div class="mb-2">
									<label class="form-label" for="shoutlimit">[[admin:max_shouts_number]]</label>
									<select class="form-select" data-key="limits.shoutLimit">
										<option value="10">10</option>
										<option value="25">25</option>
										<option value="50">50</option>
									</select>
									<p class="help-text"><small>[[admin:deleted_shouts_included]]</small></p>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" data-key="toggles.guestsAllowed" data-trim="false">
									<label class="form-check-label">[[admin:allow_guest_read_access]]</label>
								</div>
							</div>
						</div>

						<div class="card">
							<div class="card-header">[[admin:features]]</div>
							<div class="card-body">
								<div class="features">
									{{{ each features }}}
									<div data-feature="{features.id}" class="shoutbox-admin-feature">
										<div class="form-check">
											<input class="form-check-input" type="checkbox" data-key="toggles.features.{features.id}" data-trim="false">
											<label class="form-check-label">
												&nbsp;
												<span>
													<i class="fa {features.icon} feature-icon"></i>
												</span>
												&nbsp;
												{features.name} - {features.description}
											</label>
										</div>
									</div>
									{{{ end }}}
								</div>
							</div>
						</div>
					</form>
				</div>

				<div class="col-lg-4">
					<div class="card">
						<div class="card-header">[[admin:administrative_actions]]</div>
						<div class="card-body">
							<div class="alert alert-warning text-sm">[[admin:warning_permanent]]</div>
							<div class="d-grid gap-2">
								<button type="button" class="btn btn-sm btn-danger" id="shoutbox-remove-deleted-button">[[admin:remove_deleted]]</button>
								<button type="button" class="btn btn-sm btn-danger" id="shoutbox-remove-all-button">[[admin:remove_all]]</button>
							</div>
						</div>
					<div>
				</div>
			</div>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
