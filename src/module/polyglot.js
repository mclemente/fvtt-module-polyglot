import { Polyglot } from "./logic.js";
import { preloadTemplates } from "./preloadTemplates.js";
import {
	addSetting,
	registerSettings,
	renderPolyglotGeneralSettingsHandler
} from "./settings.js";
import { registerTours } from "./tour.js";

Hooks.once("init", () => {
	registerSettings();
	game.polyglot = new Polyglot();
	game.polyglot.init();
	game.polyglot.provider.init();
	return preloadTemplates();
});

Hooks.once("i18nInit", () => {
	for (let [key, data] of Object.entries(game.polyglot.provider.settings)) {
		addSetting(key, data);
	}
	game.polyglot.provider.i18nInit();
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
	game.polyglot.provider.setup();
});
Hooks.on("ready", async () => {
	await game.polyglot.ready();
	await game.polyglot.provider.ready();
});
Hooks.on("babele.ready", async () => {
	await game.polyglot.provider.initSequence();
	await game.polyglot.provider.setupSequence();
	Hooks.callAll("polyglot.languageProvider.ready");
});
Hooks.on("renderPolyglotGeneralSettings", renderPolyglotGeneralSettingsHandler);
