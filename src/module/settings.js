import { CUSTOM_FONT_SIZES } from "./Fonts.js";
import { PolyglotFontSettings } from "./forms/FontSettings.js";
import { PolyglotGeneralSettings } from "./forms/GeneralSettings.js";
import { PolyglotLanguageSettings } from "./forms/LanguageSettings.js";

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
	// General Settings Menu
	game.settings.registerMenu("polyglot", "GeneralSettings", {
		name: "POLYGLOT.GeneralSettings",
		label: "POLYGLOT.GeneralSettings",
		icon: "fas fa-cogs",
		type: PolyglotGeneralSettings,
	});
	// Font Settings Menu
	game.settings.registerMenu("polyglot", "FontSettings", {
		name: "POLYGLOT.FontSettings",
		label: "POLYGLOT.FontSettings",
		icon: "fas fa-font",
		type: PolyglotFontSettings,
		restricted: true,
	});
	// Language Settings Menu
	game.settings.registerMenu("polyglot", "LanguageSettings", {
		name: "POLYGLOT.LanguageSettings",
		label: "POLYGLOT.LanguageSettings",
		icon: "fas fa-globe",
		type: PolyglotLanguageSettings,
		restricted: true,
	});
	const { BooleanField, NumberField, SchemaField, StringField, TypedObjectField } = foundry.data.fields;
	addMenuSetting("Alphabets", {
		default: {},
		type: new TypedObjectField(
			new SchemaField({
				fontFamily: new StringField({ required: true, blank: false, initial: "" }),
				fontSize: new NumberField({
					required: true,
					nullable: false,
					min: 50,
					max: 350,
					integer: true,
					initial: 100,
				}),
				alphabeticOnly: new BooleanField(),
				logographical: new BooleanField(),
			})
		)
	});
	addMenuSetting("Languages", {
		default: {},
		// type: Object,
		type: new TypedObjectField(
			new SchemaField({
				label: new StringField({ required: true, blank: false, initial: "" }),
				font: new StringField({
					required: true,
					blank: false,
					initial: () => game.polyglot.languageProvider.defaultFont,
					choices: () => game.settings.get("polyglot", "Alphabets")
				}),
				rng: new StringField({ required: true, blank: false, initial: "default", choices: {
					default: "POLYGLOT.RandomizeRunesOptions.a",
					unique: "POLYGLOT.RandomizeRunesOptions.b",
					none: "POLYGLOT.RandomizeRunesOptions.c"
				}}),
			})
		)
	});

	// Font Settings
	addMenuSetting("RuneRegex", {
		default: false,
		type: Boolean,
	});
	addMenuSetting("enableAllFonts", {
		name: "POLYGLOT.enableAllFonts.title",
		hint: "POLYGLOT.enableAllFonts.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});
	addMenuSetting("exportFonts", {
		name: "POLYGLOT.ExportFonts.title",
		hint: "POLYGLOT.ExportFonts.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});

	// Journal Settings
	addMenuSetting("IgnoreJournalFontSize", {
		default: false,
		type: Boolean,
	});
	addMenuSetting("JournalHighlightColor", {
		default: "#ffb400",
		type: String,
		isColor: true,
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
	document.documentElement.style.setProperty(
		"--polyglot-journal-opacity",
		game.settings.get("polyglot", "JournalHighlight") / 100,
	);

	// Language Settings
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
		hasTextarea: true,
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

	// Chat Settings
	addMenuSetting("enableChatFeatures", {
		name: "POLYGLOT.EnableChatFeatures.title",
		hint: "POLYGLOT.EnableChatFeatures.hint",
		default: true,
		type: Boolean,
		requiresReload: true,
	});
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
	// allowOOC
	addMenuSetting("runifyGM", {
		name: "POLYGLOT.ScrambleGM.title",
		hint: "POLYGLOT.ScrambleGM.hint",
		default: false,
		type: Boolean,
		requiresReload: true,
	});

	// Used Internally
	addMenuSetting("CustomFontSizes", {
		default: CUSTOM_FONT_SIZES,
		type: new TypedObjectField(
			new NumberField({
				required: true,
				nullable: false,
				min: 50,
				max: 350,
				integer: true,
				initial: 100,
			})
		)
	});
	addMenuSetting("checkbox", {
		default: true,
		type: Boolean,
		scope: "user"
	});

	Hooks.on("i18nInit", () => {
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
	});
}

// Language Provider Settings
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
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
		}
		: null;
}
