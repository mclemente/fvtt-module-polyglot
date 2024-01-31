import { PolyglotAPI } from "./api.js";
import { Polyglot } from "./logic.js";
import { preloadTemplates } from "./preloadTemplates.js";
import { LanguageProvider } from "./providers/_module.js";
import {
	registerProviderSettings,
	registerSettings,
	renderPolyglotGeneralSettingsHandler,
	renderSettingsConfigHandler,
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
	game.polyglot.languageProvider.i18nInit();
});

Hooks.on("setup", async () => {
	if (game.user.isGM && game.user.character) {
		console.warn(
			`Polyglot | ${game.i18n.format("POLYGLOT.GameMasterHasAssignedCharacter", {
				GM: game.i18n.localize("USER.RoleGamemaster"),
			})}`,
		);
	}
	registerProviderSettings();
	registerTours();
	await game.polyglot.languageProvider.setup();
});
Hooks.on("ready", () => {
	game.polyglot.ready();
	Hooks.callAll("polyglot.ready", LanguageProvider);
	game.polyglot.languageProvider.ready();
});
Hooks.on("renderSettingsConfig", renderSettingsConfigHandler);
Hooks.on("renderPolyglotGeneralSettings", renderPolyglotGeneralSettingsHandler);
