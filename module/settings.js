import { currentLanguageProvider, getDefaultLanguageProvider, updateLanguageProvider } from "./api.js";
import { PolyglotLanguageSettings } from "./LanguageSettings.js";
import { PolyglotFontSettings } from "./FontSettings.js";

/**
 * Shorthand for game.settings.register.
 * Default data: {scope: "world", config: true}
 * @function addSetting
 * @param {string} key
 * @param {object} data
 */
export function addSetting(key, data) {
	const commonData = {
		name: `POLYGLOT.${key}.title`,
		hint: `POLYGLOT.${key}.hint`,
		scope: "world",
		config: true,
	};
	game.settings.register("polyglot", key, Object.assign(commonData, data));
}

export function registerSettings() {
	//Font Settings Menu
	game.settings.registerMenu("polyglot", "FontSettings", {
		name: "POLYGLOT.FontSettings",
		label: game.i18n.localize("POLYGLOT.FontSettings"),
		icon: "fas fa-font",
		type: PolyglotFontSettings,
		restricted: true,
	});
	addSetting("CustomFontSizes", {
		config: false,
		default: {},
		type: Object,
	});

	//Language Settings Menu
	game.settings.registerMenu("polyglot", "LanguageSettings", {
		name: "POLYGLOT.LanguageSettings",
		label: game.i18n.localize("POLYGLOT.LanguageSettings"),
		icon: "fas fa-globe",
		type: PolyglotLanguageSettings,
		restricted: true,
	});
	addSetting("Alphabets", {
		config: false,
		default: {},
		type: Object,
	});
	addSetting("Languages", {
		config: false,
		default: {},
		type: Object,
	});

	//Actual Settings
	addSetting("defaultLanguage", {
		name: "POLYGLOT.DefaultLanguage.title",
		hint: "POLYGLOT.DefaultLanguage.hint",
		scope: "client",
		default: "",
		type: String,
	});

	//Font Settings
	addSetting("useUniqueSalt", {
		name: "POLYGLOT.RandomizeRunes.title",
		hint: "POLYGLOT.RandomizeRunes.hint",
		default: "a",
		type: String,
		choices: {
			a: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.a"),
			b: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.b"),
			c: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.c"),
		},
	});
	addSetting("RuneRegex", {
		default: false,
		type: Boolean,
	});
	addSetting("IgnoreJournalFontSize", {
		default: false,
		type: Boolean,
	});
	addSetting("logographicalFontToggle", {
		name: "POLYGLOT.logographicalFontToggle.title",
		hint: "POLYGLOT.logographicalFontToggle.hint",
		default: true,
		type: Boolean,
	});
	addSetting("enableAllFonts", {
		config: !currentLanguageProvider.isGeneric,
		default: false,
		type: Number,
		choices: {
			0: game.i18n.localize("POLYGLOT.enableAllFonts.choices.0"),
			1: game.i18n.localize("POLYGLOT.enableAllFonts.choices.1"),
			2: game.i18n.localize("POLYGLOT.enableAllFonts.choices.2"),
			3: game.i18n.localize("POLYGLOT.enableAllFonts.choices.3"),
		},
		onChange: () => {
			currentLanguageProvider.loadAlphabet();
			game.settings.set("polyglot", "Alphabets", currentLanguageProvider.alphabets);
		},
	});
	addSetting("exportFonts", {
		name: "POLYGLOT.ExportFonts.title",
		hint: "POLYGLOT.ExportFonts.hint",
		default: true,
		type: Boolean,
		onChange: (value) => game.polyglot.updateConfigFonts(value),
	});
	addSetting("JournalHighlight", {
		name: "POLYGLOT.JournalHighlight.title",
		hint: "POLYGLOT.JournalHighlight.hint",
		default: 25,
		type: Number,
		onChange: (value) => document.documentElement.style.setProperty("--polyglot-journal-opacity", value / 100),
	});

	//Language Settings
	addSetting("replaceLanguages", {
		name: "POLYGLOT.ReplaceLanguages.title",
		hint: "POLYGLOT.ReplaceLanguages.hint",
		default: false,
		type: Boolean,
		onChange: async () => {
			await currentLanguageProvider.getLanguages();
			currentLanguageProvider.loadTongues();
			currentLanguageProvider.reloadLanguages();
		},
	});
	addSetting("customLanguages", {
		name: "POLYGLOT.CustomLanguages.title",
		hint: "POLYGLOT.CustomLanguages.hint",
		default: "",
		type: String,
		onChange: () => {
			currentLanguageProvider.loadTongues();
			currentLanguageProvider.reloadLanguages();
		},
	});
	addSetting("comprehendLanguages", {
		name: "POLYGLOT.ComprehendLanguages.title",
		hint: "POLYGLOT.ComprehendLanguages.hint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.comprehendLanguages = value.trim().replace(/ \'/g, "_")),
	});
	addSetting("truespeech", {
		name: "POLYGLOT.Truespeech.title",
		hint: "POLYGLOT.Truespeech.hint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.truespeech = value.trim().replace(/ \'/g, "_")),
	});

	//Chat Settings
	addSetting("display-translated", {
		name: "POLYGLOT.DisplayTranslated.title",
		hint: "POLYGLOT.DisplayTranslated.hint",
		default: true,
		type: Boolean,
	});
	addSetting("hideTranslation", {
		name: "POLYGLOT.HideTranslation.title",
		hint: "POLYGLOT.HideTranslation.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});
	addSetting("allowOOC", {
		name: "POLYGLOT.AllowOOC.title",
		hint: "POLYGLOT.AllowOOC.hint",
		choices: {
			a: game.i18n.localize("POLYGLOT.AllowOOCOptions.a"),
			b: game.i18n.localize("POLYGLOT.AllowOOCOptions.b"),
			c: game.i18n.localize("POLYGLOT.AllowOOCOptions.c"),
			d: game.i18n.localize("POLYGLOT.AllowOOCOptions.d"),
		},
		default: "b",
		type: String,
	});
	addSetting("runifyGM", {
		name: "POLYGLOT.ScrambleGM.title",
		hint: "POLYGLOT.ScrambleGM.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});
}

//Language Provider Settings
export function registerProviderSettings() {
	const systemSpecificSettings = currentLanguageProvider.settings;
	if (Object.keys(systemSpecificSettings).length) {
		for (let [key, data] of Object.entries(systemSpecificSettings)) {
			addSetting(key, data);
		}
	}
}
