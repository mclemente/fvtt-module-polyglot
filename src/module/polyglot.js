import { CUSTOM_FONT_SIZES } from "./Fonts.js";
import { LanguageProvider } from "./LanguageProvider.js";
import { PolyglotAPI } from "./api.js";
import { Polyglot } from "./logic.js";
import { preloadTemplates } from "./preloadTemplates.js";
import {
	addSetting,
	registerProviderSettings,
	registerSettings,
	renderPolyglotGeneralSettingsHandler,
	renderSettingsConfigHandler,
} from "./settings.js";

Hooks.once("init", () => {
	CONFIG.TinyMCE.content_css.push("/modules/polyglot/styles/polyglot.css");
	addSetting("CustomFontSizes", {
		config: false,
		default: CUSTOM_FONT_SIZES,
		type: Object,
	});
	const api = new PolyglotAPI();
	api.init();
	game.polyglot = new Polyglot();
	game.polyglot.init();
	api.attach();
	Hooks.callAll("polyglot.init", LanguageProvider);
	api.defaultProvider();
	api.updateProvider();
	return preloadTemplates();
});

Hooks.on("setup", async () => {
	if (game.user.isGM && game.user.character) {
		console.warn(
			`Polyglot | ${game.i18n.format("POLYGLOT.GameMasterHasAssignedCharacter", {
				GM: game.i18n.localize("USER.RoleGamemaster"),
			})}`,
		);
	}
	registerSettings();
	registerProviderSettings();
	await game.polyglot.languageProvider.setup();
});
Hooks.on("ready", () => {
	game.polyglot.ready();
	Hooks.callAll("polyglot.ready", LanguageProvider);
});
Hooks.on("renderSettingsConfig", renderSettingsConfigHandler);
Hooks.on("renderPolyglotGeneralSettings", renderPolyglotGeneralSettingsHandler);
