import { CUSTOM_FONT_SIZES } from "./module/Fonts.js";
import { LanguageProvider } from "./module/LanguageProvider.js";
import { PolyglotAPI } from "./module/api.js";
import { Polyglot } from "./module/logic.js";
import { addSetting, registerProviderSettings, registerSettings, renderSettingsConfigHandler } from "./module/settings.js";

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
	Handlebars.registerHelper({
		PolyglotBeautifyFont: (font) => {
			return font
				.split("% ")[1]
				.split(/(?=[A-Z])/)
				.join(" ");
		},
	});
	Hooks.callAll("polyglot.init", LanguageProvider);
});

Hooks.on("setup", async () => {
	registerSettings();
	registerProviderSettings();
	await game.polyglot.languageProvider.setup();
});
Hooks.on("ready", () => {
	game.polyglot.ready();
	if (!Object.keys(game.settings.get("polyglot", "Languages")).length) game.settings.set("polyglot", "Languages", game.polyglot.languageProvider.tongues);
	Hooks.callAll("polyglot.ready", LanguageProvider);
});
Hooks.on("renderSettingsConfig", renderSettingsConfigHandler);
