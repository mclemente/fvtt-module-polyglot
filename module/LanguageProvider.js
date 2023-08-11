import { getNestedData } from "./settings.js";

/**
 * Base class for all language providers.
 * If you want to offer a language provider in your system/module you must derive this class.
 */
export class LanguageProvider {
	/**
	 * @param {String} id
	 */
	constructor(id) {
		this.id = id;
	}

	/** The provider's default font key. */
	defaultFont = "Thorass";

	/**
	 * Polyglot's fonts.
	 * @var {String} fontSize - the font's size in %
	 * @var {String} fontFamily - the font's name as they are set in the CSS (generally space-less)
	 * @var {Boolean} alphabeticOnly - Optional. If a font type is meant to only replace alphabetic characters. This meant for font types that don't have all characters set.
	 * @var {Boolean} logographical - Optional. If a font is meant to use the logographical logic (e.g. Aztec, Chinese and Oriental fonts).
	 * @var {Object} replace - NOT IMPLEMENTED. Optional. A {string : replacement} pair.
	 */
	fonts = {
		"Ar Ciela": {
			fontSize: "200",
			fontFamily: "ArCiela",
			alphabeticOnly: true,
		},
		Aztec: {
			fontSize: "200",
			fontFamily: "Aztec",
			logographical: true,
		},
		Barazhad: {
			fontSize: "200",
			fontFamily: "Barazhad",
		},
		Celestial: {
			fontSize: "200",
			fontFamily: "Celestial",
		},
		Daedra: {
			fontSize: "200",
			fontFamily: "Daedra",
		},
		"Dark Eldar": {
			fontSize: "200",
			fontFamily: "DarkEldar",
			logographical: true,
		},
		Davek: {
			fontSize: "150",
			fontFamily: "Davek",
		},
		Dethek: {
			fontSize: "200",
			fontFamily: "Dethek",
		},
		"Dragon Alphabet": {
			fontSize: "170",
			fontFamily: "DragonAlphabet",
		},
		"Elder Futhark": {
			fontSize: "350",
			fontFamily: "ElderFuthark",
		},
		Eltharin: {
			fontSize: "200",
			fontFamily: "Eltharin",
			logographical: true,
		},
		Espruar: {
			fontSize: "150",
			fontFamily: "Espruar",
		},
		"Finger Alphabet": {
			fontSize: "150",
			fontFamily: "FingerAlphabet",
			alphabeticOnly: true,
			logographical: true,
		},
		Floki: {
			fontSize: "200",
			fontFamily: "Floki",
		},
		"High Drowic": {
			fontSize: "150",
			fontFamily: "HighDrowic",
		},
		"Highschool Runes": {
			fontSize: "200",
			fontFamily: "HighschoolRunes",
		},
		Infernal: {
			fontSize: "230",
			fontFamily: "Infernal",
		},
		Iokharic: {
			fontSize: "170",
			fontFamily: "Iokharic",
		},
		"Jungle Slang": {
			fontSize: "180",
			fontFamily: "JungleSlang",
			logographical: true,
		},
		Kargi: {
			fontSize: "150",
			fontFamily: "Kargi",
		},
		"Kremlin Premier": {
			fontSize: "130",
			fontFamily: "KremlinPremier",
			alphabeticOnly: true,
		},
		"Mage Script": {
			fontSize: "200",
			fontFamily: "MageScript",
			alphabeticOnly: true,
			logographical: true,
		},
		"Maras Eye": {
			fontSize: "200",
			fontFamily: "MarasEye",
		},
		"Meroitic Demotic": {
			fontSize: "200",
			fontFamily: "MeroiticDemotic",
			alphabeticOnly: true,
		},
		"Miroslav Normal": {
			fontSize: "200",
			fontFamily: "MiroslavNormal",
		},
		MusiQwik: {
			fontSize: "200",
			fontFamily: "MusiQwik",
		},
		"Ny Stormning": {
			fontSize: "160",
			fontFamily: "NyStormning",
		},
		"Olde English": {
			fontSize: "150",
			fontFamily: "OldeEnglish",
			alphabeticOnly: true,
		},
		"Olde Espruar": {
			fontSize: "200",
			fontFamily: "OldeEspruar",
		},
		"Olde Thorass": {
			fontSize: "200",
			fontFamily: "OldeThorass",
		},
		Ophidian: {
			fontSize: "250",
			fontFamily: "Ophidian",
		},
		Oriental: {
			fontSize: "130",
			fontFamily: "Oriental",
			logographical: true,
		},
		"Ork Glyphs": {
			fontSize: "200",
			fontFamily: "OrkGlyphs",
		},
		Pulsian: {
			fontSize: "270",
			fontFamily: "Pulsian",
			alphabeticOnly: true,
		},
		Qijomi: {
			fontSize: "200",
			fontFamily: "Qijomi",
		},
		Reanaarian: {
			fontSize: "200",
			fontFamily: "Reanaarian",
		},
		Rellanic: {
			fontSize: "200",
			fontFamily: "Rellanic",
		},
		Saurian: {
			fontSize: "200",
			fontFamily: "Saurian",
			logographical: true,
		},
		"Scrapbook Chinese": {
			fontSize: "130",
			fontFamily: "ScrapbookChinese",
			logographical: true,
		},
		Semphari: {
			fontSize: "200",
			fontFamily: "Semphari",
			alphabeticOnly: true,
		},
		Skaven: {
			fontSize: "200",
			fontFamily: "Skaven",
			logographical: true,
		},
		Tengwar: {
			fontSize: "200",
			fontFamily: "Tengwar",
		},
		Thassilonian: {
			fontSize: "200",
			fontFamily: "Thassilonian",
			logographical: true,
		},
		Thorass: {
			fontSize: "200",
			fontFamily: "Thorass",
		},
		Tuzluca: {
			fontSize: "200",
			fontFamily: "Tuzluca",
			alphabeticOnly: true,
		},
		Valmaric: {
			fontSize: "200",
			fontFamily: "Valmaric",
		},
	};

	/**
	 * The system's original languages.
	 * @var {String} label - The language's displayed name.
	 * @var {String} font - The key of a font set in this.fonts.
	 * @var {String} rng - Determines which type of RNG is used to generate a phrase. Base Polyglot supports these; "Default", "Unique" and "None".
	 */
	languages = {
		/*
		languageKey: {
			label: languageName, // Optional if set on this.getLanguages
			font: fontName,
			rng: "default", // Optional. Added automatically during this.getLanguages
			//See https://github.com/mclemente/fvtt-module-polyglot/issues/283
		},
		*/
	};

	/** This is needed if the LanguageProvider gets languages from compendiums, since they require the game state to be ready. */
	requiresReady = false;

	/** Legacy Support for old alphabets */
	get alphabets() {
		const alphabets = {};
		for (const language of Object.keys(this.languages)) {
			const font = this.fonts[this.languages[language].font];
			alphabets[language] = `${font.fontSize}% ${font.fontFamily}`;
		}
		return alphabets;
	}

	/** Provider settings to be added by the module. */
	get settings() {
		return {};
	}

	get replaceLanguages() {
		return game.settings.get("polyglot", "replaceLanguages");
	}

	///////////
	// Hooks //
	///////////

	/**
	 * Loads everything that can't be loaded on the constructor due to async/await.
	 * It Hooks on ready if the system depends on reading compendiums.
	 */
	async setup() {
		const setupSteps = async () => {
			await this.getLanguages();

			game.polyglot.omniglot = game.settings.get("polyglot", "omniglot");
			game.polyglot.comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages");
			game.polyglot.truespeech = game.settings.get("polyglot", "truespeech");
			const enableAllFonts = game.settings.get("polyglot", "enableAllFonts");
			if (enableAllFonts) {
				for (let font in game.settings.get("core", "fonts")) {
					const fontSize = game.polyglot.CustomFontSizes[font] ?? "100";
					this.addFont(font, fontSize);
				}
			}
			this.loadFonts();
			this.loadLanguages();
			this.loadCustomFonts();
			this.reloadLanguages();
			this.getDefaultLanguage();
		};
		if (this.requiresReady) {
			if (game.modules.get("babele")?.active) {
				Hooks.on("babele.ready", async () => {
					await setupSteps();
					Hooks.callAll("polyglot.languageProvider.ready");
				});
			} else {
				Hooks.on("ready", async () => {
					await setupSteps();
					Hooks.callAll("polyglot.languageProvider.ready");
				});
			}
		} else {
			await setupSteps();
		}
	}

	/**
	 * Even though the base method doesn't have an await, some providers might need it to look into compendiums.
	 */
	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (CONFIG[game.system.id.toUpperCase()]?.languages) {
			if (CONFIG[game.system.id.toUpperCase()].languages.constructor === Object) {
				if (this.replaceLanguages) {
					CONFIG[game.system.id.toUpperCase()].languages = {};
				}
				const systemLanguages = CONFIG[game.system.id.toUpperCase()].languages;
				Object.keys(systemLanguages).forEach((key) => {
					const label = game.i18n.localize(systemLanguages[key]);
					if (label) {
						langs[key] = {
							label,
							font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
							rng: languagesSetting[key]?.rng ?? "default",
						};
					}
				});
				this.languages = langs;
			}
			if (CONFIG[game.system.id.toUpperCase()].languages.constructor === Array) {
				if (this.replaceLanguages) {
					CONFIG[game.system.id.toUpperCase()].languages = [];
				}
				for (let key of CONFIG[game.system.id.toUpperCase()].languages) {
					const label = game.i18n.localize(key);
					if (!label) continue;
					langs[key.toLowerCase()] = {
						label,
						font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
						rng: languagesSetting[key]?.rng ?? "default",
					};
				}
				this.languages = langs;
			}
		} else if (Object.keys(this.languages).length) {
			if (this.replaceLanguages) {
				this.languages = {};
			} else {
				Object.keys(this.languages).forEach((key) => {
					const label = this.languages[key].label;
					if (label) {
						langs[key] = {
							label,
							font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
							rng: languagesSetting[key]?.rng ?? "default",
						};
					}
				});
				this.languages = langs;
			}
		}
	}

	/**
	 * Sets the fonts that will be available to choose on the settings.
	 */
	loadFonts() {
		this.fonts = new LanguageProvider().fonts;
		const enableAllFonts = game.settings.get("polyglot", "enableAllFonts");
		for (let font in this.fonts) {
			if (game.polyglot.CustomFontSizes[font]) {
				this.fonts[font].fontSize = game.polyglot.CustomFontSizes[font];
			}
		}
		if (enableAllFonts) {
			for (let font in game.settings.get("core", "fonts")) {
				const fontSize = game.polyglot.CustomFontSizes[font] ?? 100;
				this.addFont(font, fontSize);
			}
		}
	}
	/**
	 * Add languages from the settings to this.languages.
	 */
	loadLanguages() {
		const customLanguages = game.settings.get("polyglot", "customLanguages");
		const omniglot = game.settings.get("polyglot", "omniglot");
		const comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages");
		const truespeech = game.settings.get("polyglot", "truespeech");
		if (this.replaceLanguages) this.languages = {};
		if (customLanguages) {
			for (let lang of customLanguages.split(/[,;]/)) {
				lang = lang.trim();
				this.addLanguage(lang);
			}
		}
		if (omniglot && !customLanguages.includes(omniglot)) this.addLanguage(omniglot);
		if (comprehendLanguages && !customLanguages.includes(comprehendLanguages)) this.addLanguage(comprehendLanguages);
		if (truespeech && !customLanguages.includes(truespeech)) this.addLanguage(truespeech);
	}
	/**
	 * Replace languages's fonts with the Languages setting's fonts.
	 */
	loadCustomFonts() {
		const langSettings = game.settings.get("polyglot", "Languages");
		if (JSON.stringify(langSettings) !== JSON.stringify(this.languages)) return;
		for (let lang in langSettings) {
			if (lang in this.languages && JSON.stringify(this.languages[lang]) !== JSON.stringify(langSettings[lang])) {
				this.languages[lang] = langSettings[lang];
			}
		}
	}
	/**
	 * Called when Custom Languages setting is changed.
	 */
	reloadLanguages() {
		const langSettings = deepClone(game.settings.get("polyglot", "Languages"));
		if (JSON.stringify(langSettings) !== JSON.stringify(this.languages) || !Object.keys(langSettings).length) return;
		for (const key of Object.keys(langSettings)) {
			if (!(key in this.languages)) {
				delete this.languages[key];
				this.removeFromConfig(lang);
			}
		}
		for (const key of Object.keys(this.languages)) {
			if (!(key in langSettings)) {
				langSettings[key] = this.languages[key];
			}
		}
		this.languages = langSettings;
	}

	///////////////////
	// Font Handling //
	///////////////////

	/**
	 * Adds a font to the Provider.
	 * @param {String} lang
	 * @param {Object} options
	 * @see loadFonts
	 */
	addFont(fontFamily, fontSize = 100, options = {}) {
		const key = fontFamily.toLowerCase();
		const defaultOptions = {
			alphabeticOnly: false,
			logographical: false,
			// replace: {},
		};

		const font = Object.assign({}, defaultOptions, options, {
			fontSize,
			fontFamily,
		});

		this.fonts[key] = font;
	}

	/**
	 * Removes a font from the Provider.
	 * @param {String} lang
	 */
	removeFont(font) {
		const key = font.toLowerCase();
		delete this.fonts[key];
	}

	///////////////////////
	// Language Handling //
	///////////////////////

	/**
	 * Adds a language to the Provider.
	 * @param {String} lang
	 * @param {Object} options
	 * @see loadLanguages
	 */
	addLanguage(lang, options = {}) {
		if (!lang) return;

		const key = lang.toLowerCase().replace(/[\s\']/g, "_");
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const defaultOptions = {
			font: this.defaultFont,
			rng: languagesSetting[key]?.rng ?? "default",
		};

		const language = Object.assign({}, defaultOptions, options, {
			label: lang,
		});

		this.languages[key] = language;
		this.addToConfig(key, lang);
	}

	/**
	 * Removes a language from the Provider if it isn't set a Custom Language.
	 * Generally called when Comprehend Languages or Tongues setting are changed.
	 * @param {String} lang
	 */
	removeLanguage(lang) {
		if (!lang) return;
		const customLanguages = game.settings.get("polyglot", "customLanguages");
		if (customLanguages.includes(lang)) return;
		const key = lang
			.trim()
			.toLowerCase()
			.replace(/[\s\']/g, "_");
		delete this.languages[key];
		this.removeFromConfig(key);
	}

	/**
	 * Returns the system's default language if it exists.
	 * @returns {String}
	 */
	getSystemDefaultLanguage() {
		const keys = Object.keys(this.languages);
		if (keys.includes("common")) return "common";
		return this.languages[0] || keys[0] || "";
	}

	/**
	 * Returns defaultLang if it exists and is either a key or value on this.languages.
	 * Otherwise, returns the system's default language.
	 */
	getDefaultLanguage() {
		const defaultLang = game.settings.get("polyglot", "defaultLanguage");
		if (defaultLang) {
			if (this.languages[defaultLang]) this.defaultLanguage = defaultLang;
			else {
				const inverted = invertObject(this.languages);
				if (inverted[defaultLang]) this.defaultLanguage = inverted[defaultLang];
			}
		} else this.defaultLanguage = this.getSystemDefaultLanguage();
	}

	getLanguageFont(lang) {
		return this.languages[lang]?.font;
	}

	/////////////////////
	// Config Handling //
	/////////////////////

	/**
	 * Adds a key to the languages object.
	 * Important for systems that read it for their language selector.
	 * @param {String} key
	 * @param {String} lang
	 */
	addToConfig(key, lang) {
		if (CONFIG[game.system.id.toUpperCase()]?.languages) {
			if (Array.isArray(CONFIG[game.system.id.toUpperCase()].languages)) CONFIG[game.system.id.toUpperCase()].languages.push(lang);
			else CONFIG[game.system.id.toUpperCase()].languages[key] = lang;
		}
	}

	/**
	 * Removes a key from the languages object.
	 * @param {String} key
	 */
	removeFromConfig(key) {
		if (CONFIG[game.system.id.toUpperCase()]?.languages) delete CONFIG[game.system.id.toUpperCase()].languages[key];
	}

	////////////////////
	// User Languages //
	////////////////////

	/**
	 * Gets an actor's languages.
	 * @param {Document} actor
	 * @var literateLanguages	For systems that support literacy (e.g. reading journals).
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) knownLanguages.add(lang);
			if (actor.system.traits.languages.custom) {
				for (let lang of actor.system.traits.languages?.custom.split(/[,;]/)) knownLanguages.add(lang.trim().toLowerCase());
			}
		} else if (actor.system?.languages?.value) {
			for (let lang of actor.system.languages.value) knownLanguages.add(lang);
			if (actor.system.languages.custom) {
				for (let lang of actor.system.languages?.custom.split(/[,;]/)) knownLanguages.add(lang.trim().toLowerCase());
			}
		} else if (this.languageDataPath?.length) {
			let data = getNestedData(actor, this.languageDataPath);
			for (let lang of data.split(/[,;]/)) knownLanguages.add(lang.trim().toLowerCase());
			if (this.literacyDataPath.length) {
				let data = getNestedData(actor, this.literacyDataPath);
				for (let lang of data.split(/[,;]/)) literateLanguages.add(lang.trim().toLowerCase());
			}
		} else if (game.settings.settings.has("polyglot.LanguageRegex")) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			let myRegex = new RegExp(languageRegex + "\\s*\\((.+)\\)", "i");
			for (let item of actor.items) {
				const name = item?.flags?.babele?.originalName || item.name;
				// adding only the descriptive language name, not "Language (XYZ)"
				if (myRegex.test(name)) knownLanguages.add(name.match(myRegex)[1].trim().toLowerCase());
			}
		}
		return [knownLanguages, literateLanguages];
	}

	/**
	 * Returns the set with the languages to be shown on the journal.
	 * Useful for systems where speaking and reading are separate skills.
	 * @param {string} lang
	 * @returns {Boolean}
	 * @see demonlordLanguageProvider.conditions
	 * @see dsa5LanguageProvider.conditions
	 */
	conditions(lang) {
		return game.polyglot.knownLanguages.has(lang);
	}
}

export class GenericLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			languageDataPath: {
				hint: game.i18n.format("POLYGLOT.languageDataPath.hint", {
					setting: game.i18n.localize("POLYGLOT.LanguageRegex.title"),
				}),
				default: "",
				type: String,
				requiresReload: true,
			},
			literacyDataPath: {
				hint: game.i18n.format("POLYGLOT.literacyDataPath.hint", {
					setting: game.i18n.localize("POLYGLOT.languageDataPath.title"),
				}),
				default: "",
				type: String,
				requiresReload: true,
			},
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	async setup() {
		this.languageDataPath = game.settings.get("polyglot", "languageDataPath");
		this.literacyDataPath = game.settings.get("polyglot", "literacyDataPath");
		if (this.languageDataPath.startsWith("actor.")) this.languageDataPath = this.languageDataPath.slice(6);
		if (this.literacyDataPath.startsWith("actor.")) this.literacyDataPath = this.literacyDataPath.slice(6);
		super.setup();
	}
}

export class a5eLanguageProvider extends LanguageProvider {
	languages = {
		aarakocra: {
			font: "Olde Thorass",
		},
		abyssal: {
			font: "Infernal",
		},
		aquan: {
			font: "Dethek",
		},
		auran: {
			font: "Dethek",
		},
		celestial: {
			font: "Celestial",
		},
		common: {
			font: "Thorass",
		},
		deep: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarvish: {
			font: "Dethek",
		},
		elvish: {
			font: "Espruar",
		},
		giant: {
			font: "Dethek",
		},
		gith: {
			font: "Pulsian",
		},
		gnoll: {
			font: "Kargi",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Dethek",
		},
		halfling: {
			font: "Thorass",
		},
		ignan: {
			font: "Dethek",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		primordial: {
			font: "Dethek",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Dethek",
		},
		cant: {
			font: "Thorass",
		},
		undercommon: {
			font: "High Drowic",
		},
	};

	/**
	 * Get an actor's languages
	 * @param {Document} actor
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		const knownLanguages = new Set();
		const literateLanguages = new Set();

		const langs = actor.system.proficiencies?.languages;
		if (!langs) return [knownLanguages, literateLanguages];

		langs.forEach((lang) => {
			if (this.languages[lang]) knownLanguages.add(lang);
		});

		return [knownLanguages, literateLanguages];
	}
}

export class ariaLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		kohestien: {
			font: "Tuzluca",
		},
		aqab: {
			font: "Ar Ciela",
		},
		staum: {
			font: "Floki",
		},
		osmanlien: {
			font: "Eltharin",
		},
		mon: {
			font: "Valmaric",
		},
		nok: {
			font: "Dark Eldar",
		},
		carredass: {
			font: "Celestial",
		},
		blanc: {
			font: "Ork Glyphs",
		},
		knigien: {
			font: "Tengwar",
		},
		esperan: {
			font: "Thassilonian",
		},
		altabiancais: {
			font: "Espruar",
		},
		altanegrais: {
			font: "Espruar",
		},
	};

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		knownLanguages.add(game.i18n.localize("ARIA.languages.Common"));
		for (let lang of actor.items) {
			if (lang.system.language) knownLanguages.add(lang.name.toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}

export class coc7LanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let item of actor.items) {
			const match =
				item.name.match(game.settings.get("polyglot", "LanguageRegex") + "\\s*\\((.+)\\)", "i") ||
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOwn") + "\\s*\\((.+)\\)", "i") ||
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageAny") + "\\s*\\((.+)\\)", "i") ||
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOther") + "\\s*\\((.+)\\)", "i");
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match) knownLanguages.add(match[1].trim().toLowerCase());
			else {
				switch (item.system.specialization) {
					case "LanguageSpec":
					case "Language":
					case "Language (Own)":
					case "Language (Other)":
					case game.i18n.localize("POLYGLOT.COC7.LanguageOwn"):
					case game.i18n.localize("POLYGLOT.COC7.LanguageAny"):
					case game.i18n.localize("POLYGLOT.COC7.LanguageOther"):
					case game.i18n.localize("CoC7.language"):
						knownLanguages.add(item.name.trim().toLowerCase());
						break;
					default:
						break;
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}

export class cyberpunkRedLanguageProvider extends LanguageProvider {
	defaultFont = "Olde English";

	languages = {
		streetslang: {
			font: "Olde English",
		},
		arabic: {
			font: "Ar Ciela",
		},
		bengali: {
			font: "Olde English",
		},
		berber: {
			font: "Olde English",
		},
		burmese: {
			font: "Ar Ciela",
		},
		cantonese: {
			font: "Oriental",
		},
		chinese: {
			font: "Oriental",
		},
		cree: {
			font: "Olde English",
		},
		creole: {
			font: "Olde English",
		},
		dari: {
			font: "Olde English",
		},
		dutch: {
			font: "Olde English",
		},
		english: {
			font: "Olde English",
		},
		farsi: {
			font: "Ar Ciela",
		},
		filipino: {
			font: "Ar Ciela",
		},
		finnish: {
			font: "Kremlin Premier",
		},
		french: {
			font: "Olde English",
		},
		german: {
			font: "Miroslav Normal",
		},
		guarani: {
			font: "Olde English",
		},
		hausa: {
			font: "Olde English",
		},
		hawaiian: {
			font: "Olde English",
		},
		hebrew: {
			font: "Olde English",
		},
		hindi: {
			font: "Ar Ciela",
		},
		indonesian: {
			font: "Ar Ciela",
		},
		italian: {
			font: "Olde English",
		},
		japanese: {
			font: "Oriental",
		},
		khmer: {
			font: "Ar Ciela",
		},
		korean: {
			font: "Oriental",
		},
		lingala: {
			font: "Olde English",
		},
		malayan: {
			font: "Ar Ciela",
		},
		mandarin: {
			font: "Oriental",
		},
		maori: {
			font: "Olde English",
		},
		mayan: {
			font: "Olde English",
		},
		mongolian: {
			font: "Ar Ciela",
		},
		navajo: {
			font: "Olde English",
		},
		nepali: {
			font: "Ar Ciela",
		},
		norwegian: {
			font: "Miroslav Normal",
		},
		oromo: {
			font: "Olde English",
		},
		pamanyungan: {
			font: "Olde English",
		},
		polish: {
			font: "Kremlin Premier",
		},
		portuguese: {
			font: "Olde English",
		},
		quechua: {
			font: "Olde English",
		},
		romanian: {
			font: "Kremlin Premier",
		},
		russian: {
			font: "Kremlin Premier",
		},
		sinhalese: {
			font: "Olde English",
		},
		spanish: {
			font: "Olde English",
		},
		swahili: {
			font: "Olde English",
		},
		tahitian: {
			font: "Olde English",
		},
		tamil: {
			font: "Olde English",
		},
		turkish: {
			font: "Ar Ciela",
		},
		twi: {
			font: "Olde English",
		},
		ukrainian: {
			font: "Kremlin Premier",
		},
		urdu: {
			font: "Ar Ciela",
		},
		vietnamese: {
			font: "Ar Ciela",
		},
		yoruba: {
			font: "Olde English",
		},
	};

	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	async getLanguages() {
		const originalLanguages = {
			streetslang: "Streetslang",
			arabic: "Arabic",
			bengali: "Bengali",
			berber: "Berber",
			burmese: "Burmese",
			cantonese: "Cantonese",
			chinese: "Scrapbook Chinese",
			cree: "Cree",
			creole: "Creole",
			dari: "Dari",
			dutch: "Dutch",
			english: "English",
			farsi: "Farsi",
			filipino: "Filipino",
			finnish: "Finnish",
			french: "French",
			german: "German",
			guarani: "Guarani",
			hausa: "Hausa",
			hawaiian: "Hawaiian",
			hebrew: "Hebrew",
			hindi: "Hindi",
			indonesian: "Indonesian",
			italian: "Italian",
			japanese: "Japanese",
			khmer: "Khmer",
			korean: "Korean",
			lingala: "Lingala",
			malayan: "Malayan",
			mandarin: "Mandarin",
			maori: "Maori",
			mayan: "Mayan",
			mongolian: "Mongolian",
			navajo: "Navajo",
			nepali: "Nepali",
			norwegian: "Norwegian",
			oromo: "Oromo",
			pamanyungan: "Pama-nyungan",
			polish: "Polish",
			portuguese: "Portuguese",
			quechua: "Quechua",
			romanian: "Romanian",
			russian: "Russian",
			sinhalese: "Sinhalese",
			spanish: "Spanish",
			swahili: "Swahili",
			tahitian: "Tahitian",
			tamil: "Tamil",
			turkish: "Turkish",
			twi: "Twi",
			ukrainian: "Ukrainian",
			urdu: "Urdu",
			vietnamese: "Vietnamese",
			yoruba: "Yoruba",
		};
		const langs = {};
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang in originalLanguages) {
			const label = originalLanguages[lang];
			if (!label) continue;
			langs[lang] = {
				label,
				font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const languageRegex = game.settings.get("polyglot", "LanguageRegex");
		let myRegex = new RegExp(languageRegex + "\\s*\\((.+)\\)", "i");
		for (let item of actor.items) {
			if (item.type == "skill") {
				if (myRegex.test(item.name)) {
					knownLanguages.add(item.name.match(myRegex)[1].trim().toLowerCase());
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}

export class d35eLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		aarakocra: {
			font: "Olde Thorass",
		},
		abyssal: {
			font: "Infernal",
		},
		aquan: {
			font: "Dethek",
		},
		auran: {
			font: "Dethek",
		},
		celestial: {
			font: "Celestial",
		},
		deep: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarven: {
			font: "Dethek",
		},
		elven: {
			font: "Espruar",
		},
		giant: {
			font: "Dethek",
		},
		gith: {
			font: "tirsu",
		},
		gnoll: {
			font: "Kargi",
		},
		gnome: {
			font: "Dethek",
		},
		goblin: {
			font: "Dethek",
		},
		halfling: {
			font: "Thorass",
		},
		ignan: {
			font: "Dethek",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		primordial: {
			font: "Dethek",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Dethek",
		},
		cant: {
			font: "Thorass",
		},
		treant: {
			font: "Olde Espruar",
		},
		undercommon: {
			font: "High Drowic",
		},
	};
}

export class darkHeresyLanguageProvider extends LanguageProvider {
	languages = {
		lowGothic: {
			font: "Infernal",
		},
		chapterRunes: {
			font: "",
		},
		chaosMarks: {
			font: "",
		},
		eldar: {
			font: "",
		},
		highGothic: {
			font: "Infernal",
		},
		imperialCodes: {
			font: "",
		},
		mercenary: {
			font: "",
		},
		necrontyr: {
			font: "",
		},
		ork: {
			font: "Ork Glyphs",
		},
		technaLingua: {
			font: "",
		},
		tau: {
			font: "",
		},
		underworld: {
			font: "",
		},
		xenosMarkings: {
			font: "",
		},
	};

	getSystemDefaultLanguage() {
		return "lowGothic";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
		} else {
			const originalLanguages = {
				chapterRunes: "Chapter Runes",
				chaosMarks: "Chaos Marks",
				eldar: "Eldar",
				highGothic: "High Gothic",
				imperialCodes: "Imperial Codes",
				lowGothic: "Low Gothic",
				mercenary: "Mercenary",
				necrontyr: "Necrontyr",
				ork: "Ork",
				tau: "Tau",
				technaLingua: "Techna-Lingua",
				underworld: "Underworld",
				xenosMarkings: "Xenos Markings",
			};
			const langs = {};
			const languagesSetting = game.settings.get("polyglot", "Languages");
			for (let lang in originalLanguages) {
				langs[lang] = {
					label: originalLanguages[lang],
					font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
					rng: languagesSetting[lang]?.rng ?? "default",
				};
			}
			this.languages = langs;
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang in actor.system.skills.linguistics.specialities) {
			if (actor.system.skills.linguistics.specialities[lang]["advance"] >= 0) knownLanguages.add(lang);
		}
		return [knownLanguages, literateLanguages];
	}
}

export class dccLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		draconic: {
			font: "Iokharic",
		},
		dwarvish: {
			font: "Dethek",
		},
		elvish: {
			font: "Espruar",
		},
		giant: {
			font: "Dethek",
		},
		gnoll: {
			font: "Kargi",
		},
		goblin: {
			font: "Dethek",
		},
		halfling: {
			font: "Thorass",
		},
		orc: {
			font: "Dethek",
		},
		cant: {
			font: "Thorass",
		},
	};

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.details.languages.split(/[,;]/)) knownLanguages.add(lang.trim().toLowerCase());
		return [knownLanguages, literateLanguages];
	}
}

export class demonlordLanguageProvider extends LanguageProvider {
	languages = {
		"Common Tongue": {
			font: "Thorass",
		},
		"Dark Speech": {
			font: "Infernal",
		},
		"High Archaic": {
			font: "Mage Script",
		},
		Elvish: {
			font: "Espruar",
		},
		Dwarfish: {
			font: "Dethek",
		},
		"Dead Languages": {
			font: "Olde Thorass",
		},
		"Secret Language": {
			font: "Thassilonian",
		},
		Trollish: {
			font: "Ar Ciela",
		},
		Centauri: {
			font: "High Drowic",
		},
		Gnomish: {
			font: "High Drowic",
		},
		Amrin: {
			font: "Thorass",
		},
		Balgrennish: {
			font: "Tengwar",
		},
		Bhali: {
			font: "Tengwar",
		},
		Edene: {
			font: "Thorass",
		},
		Erath: {
			font: "Thorass",
		},
		Grennish: {
			font: "Tengwar",
		},
		Kalasan: {
			font: "Thorass",
		},
		Woad: {
			font: "Jungle Slang",
		},
		Sylphen: {
			font: "High Drowic",
		},
		Molekin: {
			font: "Barazhad",
		},
		Naga: {
			font: "Barazhad",
		},
		Yerath: {
			font: "Barazhad",
		},
	};

	get requiresReady() {
		return true;
	}

	getSystemDefaultLanguage() {
		return "Common Tongue";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const demonlordPack = game.packs.get("demonlord.languages");
		const demonlordItemList = await demonlordPack.getIndex();
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let item of demonlordItemList) {
			const originalName = item?.flags?.babele?.originalName || item.name;
			this.languages[originalName] = {
				label: item.name,
				font: languagesSetting[originalName]?.font || this.languages[originalName]?.font || this.defaultFont,
				rng: languagesSetting[originalName]?.rng ?? "default",
			};
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let item of actor.items) {
			if (item.type === "language") {
				const name = item?.flags?.babele?.originalName || item.name;
				if (item.system.speak) knownLanguages.add(name);
				if (item.system.read) literateLanguages.add(name);
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}

export class dnd4eLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		abyssal: {
			font: "Barazhad",
		},
		deep: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		dwarven: {
			font: "Davek",
		},
		elven: {
			font: "Rellanic",
		},
		giant: {
			font: "Davek",
		},
		goblin: {
			font: "Davek",
		},
		primordial: {
			font: "Davek",
		},
		supernal: {
			font: "Celestial",
		},
	};

	addToConfig(key, lang) {
		CONFIG.DND4EBETA.spoken[key] = lang;
	}
	removeFromConfig(key) {
		delete CONFIG.DND4EBETA.spoken[key];
	}

	async getLanguages() {
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.DND4EBETA.spoken = {};
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang in CONFIG.DND4EBETA.spoken) {
			langs[lang] = {
				label: CONFIG.DND4EBETA.spoken[lang],
				font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
		}
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.languages.spoken.value) {
			knownLanguages.add(lang);
		}
		// for (let lang of actor.system.languages.script.value) {
		// 	literateLanguages.add(lang);
		// }
		return [knownLanguages, literateLanguages];
	}
}

export class dnd5eLanguageProvider extends LanguageProvider {
	languages = {
		aarakocra: {
			font: "Olde Thorass",
		},
		abyssal: {
			font: "Infernal",
		},
		aquan: {
			font: "Dethek",
		},
		auran: {
			font: "Dethek",
		},
		celestial: {
			font: "Celestial",
		},
		common: {
			font: "Thorass",
		},
		deep: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarvish: {
			font: "Dethek",
		},
		elvish: {
			font: "Espruar",
		},
		giant: {
			font: "Dethek",
		},
		gith: {
			font: "Pulsian",
		},
		gnoll: {
			font: "Kargi",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Dethek",
		},
		halfling: {
			font: "Thorass",
		},
		ignan: {
			font: "Dethek",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		primordial: {
			font: "Dethek",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Dethek",
		},
		cant: {
			font: "Thorass",
		},
		undercommon: {
			font: "High Drowic",
		},
	};

	get settings() {
		return {
			"DND5E.SpecialLanguages": {
				type: String,
				default: game.i18n.localize("DND5E.LanguagesCommon"),
			},
		};
	}

	/**
	 * Gets an actor's languages.
	 * @param {Document} actor
	 * @var literateLanguages	For systems that support literacy (e.g. reading journals).
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) {
				knownLanguages.add(lang.trim().replace(/[\s\']/g, "_"));
			}
			if (actor.system.traits.languages.custom) {
				const defaultSpecialLanguage = game.settings.get("polyglot", "DND5E.SpecialLanguages").trim().toLowerCase();
				for (let lang of actor.system.traits.languages?.custom.split(/[;]/)) {
					lang = lang.trim().toLowerCase();
					try {
						if (/(usually common)|(in life)|(its creator)|(?<=any)(.*)(?=language)/i.test(lang)) {
							knownLanguages.add(defaultSpecialLanguage);
						} else if (/(?<=usually)(.*)(?=\))/g.test(lang)) {
							lang = lang.match(/(?<=usually)(.*)(?=\))/g)[0].trim();
							knownLanguages.add(lang);
						} else if (/(?<=understands)(.*)(?=but can't speak it)/g.test(lang)) {
							lang = lang.match(/(?<=understands)(.*)(?=but can't speak it)/g)[0].trim();
							knownLanguages.add(lang);
						} else if (/(.*)(?=plus)/.test(lang)) {
							lang = lang.match(/(.*)(?=plus)/)[0].trim();
							knownLanguages.add(lang);
						} else knownLanguages.add(lang);
					} catch (err) {
						console.error(`Polyglot | Failed to get custom language "${lang}" from actor "${actor.name}".`, err);
					}
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}

export class dsa5LanguageProvider extends LanguageProvider {
	defaultFont = "Ophidian";

	languages = {
		garethi: {
			label: "Garethi",
			font: "Miroslav Normal",
			rng: "default",
		},
		alaani: {
			label: "Alaani",
			font: "Miroslav Normal",
			rng: "default",
		},
		"altes alaani": {
			label: "Altes Alaani",
			font: "Highschool Runes",
			rng: "default",
		},
		amulashtra: {
			label: "Amulashtra",
			font: "Qijomi",
			rng: "default",
		},
		angram: {
			label: "Angram",
			font: "Skaven",
			rng: "default",
		},
		"angram-bilderschrift": {
			label: "Angram-Bilderschrift",
			font: "Skaven",
			rng: "default",
		},
		arkanil: {
			label: "Arkanil",
			font: "Ar Ciela",
			rng: "default",
		},
		asdharia: {
			label: "Asdharia",
			font: "Tengwar",
			rng: "default",
		},
		atak: {
			label: "Atak",
			font: "FingerAlphabet",
			rng: "default",
		},
		aureliani: {
			label: "Aureliani",
			font: "Infernal",
			rng: "default",
		},
		bosparano: {
			label: "Bosparano",
			font: "Miroslav Normal",
			rng: "default",
		},
		chrmk: {
			label: "Chrmk",
			font: "Iokharic",
			rng: "default",
		},
		chuchas: {
			label: "Chuchas",
			font: "Kargi",
			rng: "default",
		},
		"drakhard-zinken": {
			label: "Drakhard-Zinken",
			font: "Celestial",
			rng: "default",
		},
		fjarningsch: {
			label: "Fjarningsch",
			font: "Dethek",
			rng: "default",
		},
		"geheiligte glyphen von unau": {
			label: "Geheiligte Glyphen von Unau",
			font: "High Drowic",
			rng: "default",
		},
		"gimaril-glyphen": {
			label: "Gimaril-Glyphen",
			font: "Semphari",
			rng: "default",
		},
		goblinisch: {
			label: "Goblinisch",
			font: "Ork Glyphs",
			rng: "default",
		},
		"hjaldingsche hunen": {
			font: "Olde Thorass",
			rng: "default",
		},
		"imperiale zeichen": {
			label: "Imperiale Zeichen",
			font: "Infernal",
			rng: "default",
		},
		isdira: {
			label: "Isdira",
			font: "Tengwar",
			rng: "default",
		},
		"isdira- und asdharia-zeichen": {
			label: "Isdira- und Asdharia-Zeichen",
			font: "Tengwar",
			rng: "default",
		},
		"kusliker zeichen": {
			label: "Kusliker Zeichen",
			font: "Miroslav Normal",
			rng: "default",
		},
		mohisch: {
			label: "Mohisch",
			font: "Jungle Slang",
			rng: "default",
		},
		"nanduria-zeichen": {
			label: "Nanduria-Zeichen",
			font: "Espruar",
			rng: "default",
		},
		nujuka: {
			label: "Nujuka",
			font: "Reanaarian",
			rng: "default",
		},
		ogrisch: {
			label: "Ogrisch",
			font: "Ork Glyphs",
			rng: "default",
		},
		oloarkh: {
			label: "Oloarkh",
			font: "Ork Glyphs",
			rng: "default",
		},
		ologhaijan: {
			label: "Ologhaijan",
			font: "Ork Glyphs",
			rng: "default",
		},
		protozelemja: {
			label: "Protozelemja",
			font: "Kargi",
			rng: "default",
		},
		rabensprache: {
			label: "Rabensprache",
			font: "Valmaric",
			rng: "default",
		},
		rogolan: {
			label: "Rogolan",
			font: "Elder Futhark",
			rng: "default",
		},
		"rogolan-runen": {
			label: "Rogolan-Runen",
			font: "Elder Futhark",
			rng: "default",
		},
		rssahh: {
			label: "Rssahh",
			font: "Iokharic",
			rng: "default",
		},
		ruuz: {
			label: "Ruuz",
			font: "Valmaric",
			rng: "default",
		},
		"saga-thorwalsch": {
			label: "Saga-Thorwalsch",
			font: "Olde Thorass",
			rng: "default",
		},
		tahaya: {
			label: "Tahaya",
			font: "Jungle Slang",
			rng: "default",
		},
		thorwalsch: {
			label: "Thorwalsch",
			font: "Floki",
			rng: "default",
		},
		"thorwalsche runen": {
			label: "Thorwalsche Runen",
			font: "Floki",
			rng: "default",
		},
		trollisch: {
			label: "Trollisch",
			font: "Eltharin",
			rng: "default",
		},
		"trollische raumbildschrift": {
			label: "Trollische Raumbildschrift",
			font: "Eltharin",
			rng: "default",
		},
		tulamidya: {
			label: "Tulamidya",
			font: "Valmaric",
			rng: "default",
		},
		"tulamidya-zeichen": {
			label: "Tulamidya-Zeichen",
			font: "Valmaric",
			rng: "default",
		},
		"ur-tulamidya": {
			label: "Ur-Tulamidya",
			font: "Olde Espruar",
			rng: "default",
		},
		"ur-tulamidya-zeichen": {
			label: "Ur-Tulamidya-Zeichen",
			font: "Olde Espruar",
			rng: "default",
		},
		"yash-hualay-glyphen": {
			label: "Yash-Hualay-Glyphen",
			font: "Kargi",
			rng: "default",
		},
		zelemja: {
			label: "Zelemja",
			font: "Iokharic",
			rng: "default",
		},
		zhayad: {
			label: "Zhayad",
			font: "Pulsian",
			rng: "default",
		},
		"zhayad-zeichen": {
			label: "Zhayad-Zeichen",
			font: "Pulsian",
			rng: "default",
		},
		zyklopäisch: {
			label: "Zyklopäisch",
			font: "Miroslav Normal",
			rng: "default",
		},
	};

	get requiresReady() {
		return true;
	}

	getSystemDefaultLanguage() {
		return "garethi";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		if (game.modules.has("dsa5-core") && game.modules.get("dsa5-core").active) {
			//use old compendium for versions < 11, remove this if module's version doesn't support those foundry versions anymore
			const packName = Number(game.version.split(".")[0]) < 11 ? "abilities" : "equipment";
			const dsa5Pack = game.packs.get(`dsa5-core.core${packName}`) ?? game.packs.get(`dsa5-core.coreen${packName}`);
			const languages = {};
			if (dsa5Pack) {
				const dsa5ItemList = await dsa5Pack.getIndex();
				const languageRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + "\\s*\\((.+)\\)", "i");
				const literacyRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + "\\s*\\((.+)\\)", "i");
				const languagesSetting = game.settings.get("polyglot", "Languages");
				for (const item of dsa5ItemList) {
					if (languageRegex.test(item.name)) {
						const label = item.name.match(languageRegex)[1].trim();
						const key = label.toLowerCase();
						languages[key] = {
							label,
							font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
							rng: languagesSetting[key]?.rng ?? "default",
						};
					} else if (literacyRegex.test(item.name)) {
						const label = item.name.match(literacyRegex)[1].trim();
						const key = label.toLowerCase();
						languages[key] = {
							label,
							font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
							rng: languagesSetting[key]?.rng ?? "default",
						};
					}
				}
				this.languages = languages;
			} else {
				ui.notifications.error(`Polyglot | The ${game.modules.get("dsa5-core").title} pack wasn't retrieved correctly. Defaulting to built-in languages.`, {
					console: false,
				});
			}
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		let languageRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + "\\s*\\((.+)\\)", "i");
		let literacyRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + "\\s*\\((.+)\\)", "i");
		for (let item of actor.items) {
			if (item.system.category?.value === "language") {
				if (languageRegex.test(item.name)) {
					knownLanguages.add(item.name.match(languageRegex)[1].trim().toLowerCase());
				} else if (literacyRegex.test(item.name)) {
					literateLanguages.add(item.name.match(literacyRegex)[1].trim().toLowerCase());
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}

export class earthdawn4eLanguageProvider extends LanguageProvider {
	languages = {
		human: {
			font: "Thorass",
		},
		dwarven: {
			font: "Dethek",
		},
		elven: {
			font: "Espruar",
		},
		windling: {
			font: "Olde Thorass",
		},
		obsidiman: {
			font: "Dethek",
		},
		troll: {
			font: "Jungle Slang",
		},
		ork: {
			font: "Dethek",
		},
		tskrang: {
			font: "Iokharic",
		},
	};

	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
			LiteracyRegex: {
				name: "Literacy Regex",
				hint: "Same as Language Regex, but for written languages.",
				type: String,
				default: "Speak",
			},
		};
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang in this.languages) {
			this.languages[lang] = {
				label: game.i18n.localize(`earthdawn.l.language${lang.capitalize()}`),
				font: languagesSetting[lang]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang in actor.system.speak.languages) {
			if (actor.system.speak.languages[lang]) knownLanguages.add(lang);
		}
		for (let lang in actor.system.languages.write) {
			if (actor.system.write.languages[lang]) literateLanguages.add(lang);
		}
		if (actor.system.languages.other) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			const literacyRegex = game.settings.get("polyglot", "LiteracyRegex");
			for (let lang of actor.system.languages.other.split(/[,;]/)) {
				const languageMatch = lang.match(languageRegex + " \\((.+)\\)", "i");
				const literacyMatch = lang.match(literacyRegex + " \\((.+)\\)", "i");
				if (languageMatch || literacyMatch) {
					if (languageMatch) knownLanguages.add(languageMatch[1].trim().toLowerCase());
					else if (literacyMatch) literateLanguages.add(literacyMatch[1].trim().toLowerCase());
				} else {
					knownLanguages.add(lang.trim().toLowerCase());
					literateLanguages.add(lang.trim().toLowerCase());
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}

export class fggLanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.languages.value) knownLanguages.add(lang.toLowerCase());
		if (actor.system.languages.custom) {
			for (let lang of actor.system.languages?.custom.split(/[,;]/)) knownLanguages.add(lang.trim().toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}

export class gurpsLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	/**
	 * Search through all of the advantages (including recursing into containers) looking for "Language" or translation.
	 * Depending on the source, it can be two different patterns, Language: NAME (optionals) or Language (NAME) (optionals)
	 * and the advantage names may or may not be translated, so we must search for both
	 */
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (GURPS) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			// window.GURPS set when the GURPS game system is loaded
			let npat1 = ": +(?<name>[^\\(]+)";
			let npat2 = " +\\((?<name>[^\\)]+)\\)";
			GURPS.recurselist(actor.system.ads, (advantage) => {
				if (!this.updateForPattern(advantage, new RegExp(languageRegex + npat1, "i"), knownLanguages, literateLanguages))
					if (!this.updateForPattern(advantage, new RegExp(languageRegex + npat2, "i"), knownLanguages, literateLanguages))
						if (!this.updateForPattern(advantage, new RegExp(game.i18n.localize("GURPS.language") + npat1, "i"), knownLanguages, literateLanguages, true))
							this.updateForPattern(advantage, new RegExp(game.i18n.localize("GURPS.language") + npat2, "i"), knownLanguages, literateLanguages, true);
			});
		}
		return [knownLanguages, literateLanguages];
	}

	/**
    If we match on the Language name, search the name (or the notes)
    for indicators of spoken or written levels of comprehension in English, or translated
  */
	updateForPattern(advantage, regex, knownLanguages, literateLanguages, langDetected = false) {
		let match = advantage.name.match(regex);
		if (match) {
			const lang = match.groups.name.trim().toLowerCase();
			const wpat = new RegExp(game.i18n.localize("GURPS.written"), "i");
			const spat = new RegExp(game.i18n.localize("GURPS.spoken"), "i");
			let written = advantage.name.match(/written/i) || advantage.notes?.match(/written/i);
			if (!written) written = advantage.name.match(wpat) || advantage.notes?.match(wpat);
			let spoken = advantage.name.match(/spoken/i) || advantage.notes?.match(/spoken/i);
			if (!spoken) spoken = advantage.name.match(spat) || advantage.notes?.match(spat);
			if (written && spoken) {
				knownLanguages.add(lang);
				literateLanguages.add(lang);
				return true;
			} else if (written) {
				literateLanguages.add(lang);
				return true;
			} else if (spoken) {
				knownLanguages.add(lang);
				return true;
			} else {
				// neither is specificaly identified, assume both if "Language" detected
				if (langDetected) {
					knownLanguages.add(lang);
					literateLanguages.add(lang);
					return true;
				}
			}
		}
		return false;
	}
}

export class oseLanguageProvider extends LanguageProvider {
	languages = {
		Common: {
			label: "Common",
			font: "Thorass",
			rng: "default",
		},
		Lawful: {
			label: "Lawful",
			font: "Celestial",
			rng: "default",
		},
		Chaotic: {
			label: "Chaotic",
			font: "Barazhad",
			rng: "default",
		},
		Neutral: {
			label: "Neutral",
			font: "Infernal",
			rng: "default",
		},
		Bugbear: {
			label: "Bugbear",
			font: "Dethek",
			rng: "default",
		},
		Doppelgänger: {
			label: "Doppelgänger",
			font: "Pulsian",
			rng: "default",
		},
		Dragon: {
			label: "Dragon",
			font: "Iokharic",
			rng: "default",
		},
		Dwarvish: {
			label: "Dwarvish",
			font: "Dethek",
			rng: "default",
		},
		Elvish: {
			label: "Elvish",
			font: "Espruar",
			rng: "default",
		},
		Gargoyle: {
			label: "Gargoyle",
			font: "High Drowic",
			rng: "default",
		},
		Gnoll: {
			label: "Gnoll",
			font: "Kargi",
			rng: "default",
		},
		Gnomish: {
			label: "Gnomish",
			font: "Tengwar",
			rng: "default",
		},
		Goblin: {
			label: "Goblin",
			font: "Dethek",
			rng: "default",
		},
		Halfling: {
			label: "Halfling",
			rng: "default",
		},
		Harpy: {
			label: "Harpy",
			font: "Olde Thorass",
			rng: "default",
		},
		Hobgoblin: {
			label: "Hobgoblin",
			font: "Dethek",
			rng: "default",
		},
		Kobold: {
			label: "Kobold",
			font: "Iokharic",
			rng: "default",
		},
		"Lizard Man": {
			label: "Lizard Man",
			font: "Iokharic",
			rng: "default",
		},
		Medusa: {
			label: "Medusa",
			font: "High Drowic",
			rng: "default",
		},
		Minotaur: {
			label: "Minotaur",
			font: "Olde Espruar",
			rng: "default",
		},
		Ogre: {
			label: "Ogre",
			font: "Meroitic Demotic",
			rng: "default",
		},
		Orcish: {
			label: "Orcish",
			font: "Dethek",
			rng: "default",
		},
		Pixie: {
			label: "Pixie",
			font: "Olde Espruar",
			rng: "default",
		},
	};

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		CONFIG.OSE.languages.forEach((key) => {
			this.languages[key] = {
				label: key,
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		});
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.languages.value) knownLanguages.add(lang);
		return [knownLanguages, literateLanguages];
	}
}

export class pf1LanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		aboleth: {
			font: "Ar Ciela",
		},
		abyssal: {
			font: "Barazhad",
		},
		aklo: {
			font: "Ophidian",
		},
		algollthu: {
			font: "Ar Ciela",
		},
		anadi: {
			font: "Jungle Slang",
		},
		aquan: {
			font: "Olde Thorass",
		},
		arboreal: {
			font: "Olde Espruar",
		},
		auran: {
			font: "Olde Thorass",
		},
		azlanti: {
			font: "Tengwar",
		},
		boggard: {
			font: "Semphari",
		},
		caligni: {
			font: "High Drowic",
		},
		celestial: {
			font: "Celestial",
		},
		cyclops: {
			font: "Meroitic Demotic",
		},
		daemonic: {
			font: "Infernal",
		},
		dark: {
			font: "High Drowic",
		},
		destrachan: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		drowsign: {
			font: "Finger Alphabet",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarven: {
			font: "Dethek",
		},
		dziriak: {
			font: "Pulsian",
		},
		elven: {
			font: "Espruar",
		},
		erutaki: {
			font: "Tuzluca",
		},
		garundi: {
			font: "Qijomi",
		},
		giant: {
			font: "Meroitic Demotic",
		},
		gnoll: {
			font: "Kargi",
		},
		gnome: {
			font: "Dethek",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Kargi",
		},
		grippli: {
			font: "Semphari",
		},
		hallit: {
			font: "Tengwar",
		},
		ignan: {
			font: "Dethek",
		},
		iruxi: {
			font: "Semphari",
		},
		jistkan: {
			font: "Valmaric",
		},
		jotun: {
			font: "Meroitic Demotic",
		},
		jyoti: {
			font: "Celestial",
		},
		infernal: {
			font: "Infernal",
		},
		kelish: {
			font: "Highschool Runes",
		},
		mwangi: {
			font: "Tengwar",
		},
		necril: {
			font: "High Drowic",
		},
		orc: {
			font: "Dethek",
		},
		orcish: {
			font: "Dethek",
		},
		polyglot: {
			font: "Tengwar",
		},
		protean: {
			font: "Barazhad",
		},
		requian: {
			font: "Reanaarian",
		},
		shoanti: {
			font: "Tengwar",
		},
		skald: {
			font: "Valmaric",
		},
		sphinx: {
			font: "Reanaarian",
		},
		strix: {
			font: "Infernal",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		shoony: {
			font: "Dethek",
		},
		taldane: {
			font: "Tengwar",
		},
		tengu: {
			font: "Oriental",
		},
		terran: {
			font: "Dethek",
		},
		thassilonian: {
			font: "Thassilonian",
		},
		tien: {
			font: "Oriental",
		},
		treant: {
			font: "Olde Espruar",
		},
		undercommon: {
			font: "High Drowic",
		},
		utopian: {
			font: "Maras Eye",
		},
		varisian: {
			font: "Tengwar",
		},
		vegepygmy: {
			font: "Kargi",
		},
		vudrani: {
			font: "Qijomi",
		},
	};
}

export class pf2eLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		abyssal: {
			font: "Barazhad",
		},
		aklo: {
			font: "Ophidian",
		},
		alghollthu: {
			font: "Ar Ciela",
		},
		anadi: {
			font: "Jungle Slang",
		},
		thalassic: {
			font: "Olde Thorass",
		},
		arboreal: {
			font: "Olde Espruar",
		},
		sussuran: {
			font: "Olde Thorass",
		},
		azlanti: {
			font: "Tengwar",
		},
		boggard: {
			font: "Semphari",
		},
		caligni: {
			font: "High Drowic",
		},
		celestial: {
			font: "Celestial",
		},
		cyclops: {
			font: "Meroitic Demotic",
		},
		daemonic: {
			font: "Infernal",
		},
		destrachan: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarven: {
			font: "Dethek",
		},
		dziriak: {
			font: "Pulsian",
		},
		elven: {
			font: "Espruar",
		},
		erutaki: {
			font: "Tuzluca",
		},
		garundi: {
			font: "Qijomi",
		},
		gnoll: {
			font: "Kargi",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Kargi",
		},
		grippli: {
			font: "Semphari",
		},
		hallit: {
			font: "Tengwar",
		},
		pyric: {
			font: "Dethek",
		},
		iruxi: {
			font: "Semphari",
		},
		jistkan: {
			font: "Valmaric",
		},
		jotun: {
			font: "Meroitic Demotic",
		},
		jyoti: {
			font: "Celestial",
		},
		infernal: {
			font: "Infernal",
		},
		kelish: {
			font: "Highschool Runes",
		},
		mwangi: {
			font: "Tengwar",
		},
		necril: {
			font: "High Drowic",
		},
		orcish: {
			font: "Dethek",
		},
		protean: {
			font: "Barazhad",
		},
		requian: {
			font: "Reanaarian",
		},
		shoanti: {
			font: "Tengwar",
		},
		skald: {
			font: "Valmaric",
		},
		sphinx: {
			font: "Reanaarian",
		},
		strix: {
			font: "Infernal",
		},
		fey: {
			font: "Olde Espruar",
		},
		shoony: {
			font: "Dethek",
		},
		taldane: {
			font: "Tengwar",
		},
		tengu: {
			font: "Oriental",
		},
		petran: {
			font: "Dethek",
		},
		thassilonian: {
			font: "Thassilonian",
		},
		tien: {
			font: "Oriental",
		},
		undercommon: {
			font: "High Drowic",
		},
		utopian: {
			font: "Maras Eye",
		},
		varisian: {
			font: "Tengwar",
		},
		vudrani: {
			font: "Qijomi",
		},
	};

	addLanguage(lang) {
		if (!lang) return;
		lang = lang.trim();
		let key = lang.toLowerCase().replace(/[\s\']/g, "_");
		const homebrewLanguagesObj = game.settings.get("pf2e", "homebrew.languages");
		const homebrewLanguagesKeys = homebrewLanguagesObj.map((a) => a.id);
		const homebrewLanguagesValues = homebrewLanguagesObj.map((a) => a.value);
		if (homebrewLanguagesValues.includes(lang)) {
			const index = homebrewLanguagesValues.indexOf(lang);
			key = homebrewLanguagesKeys[index];
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		this.languages[key] = {
			label: lang,
			font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
			rng: languagesSetting[key]?.rng ?? "default",
		};
		this.addToConfig(key, lang);
	}
}

export class sfrpgLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		abyssal: {
			font: "Barazhad",
		},
		akito: {
			font: "Thorass",
		},
		aklo: {
			font: "Ophidian",
		},
		arkanen: {
			font: "Thorass",
		},
		aquan: {
			font: "Olde Thorass",
		},
		auran: {
			font: "Olde Thorass",
		},
		azlanti: {
			font: "Tengwar",
		},
		celestial: {
			font: "Celestial",
		},
		draconic: {
			font: "Iokharic",
		},
		drow: {
			font: "High Drowic",
		},
		dwarven: {
			font: "Dethek",
		},
		elven: {
			font: "Espruar",
		},
		gnome: {
			font: "Dethek",
		},
		goblin: {
			font: "Kargi",
		},
		halfling: {
			font: "Thorass",
		},
		ignan: {
			font: "Dethek",
		},
		infernal: {
			font: "Infernal",
		},
		kalo: {
			font: "Thorass",
		},
		kasatha: {
			font: "Thorass",
		},
		Nchaki: {
			font: "Thorass",
		},
		orc: {
			font: "Dethek",
		},
		sarcesian: {
			font: "Thorass",
		},
		shirren: {
			font: "Thorass",
		},
		shobhad: {
			font: "Thorass",
		},
		terran: {
			font: "Olde Thorass",
		},
		triaxian: {
			font: "Thorass",
		},
		vercite: {
			font: "Thorass",
		},
		vesk: {
			font: "Thorass",
		},
		ysoki: {
			font: "Thorass",
		},
	};
}

export class shadowrun5eLanguageProvider extends LanguageProvider {
	defaultFont = "Olde English";

	languages = {
		cityspeak: {
			label: "Cityspeak",
			font: "Olde English",
		},
		spanish: {
			label: "Spanish",
			font: "Olde English",
		},
		lakota: {
			label: "Lakota",
			font: "Olde English",
		},
		dakota: {
			label: "Dakota",
			font: "Olde English",
		},
		navajo: {
			label: "Navajo",
			font: "Olde English",
		},
		russian: {
			label: "Russian",
			font: "Kremlin Premier",
		},
		french: {
			label: "French",
			font: "Olde English",
		},
		italian: {
			label: "Italian",
			font: "Olde English",
		},
		german: {
			label: "German",
			font: "Olde English",
		},
		aztlaner: {
			label: "Aztlaner Spanish",
			font: "Aztec",
		},
		sperethiel: {
			label: "Sperethiel",
			font: "Espruar",
		},
		orzet: {
			label: "Or'zet",
			font: "Ork Glyphs",
		},
		english: {
			label: "English",
			font: "Olde English",
		},
		japanese: {
			label: "Japanese",
			font: "Oriental",
		},
		mandarin: {
			label: "Mandarin",
			font: "Scrapbook Chinese",
		},
	};

	getSystemDefaultLanguage() {
		return "cityspeak";
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang in actor.system.skills.language.value) knownLanguages.add(actor.system.skills.language.value[lang].name.toLowerCase());
		return [knownLanguages, literateLanguages];
	}
}

export class splittermondLanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const isLiterate = actor.items.filter((item) => item.name == "Literat" && item.type == "strength").length > 0;
		actor.items
			.filter((item) => item.type == "language")
			.forEach((item) => {
				const name = item.name.trim().toLowerCase();
				knownLanguages.add(name);
				if (isLiterate) literateLanguages.add(name);
			});
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}

export class swadeLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.SWADE.LanguageSkills"),
			},
			"SWADE.AdditionalLanguageStat": {
				hint: game.i18n.format("POLYGLOT.SWADE.AdditionalLanguageStat.hint", {
					setting: game.i18n.localize("POLYGLOT.LanguageRegex.title"),
				}),
				type: String,
				default: "",
			},
			"SWADE.AdditionalLiterateStat": {
				hint: game.i18n.format("POLYGLOT.SWADE.AdditionalLiterateStat.hint", {
					setting: game.i18n.localize("POLYGLOT.SWADE.AdditionalLanguageStat.title"),
				}),
				type: String,
				default: "",
			},
		};
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const additionalLanguageStat = game.settings.get("polyglot", "SWADE.AdditionalLanguageStat");
		const additionalLiterateStat = game.settings.get("polyglot", "SWADE.AdditionalLiterateStat");
		if (!additionalLanguageStat) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			let myRegex = new RegExp(languageRegex + " \\((.+)\\)", "i");
			for (let item of actor.items) {
				const name = item?.flags?.babele?.originalName || item.name;
				if (myRegex.test(name)) knownLanguages.add(name.match(myRegex)[1].trim().toLowerCase());
			}
		} else {
			const languages = actor.system?.additionalStats?.[additionalLanguageStat]?.value.split(/[,;]/) ?? [];
			for (let lang of languages) {
				lang = lang.trim();
				knownLanguages.add(lang.toLowerCase());
				this.addLanguage(lang);
			}
		}
		if (additionalLiterateStat) {
			const languages = actor.system?.additionalStats?.[additionalLiterateStat]?.value.split(/[,;]/) ?? [];
			for (let lang of languages) {
				lang = lang.trim();
				literateLanguages.add(lang.toLowerCase());
				this.addLanguage(lang);
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		if (game.settings.get("polyglot", "SWADE.AdditionalLiterateStat")) return game.polyglot.literateLanguages.has(lang);
		return game.polyglot.knownLanguages.has(lang);
	}
}

export class sw5eLanguageProvider extends LanguageProvider {
	languages = {
		basic: {
			font: "Celestial",
		},
		abyssin: {
			font: "Barazhad",
		},
		aleena: {
			font: "Jungle Slang",
		},
		antarian: {
			font: "Ar Ciela",
		},
		anzellan: {
			font: "Valmaric",
		},
		aqualish: {
			font: "Floki",
		},
		arconese: {
			font: "Ork Glyphs",
		},
		ardennian: {
			font: "Thorass",
		},
		arkanian: {
			font: "Celestial",
		},
		balosur: {
			font: "Ar Ciela",
		},
		barabel: {
			font: "Dark Eldar",
		},
		besalisk: {
			font: "Barazhad",
		},
		binary: {
			font: "Celestial",
		},
		bith: {
			font: "Skaven",
		},
		bocce: {
			font: "Tuzluca",
		},
		bothese: {
			font: "Infernal",
		},
		catharese: {
			font: "Espruar",
		},
		cerean: {
			font: "Olde Espruar",
		},
		"chadra-fan": {
			font: "Infernal",
		},
		chagri: {
			font: "Ophidian",
		},
		cheunh: {
			font: "Ar Ciela",
		},
		chevin: {
			font: "Eltharin",
		},
		chironan: {
			font: "Saurian",
		},
		clawdite: {
			font: "Reanaarian",
		},
		codruese: {
			font: "Meroitic Demotic",
		},
		colicoid: {
			font: "Thassilonian",
		},
		dashadi: {
			font: "Iokharic",
		},
		defel: {
			font: "Dark Eldar",
		},
		devaronese: {
			font: "Iokharic",
		},
		dosh: {
			font: "Iokharic",
		},
		draethos: {
			font: "Pulsian",
		},
		durese: {
			font: "Reanaarian",
		},
		dug: {
			font: "Qijomi",
		},
		ewokese: {
			font: "Skaven",
		},
		falleen: {
			font: "Tengwar",
		},
		felucianese: {
			font: "Skaven",
		},
		gamorrese: {
			font: "Highschool Runes",
		},
		gand: {
			font: "Reanaarian",
		},
		geonosian: {
			font: "Maras Eye",
		},
		givin: {
			font: "High Drowic",
		},
		gran: {
			font: "Qijomi",
		},
		gungan: {
			font: "Highschool Runes",
		},
		hapan: {
			font: "Valmaric",
		},
		harchese: {
			font: "Thassilonian",
		},
		herglese: {
			font: "Ophidian",
		},
		honoghran: {
			font: "Tuzluca",
		},
		huttese: {
			font: "Thassilonian",
		},
		iktotchese: {
			font: "Iokharic",
		},
		ithorese: {
			font: "Dethek",
		},
		jawaese: {
			font: "Valmaric",
		},
		kaleesh: {
			font: "Infernal",
		},
		kaminoan: {
			font: "Ar Ciela",
		},
		karkaran: {
			font: "Ophidian",
		},
		keldor: {
			font: "Meroitic Demotic",
		},
		kharan: {
			font: "Ar Ciela",
		},
		killik: {
			font: "Thassilonian",
		},
		klatooinian: {
			font: "Thassilonian",
		},
		kubazian: {
			font: "Olde Thorass",
		},
		kushiban: {
			font: "Thorass",
		},
		kyuzo: {
			font: "Barazhad",
		},
		lannik: {
			font: "Semphari",
		},
		lasat: {
			font: "Floki",
		},
		lowickese: {
			font: "Qijomi",
		},
		lurmese: {
			font: "Jungle Slang",
		},
		mandoa: {
			font: "Kargi",
		},
		miralukese: {
			font: "Miroslav Normal",
		},
		mirialan: {
			font: "Miroslav Normal",
		},
		moncal: {
			font: "Dark Eldar",
		},
		mustafarian: {
			font: "Ork Glyphs",
		},
		muun: {
			font: "Tengwar",
		},
		nautila: {
			font: "Ophidian",
		},
		ortolan: {
			font: "Thorass",
		},
		pakpak: {
			font: "Olde Thorass",
		},
		pyke: {
			font: "Meroitic Demotic",
		},
		quarrenese: {
			font: "Ophidian",
		},
		rakata: {
			font: "Iokharic",
		},
		rattataki: {
			font: "Infernal",
		},
		rishii: {
			font: "Maras Eye",
		},
		rodese: {
			font: "Meroitic Demotic",
		},
		ryn: {
			font: "Espruar",
		},
		selkatha: {
			font: "Ophidian",
		},
		semblan: {
			font: "Finger Alphabet",
		},
		shistavanen: {
			font: "Pulsian",
		},
		shyriiwook: {
			font: "Olde Espruar",
		},
		sith: {
			font: "High Drowic",
		},
		squibbian: {
			font: "Valmaric",
		},
		sriluurian: {
			font: "Jungle Slang",
		},
		"ssi-ruuvi": {
			font: "Maras Eye",
		},
		sullustese: {
			font: "Highschool Runes",
		},
		talzzi: {
			font: "Olde Thorass",
		},
		tarasinese: {
			font: "Olde Espruar",
		},
		thisspiasian: {
			font: "Ar Ciela",
		},
		togorese: {
			font: "Floki",
		},
		togruti: {
			font: "Pulsian",
		},
		toydarian: {
			font: "Espruar",
		},
		tusken: {
			font: "Semphari",
		},
		"twi'leki": {
			font: "Tuzluca",
		},
		ugnaught: {
			font: "Floki",
		},
		umbaran: {
			font: "Jungle Slang",
		},
		utapese: {
			font: "Eltharin",
		},
		verpine: {
			font: "Thassilonian",
		},
		vong: {
			font: "Valmaric",
		},
		voss: {
			font: "Iokharic",
		},
		yevethan: {
			font: "High Drowic",
		},
		zabraki: {
			font: "Maras Eye",
		},
		zygerrian: {
			font: "Floki",
		},
	};

	getSystemDefaultLanguage() {
		return "basic";
	}
}

export class tormenta20LanguageProvider extends LanguageProvider {
	languages = {
		comum: {
			font: "Thorass",
		},
		abissal: {
			font: "Barazhad",
		},
		anao: {
			font: "Dethek",
		},
		aquan: {
			font: "Olde Thorass",
		},
		auran: {
			font: "Olde Thorass",
		},
		celestial: {
			font: "Celestial",
		},
		draconico: {
			font: "Iokharic",
		},
		elfico: {
			font: "Espruar",
		},
		gigante: {
			font: "Meroitic Demotic",
		},
		gnoll: {
			font: "Kargi",
		},
		goblin: {
			font: "Kargi",
		},
		ignan: {
			font: "Olde Thorass",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		silvestre: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Olde Thorass",
		},
	};

	getSystemDefaultLanguage() {
		return "comum";
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.T20.idiomas = {};
		}
		Object.keys(CONFIG.T20.idiomas).forEach((key) => {
			const label = CONFIG.T20.idiomas[key];
			if (label) {
				langs[key] = {
					label,
					font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
					rng: languagesSetting[key]?.rng ?? "default",
				};
			}
		});
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.tracos.idiomas.value) knownLanguages.add(lang);
		return [knownLanguages, literateLanguages];
	}
}

export class uesrpgLanguageProvider extends LanguageProvider {
	languages = {
		cyrodilic: {
			font: "Thorass",
		},
		aldmeri: {
			font: "Espruar",
		},
		ayleidoon: {
			font: "Espruar",
		},
		bosmeri: {
			font: "Mage Script",
		},
		daedric: {
			font: "Daedra",
		},
		dovah: {
			font: "Dragon Alphabet",
		},
		dunmeri: {
			font: "High Drowic",
		},
		dwemeris: {
			font: "Dethek",
		},
		falmer: {
			font: "Ar Ciela",
		},
		jel: {
			font: "Ophidian",
		},
		nordic: {
			font: "Ny Stormning",
		},
		taagra: {
			font: "Jungle Slang",
		},
		yoku: {
			font: "Oriental",
		},
	};

	getSystemDefaultLanguage() {
		return "cyrodilic";
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.UESRPG.languages = {};
		}
		Object.keys(CONFIG.UESRPG.languages).forEach((key) => {
			const label = CONFIG.UESRPG.languages[key];
			if (label) {
				langs[key] = {
					label,
					font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
					rng: languagesSetting[key]?.rng ?? "default",
				};
			}
		});
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let item of actor.items) {
			if (item.type == "language") {
				if (item.system.speak) knownLanguages.add(item.name.trim().toLowerCase());
				if (item.system.readWrite) literateLanguages.add(item.name.trim().toLowerCase());
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}

export class wfrp4eLanguageProvider extends LanguageProvider {
	languages = {
		reikspiel: {
			font: "Infernal",
		},
		wastelander: {
			font: "Infernal",
		},
		classical: {
			font: "Infernal",
		},
		cathan: {
			font: "Oriental",
		},
		tilean: {
			font: "Thorass",
		},
		estalian: {
			font: "Tengwar",
		},
		gospodarinyi: {
			font: "Miroslav Normal",
		},
		albion: {
			font: "Elder Futhark",
		},
		norse: {
			font: "Elder Futhark",
		},
		bretonnian: {
			font: "romance",
		},
		druhir: {
			font: "Dark Eldar",
		},
		elthárin: {
			font: "Eltharin",
		},
		orcish: {
			font: "Ork Glyphs",
		},
		queekish: {
			font: "queekish",
		},
		slaan: {
			font: "Saurian",
		},
		khazalid: {
			font: "Floki",
		},
		magick: {
			font: "Eltharin",
		},
	};

	get requiresReady() {
		return true;
	}

	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.WFRP4E.LanguageSkills"),
			},
		};
	}

	getSystemDefaultLanguage() {
		return "reikspiel";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const wfrp4ePack = game.packs.get("wfrp4e-core.skills") || game.packs.get("wfrp4e.basic");
		const wfrp4eItemList = await wfrp4ePack.getIndex();
		const languagesSetting = game.settings.get("polyglot", "Languages");
		let myRegex = new RegExp(game.settings.get("polyglot", "LanguageRegex") + "\\s*\\((.+)\\)", "i");
		const langs = {};
		for (let item of wfrp4eItemList) {
			if (myRegex.test(item.name)) {
				let label = item.name.match(myRegex)[1].trim();
				let key = label.toLowerCase();
				if (!label) continue;
				langs[key] = {
					label,
					font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
					rng: languagesSetting[key]?.rng ?? "default",
				};
			}
		}
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		let myRegex = new RegExp(game.settings.get("polyglot", "LanguageRegex") + "\\s*\\((.+)\\)", "i");
		for (let item of actor.items) {
			// adding only the descriptive language name, not "Language (XYZ)"
			if (myRegex.test(item.name)) knownLanguages.add(item.name.match(myRegex)[1].trim().toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}

export class wwnLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			// System has a built-in setting to handle languages.
			replaceLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.replaceLanguages"),
			},
			customLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.customLanguages"),
			},
		};
	}

	getSystemDefaultLanguage() {
		return Object.keys(this.languages)[0];
	}

	addLanguage(lang) {
		if (!lang) return;
		let languages = game.settings.get("wwn", "languageList");
		if (!languages.includes(lang)) {
			if (languages.endsWith(",")) languages += lang;
			else languages += "," + lang;
			game.settings.set("wwn", "languageList", languages);
		}
		lang = lang.trim();
		const key = lang.toLowerCase().replace(/[\s\']/g, "_");
		this.languages[key] = {
			label: lang,
			font: this.defaultFont,
			rng: "default",
		};
	}
	removeLanguage(lang) {
		if (!lang) return;
		let languages = game.settings.get("wwn", "languageList");
		if (languages.includes(lang)) {
			languages.replace(new RegExp(",\\s*" + lang), "");
			game.settings.set("wwn", "languageList", languages);
		}
		const key = lang
			.trim()
			.toLowerCase()
			.replace(/[\s\']/g, "_");
		delete this.languages[key];
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang of game.settings.get("wwn", "languageList").split(",")) {
			const key = lang.toLowerCase().replace(/[\s\']/g, "_");
			this.languages[key] = {
				label: lang,
				font: languagesSetting[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system.languages) for (let lang of actor.system.languages.value) knownLanguages.add(lang.toLowerCase());
		return [knownLanguages, literateLanguages];
	}
}
