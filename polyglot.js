import { CUSTOM_FONT_SIZES } from "./module/Fonts.js";
import { LanguageProvider } from "./module/LanguageProvider.js";
import { PolyglotAPI } from "./module/api.js";
import { Polyglot } from "./module/logic.js";
import { addSetting, registerProviderSettings, registerSettings, renderPolyglotGeneralSettingsHandler, renderSettingsConfigHandler } from "./module/settings.js";

Hooks.once("init", () => {
	CONFIG.TinyMCE.content_css.push("/modules/polyglot/css/polyglot.css");
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
});

Hooks.on("setup", async () => {
	if (game.user.isGM && game.user.character) {
		console.warn(
			`Polyglot | ${game.i18n.format("POLYGLOT.GameMasterHasAssignedCharacter", {
				GM: game.i18n.localize("USER.RoleGamemaster"),
			})}`
		);
	}
	registerSettings();
	registerProviderSettings();
	await game.polyglot.languageProvider.setup();
});
Hooks.on("ready", () => {
	game.polyglot.ready();
	if (!Object.keys(game.settings.get("polyglot", "Languages")).length) game.settings.set("polyglot", "Languages", game.polyglot.languageProvider.languages);
	Hooks.callAll("polyglot.ready", LanguageProvider);
});
Hooks.on("renderSettingsConfig", renderSettingsConfigHandler);
Hooks.on("renderPolyglotGeneralSettings", renderPolyglotGeneralSettingsHandler);
