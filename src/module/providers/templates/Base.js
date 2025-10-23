import { getNestedData } from "../../settings.js";

/**
 * Base class for all language providers.
 * If you want to offer a language provider in your system/module you must derive this class.
 */
export default class LanguageProvider {
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

	// /////////
	// Hooks //
	// /////////

	async initSequence() {
		await this.getLanguages();
		this.loadFonts();
		this.loadLanguages();
		this.loadCustomFonts();
		this.reloadLanguages();
	}

	async setupSequence() {
		this.getDefaultLanguage();
	}

	init() {}

	async i18nInit() {
		if (!this.requiresReady) {
			await this.initSequence();
		}
	}

	async setup() {
		if (!this.requiresReady) {
			await this.setupSequence();
		} else if (game.modules.get("babele")?.active) {
			// This is set during the setup hook because babele.ready will already have fired during the ready hook
			Hooks.on("babele.ready", async () => {
				await this.initSequence();
				await this.setupSequence();
				Hooks.callAll("polyglot.languageProvider.ready");
			});
		}
	}

	async ready() {
		if (this.requiresReady && !game.modules.get("babele")?.active) {
			await this.initSequence();
			await this.setupSequence();
			Hooks.callAll("polyglot.languageProvider.ready");
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
					const label = typeof systemLanguages[key] === "string" ? game.i18n.localize(systemLanguages[key]) : null;
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
		const fonts = game.settings.get("polyglot", "Alphabets");

		if (enableAllFonts) {
			for (let font in game.settings.get("core", "fonts")) {
				if (fonts[font]) {
					this.fonts[font] = fonts[font];
				} else {
					const fontSize = game.polyglot.CustomFontSizes[font] ?? "100";
					this.addFont(font, fontSize);
				}
			}
		}
		for (let font in this.fonts) {
			if (game.polyglot.CustomFontSizes[font]) {
				this.fonts[font].fontSize = game.polyglot.CustomFontSizes[font];
			}
			if (fonts[font]) {
				if (typeof fonts[font] === "string") delete this.fonts[font];
				else {
					this.fonts[font].alphabeticOnly = fonts[font]?.alphabeticOnly ?? false;
					this.fonts[font].logographical = fonts[font]?.logographical ?? false;
				}
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
		if (comprehendLanguages && !customLanguages.includes(comprehendLanguages)) {
			this.addLanguage(comprehendLanguages);
		}
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
		const langSettings = foundry.utils.deepClone(game.settings.get("polyglot", "Languages"));
		if (JSON.stringify(langSettings) !== JSON.stringify(this.languages) || !Object.keys(langSettings).length) {
			return;
		}
		for (const key of Object.keys(langSettings)) {
			if (!(key in this.languages)) {
				delete this.languages[key];
				this.removeFromConfig(key);
			}
		}
		for (const key of Object.keys(this.languages)) {
			if (!(key in langSettings)) {
				langSettings[key] = this.languages[key];
			}
		}
		this.languages = langSettings;
	}

	// /////////////////
	// Font Handling //
	// /////////////////

	/**
	 * Adds a font to the Provider.
	 * @param {String} lang
	 * @param {Object} options
	 * @see loadFonts
	 */
	addFont(fontFamily, fontSize = 100, options = {}) {
		const defaultOptions = {
			alphabeticOnly: false,
			logographical: false,
			// replace: {},
		};
		this.fonts[fontFamily] = { ...defaultOptions, ...options, fontSize, fontFamily };
	}

	/**
	 * Removes a font from the Provider.
	 * @param {String} lang
	 */
	removeFont(font) {
		const key = font;
		delete this.fonts[key];
	}

	// /////////////////////
	// Language Handling //
	// /////////////////////

	/**
	 * Adds a language to the Provider.
	 * @param {String} lang
	 * @param {Object} options
	 * @see loadLanguages
	 */
	addLanguage(lang, options = {}) {
		if (!lang) return;

		const key = lang.slugify({ replacement: "_" });
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const defaultOptions = {
			font: languagesSetting[key]?.font ?? this.defaultFont,
			rng: languagesSetting[key]?.rng ?? "default",
		};

		const language = { ...defaultOptions, ...options, label: lang};

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
		const key = lang.slugify({ replacement: "_" });
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
		const getLanguage = (language) => {
			if (this.languages[language]) {
				this.defaultLanguage = language;
			} else {
				Object.entries(this.languages).every(([key, lang]) => {
					if (language === lang.label) {
						this.defaultLanguage = key;
						return false;
					}
					return true;
				});
			}
		};
		const worldDefault = game.settings.get("polyglot", "defaultLanguage");
		const userDefault = game.user.getFlag("polyglot", "defaultLanguage");
		// We have to check for World's setting first because users might input an invalid language
		if (worldDefault) {
			getLanguage(worldDefault);
		}
		if (userDefault) {
			getLanguage(userDefault);
		}
		if (this.defaultLanguage === undefined) {
			this.defaultLanguage = this.getSystemDefaultLanguage();
		}
	}

	getLanguageFont(lang) {
		return this.languages[lang]?.font ?? this.defaultFont;
	}

	// ///////////////////
	// Config Handling //
	// ///////////////////

	/**
	 * Adds a key to the languages object.
	 * Important for systems that read it for their language selector.
	 * @param {String} key
	 * @param {String} lang
	 */
	addToConfig(key, lang) {
		if (CONFIG[game.system.id.toUpperCase()]?.languages) {
			if (Array.isArray(CONFIG[game.system.id.toUpperCase()].languages)) {
				CONFIG[game.system.id.toUpperCase()].languages.push(lang);
			} else CONFIG[game.system.id.toUpperCase()].languages[key] = lang;
		}
	}

	/**
	 * Removes a key from the languages object.
	 * @param {String} key
	 */
	removeFromConfig(key) {
		if (CONFIG[game.system.id.toUpperCase()]?.languages) delete CONFIG[game.system.id.toUpperCase()].languages[key];
	}

	// //////////////////
	// User Languages //
	// //////////////////

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
				knownLanguages.add(lang);
			}
			if (actor.system.traits.languages.custom) {
				for (let lang of actor.system.traits.languages.custom.split(/[,;]/)) {
					const key = lang.trim().toLowerCase();
					knownLanguages.add(key);
				}
			}
		} else if (actor.system?.languages?.value) {
			for (let lang of actor.system.languages.value) knownLanguages.add(lang);
			if (actor.system.languages.custom) {
				for (let lang of actor.system.languages.custom.split(/[,;]/)) {
					const key = lang.trim().toLowerCase();
					knownLanguages.add(key);
				}
			}
		} else if (this.languageDataPath?.length) {
			let data = getNestedData(actor, this.languageDataPath);
			for (let lang of data.split(/[,;]/)) {
				knownLanguages.add(lang.trim().toLowerCase());
			}
			if (this.literacyDataPath.length) {
				let data = getNestedData(actor, this.literacyDataPath);
				for (let lang of data.split(/[,;]/)) {
					literateLanguages.add(lang.trim().toLowerCase());
				}
			}
		} else if (game.settings.settings.has("polyglot.LanguageRegex")) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			let literacyRegex;
			if (game.settings.settings.has("polyglot.LiteracyRegex")) {
				literacyRegex = game.settings.get("polyglot", "LiteracyRegex");
			}
			const langRegex = new RegExp(`${languageRegex}\\s*\\((.+)\\)`, "i");
			const litRegex = new RegExp(`${literacyRegex} \\((.+)\\)`, "i");
			for (let item of actor.items) {
				const name = item?.flags?.babele?.originalName || item.name;
				// adding only the descriptive language name, not "Language (XYZ)"
				if (langRegex.test(name)) {
					knownLanguages.add(name.match(langRegex)[1].slugify({ replacement: "_" }));
				} else if (literacyRegex && litRegex.test(name)) {
					literateLanguages.add(name.match(litRegex)[1].slugify({ replacement: "_" }));
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}

	/**
	 * Filters users for Polyglot.updateUserLanguages()
	 * @param {Array} ownedActors
	 * @returns
	 */
	// eslint-disable-next-line no-unused-vars
	filterUsers(ownedActors) {
		return game.users.players.filter((u) => u.hasRole(CONST.USER_ROLES.PLAYER));
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
