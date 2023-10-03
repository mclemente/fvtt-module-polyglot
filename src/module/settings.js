import { PolyglotFontSettings } from "./FontSettings.js";
import { PolyglotGeneralSettings } from "./GeneralSettings.js";
import { PolyglotLanguageSettings } from "./LanguageSettings.js";

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

export function addMenuSetting(key, data) {
	const commonData = {
		name: `POLYGLOT.${key}.title`,
		hint: `POLYGLOT.${key}.hint`,
		scope: "world",
		config: false,
	};
	game.settings.register("polyglot", key, Object.assign(commonData, data));
}

export function registerSettings() {
	//General Settings Menu
	game.settings.registerMenu("polyglot", "GeneralSettings", {
		name: "POLYGLOT.GeneralSettings",
		label: game.i18n.localize("POLYGLOT.GeneralSettings"),
		icon: "fas fa-cogs",
		type: PolyglotGeneralSettings,
	});
	//Font Settings Menu
	game.settings.registerMenu("polyglot", "FontSettings", {
		name: "POLYGLOT.FontSettings",
		label: game.i18n.localize("POLYGLOT.FontSettings"),
		icon: "fas fa-font",
		type: PolyglotFontSettings,
		restricted: true,
	});
	//Language Settings Menu
	game.settings.registerMenu("polyglot", "LanguageSettings", {
		name: "POLYGLOT.LanguageSettings",
		label: game.i18n.localize("POLYGLOT.LanguageSettings"),
		icon: "fas fa-globe",
		type: PolyglotLanguageSettings,
		restricted: true,
	});
	addMenuSetting("Alphabets", {
		config: false,
		default: {},
		type: Object,
	});
	addMenuSetting("Languages", {
		config: false,
		default: {},
		type: Object,
	});

	//Font Settings
	addMenuSetting("RuneRegex", {
		default: false,
		type: Boolean,
	});
	addMenuSetting("IgnoreJournalFontSize", {
		default: false,
		type: Boolean,
	});
	addMenuSetting("enableAllFonts", {
		name: game.i18n.format("POLYGLOT.enableAllFonts.title", {
			settingMenuLabel: game.i18n.localize("POLYGLOT.FontSettings"),
		}),
		hint: game.i18n.format("POLYGLOT.enableAllFonts.hint", {
			setting1: game.i18n.localize("POLYGLOT.FontSettings"),
			setting2: game.i18n.localize("POLYGLOT.LanguageSettings"),
		}),
		default: false,
		type: Boolean,
		requiresReload: true,
	});

	addMenuSetting("exportFonts", {
		name: "POLYGLOT.ExportFonts.title",
		hint: game.i18n.format("POLYGLOT.ExportFonts.hint", {
			settingMenuLabel: game.i18n.localize("SETTINGS.FontConfigN"),
		}),
		default: false,
		type: Boolean,
		requiresReload: true,
	});
	addMenuSetting("JournalHighlightColor", {
		default: "#ffb400",
		type: String,
		onChange: (value) => {
			document.documentElement.style.setProperty("--polyglot-journal-color", value);
		},
	});
	const hex = hexToRgb(game.settings.get("polyglot", "JournalHighlightColor"));
	document.documentElement.style.setProperty("--polyglot-journal-color", Object.values(hex).toString());
	addMenuSetting("JournalHighlight", {
		default: 25,
		range: {
			min: 0,
			max: 100,
			step: 1,
		},
		type: Number,
		onChange: (value) => {
			document.documentElement.style.setProperty("--polyglot-journal-opacity", value / 100);
		},
	});
	document.documentElement.style.setProperty("--polyglot-journal-opacity", game.settings.get("polyglot", "JournalHighlight") / 100);

	//Language Settings
	addMenuSetting("replaceLanguages", {
		name: "POLYGLOT.ReplaceLanguages.title",
		hint: "POLYGLOT.ReplaceLanguages.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
		onChange: async () => {
			await game.polyglot.languageProvider.getLanguages();
			game.polyglot.languageProvider.loadLanguages();
			game.polyglot.languageProvider.reloadLanguages();
		},
	});
	addMenuSetting("defaultLanguage", {
		name: "POLYGLOT.DefaultLanguage.title",
		hint: "POLYGLOT.DefaultLanguage.hint",
		default: "",
		type: String,
		onChange: () => {
			game.polyglot.languageProvider.getDefaultLanguage();
		},
	});
	addMenuSetting("customLanguages", {
		name: "POLYGLOT.CustomLanguages.title",
		hint: "POLYGLOT.CustomLanguages.hint",
		default: "",
		type: String,
		requiresReload: true,
		onChange: () => {
			game.polyglot.languageProvider.loadLanguages();
			game.polyglot.languageProvider.reloadLanguages();
		},
	});
	addMenuSetting("omniglot", {
		name: "POLYGLOT.Omniglot.title",
		hint: "POLYGLOT.Omniglot.hint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.omniglot = value.trim().replace(/'/g, "_")),
	});
	addMenuSetting("comprehendLanguages", {
		name: "POLYGLOT.ComprehendLanguages.title",
		hint: "POLYGLOT.ComprehendLanguages.hint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.comprehendLanguages = value.trim().replace(/'/g, "_")),
	});
	addMenuSetting("truespeech", {
		name: "POLYGLOT.Truespeech.title",
		hint: "POLYGLOT.Truespeech.hint",
		default: "",
		type: String,
		onChange: (value) => (game.polyglot.truespeech = value.trim().replace(/'/g, "_")),
	});

	//Chat Settings
	addMenuSetting("display-translated", {
		name: "POLYGLOT.DisplayTranslated.title",
		hint: "POLYGLOT.DisplayTranslated.hint",
		default: true,
		type: Boolean,
	});
	addMenuSetting("hideTranslation", {
		name: "POLYGLOT.HideTranslation.title",
		hint: "POLYGLOT.HideTranslation.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});
	addMenuSetting("allowOOC", {
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
	addMenuSetting("runifyGM", {
		name: "POLYGLOT.ScrambleGM.title",
		hint: "POLYGLOT.ScrambleGM.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});
}

//Language Provider Settings
export function registerProviderSettings() {
	const systemSpecificSettings = game.polyglot.languageProvider.settings;
	if (Object.keys(systemSpecificSettings).length) {
		for (let [key, data] of Object.entries(systemSpecificSettings)) {
			addSetting(key, data);
		}
	}
}

export async function renderPolyglotGeneralSettingsHandler(settingsConfig, html) {
	const JournalHighlightColor = game.settings.get("polyglot", "JournalHighlightColor");

	const JournalHighlight = game.settings.get("polyglot", "JournalHighlight");
	const JournalHighlightInput = html.find('input[name="JournalHighlight"]');
	const JournalHighlightNotes = JournalHighlightInput.parent().children()[3];
	if (JournalHighlightNotes) JournalHighlightNotes.classList.add("polyglot-journal-temp");
	const hex = hexToRgb(JournalHighlightColor);
	document.documentElement.style.setProperty("--polyglot-journal-color-temp", Object.values(hex).toString());
	document.documentElement.style.setProperty("--polyglot-journal-opacity-temp", JournalHighlight / 100);

	JournalHighlightInput.on("change", (event) => {
		document.documentElement.style.setProperty("--polyglot-journal-opacity-temp", event.target.value / 100);
	});

	const JournalHighlightColorPicker = html.find('input[data-edit="JournalHighlightColor"]');
	JournalHighlightColorPicker.on("change", (event) => {
		const hex = hexToRgb(event.target.value);
		document.documentElement.style.setProperty("--polyglot-journal-color-temp", Object.values(hex).toString());
	});
}

export async function renderSettingsConfigHandler(settingsConfig, html) {
	if (game.settings.settings.has("polyglot.languageDataPath")) {
		const languageDataPath = game.settings.get("polyglot", "languageDataPath");
		const languageDataPathInput = html.find('input[name="polyglot.languageDataPath"]');
		const LanguageRegexInput = html.find('input[name="polyglot.LanguageRegex"]');
		const literacyDataPathInput = html.find('input[name="polyglot.literacyDataPath"]');
		if (languageDataPath) disableCheckbox(LanguageRegexInput, true);
		else disableCheckbox(literacyDataPathInput, true);
		languageDataPathInput.on("change", (event) => {
			disableCheckbox(LanguageRegexInput, event.target.value.length);
			disableCheckbox(literacyDataPathInput, !event.target.value.length);
		});
	}
}

export function disableCheckbox(checkbox, boolean) {
	checkbox.prop("disabled", boolean);
}

export function getNestedData(data, path) {
	if (!RegExp(/^([\w_-]+\.)*([\w_-]+)$/).test(path)) {
		return null;
	}
	const paths = path.split(".");
	if (!paths.length) {
		return null;
	}
	let res = data;
	for (let i = 0; i < paths.length; i += 1) {
		if (res === undefined) {
			return null;
		}
		res = res?.[paths[i]];
	}
	return res;
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
}
