import { currentLanguageProvider, getDefaultLanguageProvider, updateLanguageProvider } from "./api.js";
import { PolyglotLanguageSettings } from "./LanguageSettings.js";
import { PolyglotFontSettings } from "./FontSettings.js";
import { getFonts } from "../polyglot.js";

const debouncedReload = foundry.utils.debounce(() => {
	window.location.reload();
}, 100);

/**
 * Returns if the system is one of the systems that were originally supported prior to 1.7.2.
 *
 * @returns {Boolean}
 */
// prettier-ignore
function legacyGenericSystem() {
	const systems = [
		"aria", "dark-heresy", "dcc", "D35E", "dnd5e", "demonlord", "dsa5", "kryx_rpg", "ose",
		"pf1", "pf2e", "sfrpg", "shadowrun5e", "sw5e", "tormenta20", "uesrpg-d100", "wfrp4e"
	];
	return systems.includes(game.system.id);
}

/**
 * Shorthand for game.settings.register.
 * Default data: {scope: "world", config: true}
 * @function addSetting
 * @param {string} key
 * @param {object} data
 */
function addSetting(key, data) {
	const commonData = {
		name: `POLYGLOT.${key}Title`,
		hint: `POLYGLOT.${key}Hint`,
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
	addSetting("languageProvider", {
		//Has no name or hint
		config: false,
		type: String,
		default: getDefaultLanguageProvider(),
		onChange: updateLanguageProvider,
	});

	//Actual Settings
	addSetting("polyglotDirectory", {
		name: "POLYGLOT.directory.name",
		hint: "POLYGLOT.directory.hint",
		default: "",
		type: String,
		filePicker: true,
	});
	addSetting("source", {
		name: "POLYGLOT.source.name",
		hint: "POLYGLOT.source.hint",
		type: String,
		choices: {
			data: game.i18n.localize("POLYGLOT.source.data"),
			forgevtt: game.i18n.localize("POLYGLOT.source.forgevtt"),
			s3: game.i18n.localize("POLYGLOT.source.s3"),
		},
		default: "data",
		onChange: (value) => {
			getFonts();
		},
	});
	addSetting("defaultLanguage", {
		name: "POLYGLOT.DefaultLanguageTitle",
		hint: "POLYGLOT.DefaultLanguageHint",
		scope: "client",
		default: "",
		type: String,
	});

	//Font Settings
	addSetting("useUniqueSalt", {
		name: "POLYGLOT.RandomizeRunesTitle",
		hint: "POLYGLOT.RandomizeRunesHint",
		default: "a",
		type: String,
		choices: {
			a: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.a"),
			b: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.b"),
			c: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.c"),
		},
	});
	addSetting("logographicalFontToggle", {
		name: "POLYGLOT.logographicalFontToggleTitle",
		hint: "POLYGLOT.logographicalFontToggleHint",
		default: true,
		type: Boolean,
	});
	addSetting("enableAllFonts", {
		config: legacyGenericSystem(),
		default: false,
		type: Boolean,
		onChange: () => {
			currentLanguageProvider.loadAlphabet();
			game.settings.set("polyglot", "Alphabets", currentLanguageProvider.alphabets);
		},
	});
	addSetting("exportFonts", {
		name: "POLYGLOT.ExportFontsTitle",
		hint: "POLYGLOT.ExportFontsHint",
		default: true,
		type: Boolean,
		onChange: () => game.polyglot.updateConfigFonts(),
	});
	addSetting("JournalHighlight", {
		name: "POLYGLOT.JournalHighlightTitle",
		hint: "POLYGLOT.JournalHighlightHint",
		default: 25,
		type: Number,
		onChange: (value) => document.documentElement.style.setProperty("--polyglot-journal-opacity", value / 100),
	});

	//Language Settings
	addSetting("replaceLanguages", {
		name: "POLYGLOT.ReplaceLanguagesTitle",
		hint: "POLYGLOT.ReplaceLanguagesHint",
		default: false,
		type: Boolean,
		onChange: async () => {
			await currentLanguageProvider.getLanguages();
			currentLanguageProvider.loadTongues();
			currentLanguageProvider.reloadLanguages();
		},
	});
	addSetting("customLanguages", {
		name: "POLYGLOT.CustomLanguagesTitle",
		hint: "POLYGLOT.CustomLanguagesHint",
		default: "",
		type: String,
		onChange: () => {
			currentLanguageProvider.loadTongues();
			currentLanguageProvider.reloadLanguages();
		},
	});
	addSetting("comprehendLanguages", {
		name: "POLYGLOT.ComprehendLanguagesTitle",
		hint: "POLYGLOT.ComprehendLanguagesHint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.comprehendLanguages = value.trim().replace(/ \'/g, "_")),
	});
	addSetting("truespeech", {
		name: "POLYGLOT.TruespeechTitle",
		hint: "POLYGLOT.TruespeechHint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.truespeech = value.trim().replace(/ \'/g, "_")),
	});

	//Chat Settings
	addSetting("display-translated", {
		name: "POLYGLOT.DisplayTranslatedTitle",
		hint: "POLYGLOT.DisplayTranslatedHint",
		default: true,
		type: Boolean,
	});
	addSetting("hideTranslation", {
		name: "POLYGLOT.HideTranslationTitle",
		hint: "POLYGLOT.HideTranslationHint",
		default: false,
		type: Boolean,
		onChange: () => debouncedReload(),
	});
	addSetting("allowOOC", {
		name: "POLYGLOT.AllowOOCTitle",
		hint: "POLYGLOT.AllowOOCHint",
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
		name: "POLYGLOT.ScrambleGMTitle",
		hint: "POLYGLOT.ScrambleGMHint",
		default: false,
		type: Boolean,
		onChange: () => debouncedReload(),
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
