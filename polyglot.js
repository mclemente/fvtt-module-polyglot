import { currentLanguageProvider, initApi } from "./module/api.js";
import { LanguageProvider } from "./module/LanguageProvider.js";
import { Polyglot } from "./module/logic.js";
import { addSetting, registerSettings, registerProviderSettings, renderSettingsConfigHandler } from "./module/settings.js";

Hooks.once("init", () => {
	CONFIG.TinyMCE.content_css.push("/modules/polyglot/css/polyglot.css");
	initApi();
	addSetting("CustomFontSizes", {
		config: false,
		default: {},
		type: Object,
	});
	game.polyglot = new Polyglot();
	game.polyglot.init();
	Hooks.callAll("polyglot.init", LanguageProvider);
});

Hooks.on("setup", async () => {
	registerSettings();
	registerProviderSettings();
	await currentLanguageProvider.setup();
});
Hooks.on("ready", () => {
	game.polyglot.ready();
	if (!Object.keys(game.settings.get("polyglot", "Languages")).length) game.settings.set("polyglot", "Languages", currentLanguageProvider.tongues);
	Hooks.callAll("polyglot.ready", LanguageProvider);
});
Hooks.on("renderSettingsConfig", renderSettingsConfigHandler);
