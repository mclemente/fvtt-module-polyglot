// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates() {
	const templatePaths = [
		"modules/polyglot/templates/partials/settings.hbs",
		"modules/polyglot/templates/FontSettings.hbs",
		"modules/polyglot/templates/GeneralSettings.hbs",
		"modules/polyglot/templates/LanguageSettings.hbs",
	];

	return foundry.applications.handlebars.loadTemplates(templatePaths);
}
