// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates() {
	const templatePaths = ["modules/polyglot/templates/FontSettings.hbs", "modules/polyglot/templates/GeneralSettings.hbs", "modules/polyglot/templates/LanguageSettings.hbs"];

	return loadTemplates(templatePaths);
}
