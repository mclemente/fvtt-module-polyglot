import {PolyglotLanguageSettings} from "./LanguageSettings.js"
/**
 * Shorthand for game.settings.register.
 * Default data: {scope: "world", config: true}
 * @function addSetting
 * @param {string} key
 * @param {object} data
 */
function addSetting (key, data) {
	const commonData = {
		scope: 'world',
		config: true
	};
	game.settings.register('polyglot', key, Object.assign(commonData, data));
}

export function registerSettings(PolyglotSingleton) {
	game.settings.registerMenu('polyglot', 'LanguageSettings', {
		name: 'Language Settings',
		label: 'Language Settings',
		icon: 'fas fa-globe',
		type: PolyglotLanguageSettings,
		restricted: true
	});
	game.settings.register('polyglot', "Alphabets", {
		name: game.i18n.localize("POLYGLOT.AlphabetsTitle"),
		hint: game.i18n.localize("POLYGLOT.AlphabetsHint"),
		scope: 'world',
		config: false,
		default: {},
		type: Object
	});
	game.settings.register('polyglot', "Languages", {
		name: game.i18n.localize("POLYGLOT.LanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.LanguagesHint"),
		scope: 'world',
		config: false,
		default: {},
		type: Object
	});
	game.settings.register('polyglot', "defaultLanguage", {
		name: game.i18n.localize("POLYGLOT.DefaultLanguageTitle"),
		hint: game.i18n.localize("POLYGLOT.DefaultLanguageHint"),
		scope: "client",
		config: true,
		default: "",
		type: String
	});
	addSetting("useUniqueSalt", {
		name: game.i18n.localize("POLYGLOT.RandomizeRunesTitle"),
		hint: game.i18n.localize("POLYGLOT.RandomizeRunesHint"),
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});
	addSetting("enableAllFonts", {
		name: game.i18n.localize("POLYGLOT.enableAllFontsTitle"),
		hint: game.i18n.localize("POLYGLOT.enableAllFontsHint"),
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});
	addSetting("exportFonts", {
		name: game.i18n.localize("POLYGLOT.ExportFontsTitle"),
		hint: game.i18n.localize("POLYGLOT.ExportFontsHint"),
		default: true,
		type: Boolean,
		onChange: () => PolyglotSingleton.updateConfigFonts()
	});

	//Language Settings
	addSetting("replaceLanguages", {
		name: game.i18n.localize("POLYGLOT.ReplaceLanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.ReplaceLanguagesHint"),
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});
	addSetting("customLanguages", {
		name: game.i18n.localize("POLYGLOT.CustomLanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.CustomLanguagesHint"),
		default: "",
		type: String,
		onChange: (value) => PolyglotSingleton.setCustomLanguages(value)
	});
	addSetting("comprehendLanguages", {
		name: game.i18n.localize("POLYGLOT.ComprehendLanguagesTitle"),
		hint: game.i18n.localize("POLYGLOT.ComprehendLanguagesHint"),
		default: "",
		type: String,
		onChange: (value) => PolyglotSingleton.comprehendLanguages = value.trim().toLowerCase().replace(/ \'/g, "_")
	});
	addSetting("truespeech", {
		name: game.i18n.localize("POLYGLOT.TruespeechTitle"),
		hint: game.i18n.localize("POLYGLOT.TruespeechHint"),
		default: "",
		type: String,
		onChange: (value) => PolyglotSingleton.truespeech = game.settings.get("polyglot","truespeech").trim().toLowerCase().replace(/ \'/g, "_")
	});

	//Chat Settings
	addSetting("display-translated", {
		name: game.i18n.localize("POLYGLOT.DisplayTranslatedTitle"),
		hint: game.i18n.localize("POLYGLOT.DisplayTranslatedHint"),
		default: true,
		type: Boolean
	});
	addSetting("hideTranslation", {
		name: game.i18n.localize("POLYGLOT.HideTranslationTitle"),
		hint: game.i18n.localize("POLYGLOT.HideTranslationHint"),
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});
	addSetting("allowOOC", {
		name: game.i18n.localize("POLYGLOT.AllowOOCTitle"),
		hint: game.i18n.localize("POLYGLOT.AllowOOCHint"),
		choices: {
			"a" : game.i18n.localize("POLYGLOT.AllowOOCOptions.a"),
			"b" : game.i18n.localize("POLYGLOT.AllowOOCOptions.b"),
			"c" : game.i18n.localize("POLYGLOT.AllowOOCOptions.c"),
			"d" : game.i18n.localize("POLYGLOT.AllowOOCOptions.d")
		},
		default: "b",
		type: String
	});
	addSetting("runifyGM", {
		name: game.i18n.localize("POLYGLOT.ScrambleGMTitle"),
		hint: game.i18n.localize("POLYGLOT.ScrambleGMHint"),
		default: true,
		type: Boolean,
		onChange: () => location.reload()
	});
}