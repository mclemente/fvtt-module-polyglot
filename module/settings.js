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
		name: game.i18n.localize(`POLYGLOT.${key}Title`),
		hint: game.i18n.localize(`POLYGLOT.${key}Hint`),
		scope: "world",
		config: true,
	};
	game.settings.register("polyglot", key, Object.assign(commonData, data));
}

export function registerSettings() {
	//Font Settings Menu
	game.settings.registerMenu("polyglot", "FontSettings", {
		name: game.i18n.localize("POLYGLOT.FontSettings"),
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
		name: game.i18n.localize("POLYGLOT.LanguageSettings"),
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
		name: game.i18n.localize("POLYGLOT.directory.name"),
		hint: game.i18n.localize("POLYGLOT.directory.hint"),
		default: "",
		type: String,
		filePicker: true,
	});
	addSetting("source", {
		name: game.i18n.localize("POLYGLOT.source.name"),
		hint: game.i18n.localize("POLYGLOT.source.hint"),
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
		name: game.i18n.localize("POLYGLOT.DefaultLanguageTitle"),
		hint: game.i18n.localize("POLYGLOT.DefaultLanguageHint"),
		scope: "client",
		default: "",
		type: String,
	});

	//Font Settings
	addSetting("useUniqueSalt", {
		name: game.i18n.localize("POLYGLOT.RandomizeRunesTitle"),
		hint: game.i18n.localize("POLYGLOT.RandomizeRunesHint"),
		default: "a",
		type: String,
		choices: {
			a: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.a"),
			b: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.b"),
			c: game.i18n.localize("POLYGLOT.RandomizeRunesOptions.c"),
		},
	});
	addSetting("logographicalFontToggle", {
		name: game.i18n.localize("POLYGLOT.logographicalFontToggleTitle"),
		hint: game.i18n.localize("POLYGLOT.logographicalFontToggleHint"),
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
		name: game.i18n.localize("POLYGLOT.ExportFontsTitle"),
		hint: game.i18n.localize("POLYGLOT.ExportFontsHint"),
		default: true,
		type: Boolean,
		onChange: () => game.polyglot.updateConfigFonts(),
	});
	addSetting("JournalHighlight", {
		name: game.i18n.localize("POLYGLOT.JournalHighlightTitle"),
		hint: game.i18n.localize("POLYGLOT.JournalHighlightHint"),
		default: 25,
		type: Number,
		onChange: (value) => document.documentElement.style.setProperty("--polyglot-journal-opacity", value / 100),
	});

	//Language Settings
	addSetting("replaceLanguages", {
		name: game.i18n.localize("POLYGLOT.ReplaceLanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.ReplaceLanguagesHint"),
		default: false,
		type: Boolean,
		onChange: async () => {
			await currentLanguageProvider.getLanguages();
			currentLanguageProvider.loadTongues();
			currentLanguageProvider.reloadLanguages();
		},
	});
	addSetting("customLanguages", {
		name: game.i18n.localize("POLYGLOT.CustomLanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.CustomLanguagesHint"),
		default: "",
		type: String,
		onChange: () => {
			currentLanguageProvider.loadTongues();
			currentLanguageProvider.reloadLanguages();
		},
	});
	addSetting("comprehendLanguages", {
		name: game.i18n.localize("POLYGLOT.ComprehendLanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.ComprehendLanguagesHint"),
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.comprehendLanguages = value.trim().replace(/ \'/g, "_")),
	});
	addSetting("truespeech", {
		name: game.i18n.localize("POLYGLOT.TruespeechTitle"),
		hint: game.i18n.localize("POLYGLOT.TruespeechHint"),
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.truespeech = value.trim().replace(/ \'/g, "_")),
	});

	//Chat Settings
	addSetting("display-translated", {
		name: game.i18n.localize("POLYGLOT.DisplayTranslatedTitle"),
		hint: game.i18n.localize("POLYGLOT.DisplayTranslatedHint"),
		default: true,
		type: Boolean,
	});
	addSetting("hideTranslation", {
		name: game.i18n.localize("POLYGLOT.HideTranslationTitle"),
		hint: game.i18n.localize("POLYGLOT.HideTranslationHint"),
		default: false,
		type: Boolean,
		onChange: () => debouncedReload(),
	});
	addSetting("allowOOC", {
		name: game.i18n.localize("POLYGLOT.AllowOOCTitle"),
		hint: game.i18n.localize("POLYGLOT.AllowOOCHint"),
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
		name: game.i18n.localize("POLYGLOT.ScrambleGMTitle"),
		hint: game.i18n.localize("POLYGLOT.ScrambleGMHint"),
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
