import { currentLanguageProvider, initApi } from "./module/api.js";
import { LanguageProvider } from "./module/LanguageProvider.js";
import { Polyglot } from "./module/logic.js";
import { registerSettings, registerProviderSettings } from "./module/settings.js";

Hooks.once("init", () => {
	CONFIG.TinyMCE.content_css.push("/modules/polyglot/css/polyglot.css");
	initApi();
	registerSettings();
	registerProviderSettings();
	game.polyglot = new Polyglot();
	game.polyglot.init();
	Hooks.callAll("polyglot.init", LanguageProvider);
});

Hooks.on("setup", async () => {
	await currentLanguageProvider.setup();
});
Hooks.on("ready", () => {
	game.polyglot.ready();
	if (!Object.keys(game.settings.get("polyglot", "Languages")).length) game.settings.set("polyglot", "Languages", currentLanguageProvider.tongues);
	Hooks.callAll("polyglot.ready", LanguageProvider);
});
