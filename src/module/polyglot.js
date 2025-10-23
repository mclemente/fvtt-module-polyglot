import { PolyglotAPI } from "./api.js";
import { Polyglot } from "./logic.js";
import { preloadTemplates } from "./preloadTemplates.js";
import { LanguageProvider } from "./providers/_module.js";
import {
	registerProviderSettings,
	registerSettings,
	renderPolyglotGeneralSettingsHandler
} from "./settings.js";
import { registerTours } from "./tour.js";

Hooks.once("init", () => {
	CONFIG.TinyMCE.content_css.push("/modules/polyglot/styles/polyglot.css");
	registerSettings();
	const api = new PolyglotAPI();
	api.init();
	game.polyglot = new Polyglot();
	game.polyglot.init();
	api.attach();
	Hooks.callAll("polyglot.init", LanguageProvider);
	api.defaultProvider();
	api.updateProvider();
	game.polyglot.languageProvider.init();
	return preloadTemplates();
});

Hooks.once("i18nInit", () => {
	registerProviderSettings();
	game.polyglot.languageProvider.i18nInit();
});

Hooks.on("setup", () => {
	if (game.user.isGM && game.user.character) {
		console.warn(
			`Polyglot | ${game.i18n.format("POLYGLOT.GameMasterHasAssignedCharacter", {
				GM: game.i18n.localize("USER.RoleGamemaster"),
			})}`,
		);
	}
	registerTours();
	game.polyglot.languageProvider.setup();
});
Hooks.on("ready", async () => {
	await game.polyglot.ready();
	Hooks.callAll("polyglot.ready", LanguageProvider);
	await game.polyglot.languageProvider.ready();
});
Hooks.on("renderPolyglotGeneralSettings", renderPolyglotGeneralSettingsHandler);
