import { addSetting, getNestedData } from "./settings.js";

/**
 * Base class for all language providers.
 * If you want to offer a language provider in your system/module you must derive this class.
 */
export class LanguageProvider {
	/**
	 * @param {String} id
	 * @var this.alphabets	The fonts' size and family.
	 * @var this.languages	The language's names.
	 * @var this.tongues	The language : font pair.
	 */
	constructor(id) {
		this.id = id;
		this.alphabets = this.originalAlphabets;
		this.languages = {};
		this.tongues = this.originalTongues;
	}

	/**
	 * The system's original fonts.
	 */
	get originalAlphabets() {
		return {
			arciela: "200% ArCiela",
			aztec: "200% Aztec",
			barazhad: "200% Barazhad",
			celestial: "200% Celestial",
			chinese: "130% ScrapbookChinese",
			cyrillic: "130% KremlinPremier",
			daedra: "200% Daedra",
			darkeldar: "200% DarkEldar",
			davek: "150% Davek",
			dethek: "200% Dethek",
			dovah: "170% DragonAlphabet",
			elderfuthark: "350% ElderFuthark",
			eltharin: "200% Eltharin",
			espruar: "150% Espruar",
			fingeralphabet: "150% FingerAlphabet",
			floki: "200% Floki",
			highdrowic: "150% HighDrowic",
			highschoolrunes: "200% HighschoolRunes",
			infernal: "230% Infernal",
			iokharic: "170% Iokharic",
			jungleslang: "180% JungleSlang",
			kargi: "150% Kargi",
			magescript: "200% MageScript",
			maraseye: "200% MarasEye",
			meroiticdemotic: "200% MeroiticDemotic",
			miroslavnormal: "200% MiroslavNormal",
			musiqwik: "200% MusiQwik",
			nordic: "160% NyStormning",
			oldeenglish: "150% OldeEnglish",
			oldeespruar: "200% OldeEspruar",
			oldethorass: "200% OldeThorass",
			ophidian: "250% Ophidian",
			oriental: "130% Oriental",
			orkglyphs: "200% OrkGlyphs",
			pulsian: "270% Pulsian",
			qijomi: "200% Qijomi",
			reanaarian: "200% Reanaarian",
			rellanic: "200% Rellanic",
			saurian: "200% Saurian",
			semphari: "200% Semphari",
			skaven: "200% Skaven",
			tengwar: "200% Tengwar",
			thassilonian: "200% Thassilonian",
			thorass: "200% Thorass",
			tuzluca: "200% Tuzluca",
			valmaric: "200% Valmaric",
		};
	}
	/**
	 * The system's original language : font pairing.
	 */
	get originalTongues() {
		return { _default: "thorass" };
	}

	get isGeneric() {
		return !(this.constructor.prototype instanceof LanguageProvider);
	}

	/**
	 * This is needed if the LanguageProvider gets languages from compendiums, since they require the game state to be ready.
	 */
	get requiresReady() {
		return false;
	}

	get settings() {
		if (this.isGeneric) {
			addSetting("languageDataPath", {
				default: "",
				type: String,
				requiresReload: true,
			});
			addSetting("literacyDataPath", {
				default: "",
				type: String,
				requiresReload: true,
			});
			this.languageDataPath = game.settings.get("polyglot", "languageDataPath");
			this.literacyDataPath = game.settings.get("polyglot", "literacyDataPath");
			if (this.languageDataPath.startsWith("actor.")) this.languageDataPath = this.languageDataPath.slice(6);
			if (this.literacyDataPath.startsWith("actor.")) this.literacyDataPath = this.literacyDataPath.slice(6);
		}
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	/**
	 * Returns the system's default language if it exists.
	 * @returns {String}
	 */
	getSystemDefaultLanguage() {
		const keys = Object.keys(this.languages);
		if (keys.includes("common")) return "common";
		else return this.languages[0] || Object.keys(this.languages)[0] || "";
	}
	/**
	 * Returns defaultLang if it exists and is either a key or value on this.languages.
	 * Otherwise, returns the system's default language.
	 */
	getDefaultLanguage() {
		const defaultLang = game.settings.get("polyglot", "defaultLanguage");
		if (defaultLang) {
			if (this.languages[defaultLang]) this.defaultLanguage = defaultLang;
			const inverted = invertObject(this.languages);
			if (inverted[defaultLang]) this.defaultLanguage = inverted[defaultLang];
		} else {
			this.defaultLanguage = this.getSystemDefaultLanguage();
		}
	}

	/**
	 * Adds a language to the Provider.
	 * @param {String} lang
	 */
	addLanguage(lang) {
		if (!lang) return;
		lang = lang.trim();
		const key = lang.toLowerCase().replace(/ \'/g, "_");
		this.languages[key] = lang;
		this.addToConfig(key, lang);
		if (!(key in this.tongues)) {
			this.tongues[key] = this.tongues["_default"];
		}
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
		const key = lang.trim().toLowerCase().replace(/ \'/g, "_");
		delete this.languages[key];
		this.removeFromConfig(key);
		if (key in this.tongues) {
			delete this.tongues[key];
		}
	}

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
	/**
	 * Loads everything that can't be loaded on the constructor due to async/await.
	 * It Hooks on ready if the system depends on reading compendiums.
	 */
	async setup() {
		if (this.requiresReady) {
			if (game.modules.get("babele")?.active) {
				Hooks.on("babele.ready", async () => {
					await this.getLanguages();
					this.loadAlphabet();
					this.loadTongues();
					this.loadCustomFonts();
					this.reloadLanguages();
					this.getDefaultLanguage();
					Hooks.callAll("polyglot.languageProvider.ready");
				});
			} else {
				Hooks.on("ready", async () => {
					await this.getLanguages();
					this.loadAlphabet();
					this.loadTongues();
					this.loadCustomFonts();
					this.reloadLanguages();
					this.getDefaultLanguage();
					Hooks.callAll("polyglot.languageProvider.ready");
				});
			}
		} else {
			await this.getLanguages();
			this.loadAlphabet();
			this.loadTongues();
			this.loadCustomFonts();
			this.reloadLanguages();
			this.getDefaultLanguage();
		}
	}

	/**
	 * Even though the base method doesn't have an await, some providers might need it to look into compendiums.
	 */
	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		if (CONFIG[game.system.id.toUpperCase()]?.languages) {
			if (CONFIG[game.system.id.toUpperCase()].languages.constructor === Object) {
				if (replaceLanguages) CONFIG[game.system.id.toUpperCase()].languages = {};
				this.languages = CONFIG[game.system.id.toUpperCase()].languages;
			}
			if (CONFIG[game.system.id.toUpperCase()].languages.constructor === Array) {
				if (replaceLanguages) CONFIG[game.system.id.toUpperCase()].languages = [];
				for (let lang of CONFIG[game.system.id.toUpperCase()].languages) {
					this.languages[lang.toLowerCase()] = lang;
				}
			}
		}
	}
	/**
	 * Sets the fonts that will be available to choose on the settings.
	 */
	loadAlphabet() {
		this.alphabets = this.originalAlphabets;
		const enableAllFonts = game.settings.get("polyglot", "enableAllFonts");
		if ([1, 3].includes(enableAllFonts)) {
			const defaultAlphabets = new LanguageProvider().originalAlphabets;
			const invertedThis = invertObject(this.alphabets);
			for (let alp in defaultAlphabets) {
				if (!invertedThis[defaultAlphabets[alp]]) this.alphabets[alp] = defaultAlphabets[alp];
			}
		}
		if ([2, 3].includes(enableAllFonts)) {
			for (let alp in game.settings.get("core", "fonts")) {
				let size = game.polyglot.CustomFontsSize[alp] ?? 100;
				this.alphabets[alp] = `${size}% ${alp}`;
			}
		}
	}
	/**
	 * Adds languages from the settings to this.languages.
	 * Add tongues to this.tongues.
	 */
	loadTongues() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const customLanguages = game.settings.get("polyglot", "customLanguages");
		const comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages");
		const truespeech = game.settings.get("polyglot", "truespeech");
		if (!replaceLanguages) {
			this.tongues = this.originalTongues;
			if (this.languages.constructor === Array) {
				for (let lang of this.languages) {
					this.tongues[lang.toLowerCase()] = this.originalTongues["_default"];
				}
			} else if (this.languages.constructor === Object) {
				for (let key of Object.keys(this.languages)) {
					this.tongues[key] = this.originalTongues["_default"];
				}
			}
		} else this.tongues = { _default: this.originalTongues["_default"] };
		if (customLanguages) {
			for (let lang of customLanguages.split(/[,;]/)) {
				lang = lang.trim();
				this.addLanguage(lang);
			}
		}
		if (comprehendLanguages && !customLanguages.includes(comprehendLanguages)) {
			this.addLanguage(comprehendLanguages);
		}
		if (truespeech && !customLanguages.includes(truespeech)) {
			this.addLanguage(truespeech);
		}
	}
	/**
	 * Replaces this.tongues's fonts with the Languages setting's fonts.
	 */
	loadCustomFonts() {
		let langSettings = game.settings.get("polyglot", "Languages");
		if (this.tongues == langSettings) return;
		for (let lang in langSettings) {
			if (lang in this.tongues && this.tongues[lang] != langSettings[lang]) {
				this.tongues[lang] = langSettings[lang];
			}
		}
	}
	/**
	 * Called when Custom Languages setting is changed.
	 */
	reloadLanguages() {
		let langSettings = game.settings.get("polyglot", "Languages");
		if (this.tongues == langSettings || !Object.keys(langSettings).length) return;
		for (let lang in langSettings) {
			if (!(lang in this.tongues)) {
				delete langSettings[lang];
				this.removeFromConfig(lang);
			}
		}
		for (let lang in this.tongues) {
			if (!(lang in langSettings)) {
				langSettings[lang] = this.tongues["_default"];
			}
		}
		this.tongues = langSettings;
	}

	/**
	 * Gets an actor's languages.
	 * @param {Document} actor
	 * @var literate_languages	For systems that support literacy (e.g. reading journals).
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) known_languages.add(lang);
			if (actor.system.traits.languages.custom) {
				for (let lang of actor.system.traits.languages?.custom.split(/[,;]/)) known_languages.add(lang.trim().toLowerCase());
			}
		} else if (actor.system?.languages?.value) {
			for (let lang of actor.system.languages.value) known_languages.add(lang);
			if (actor.system.languages.custom) {
				for (let lang of actor.system.languages?.custom.split(/[,;]/)) known_languages.add(lang.trim().toLowerCase());
			}
		} else if (this.languageDataPath?.length) {
			let data = getNestedData(actor, this.languageDataPath);
			for (let lang of data.split(/[,;]/)) known_languages.add(lang.trim().toLowerCase());
			if (this.literacyDataPath.length) {
				let data = getNestedData(actor, this.literacyDataPath);
				for (let lang of data.split(/[,;]/)) literate_languages.add(lang.trim().toLowerCase());
			}
		} else if (game.settings.settings.has("polyglot.LanguageRegex")) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			let myRegex = new RegExp(languageRegex + "\\s*\\((.+)\\)", "i");
			for (let item of actor.items) {
				const name = item?.flags?.babele?.originalName || item.name;
				const match = name.match(myRegex);
				// adding only the descriptive language name, not "Language (XYZ)"
				if (match) known_languages.add(match[1].trim().toLowerCase());
			}
		}
		return [known_languages, literate_languages];
	}

	/**
	 * Returns the set with the languages to be shown on the journal.
	 * @param {} polyglot
	 * @param {string} lang
	 */
	conditions(lang) {
		return game.polyglot.known_languages.has(lang);
	}
}

export class a5eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			abyssal: "150% Barazhad",
			auran: "200% OldeThorass",
			celestial: "180% Celestial",
			elvish: "150% Espruar",
			outwordly: "200% ArCiela",
			draconic: "170% Iokharic",
			drowic: "150% HighDrowic",
			druidic: "120% JungleSlang",
			dwarvish: "120% Dethek",
			giant: "200% ElderFuthark",
			gnoll: "150% Kargi",
			infernal: "230% Infernal",
			sylvan: "200% OldeEspruar",
			serpent: "120% Ophidian",
			tirsu: "250% Pulsian",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			abyssal: "infernal",
			aquan: "dwarvish",
			auran: "dwarvish",
			cant: "common",
			celestial: "celestial",
			deep: "outwordly",
			draconic: "draconic",
			druidic: "druidic",
			dwarvish: "dwarvish",
			elvish: "elvish",
			giant: "dwarvish",
			gnoll: "gnoll",
			gnomish: "dwarvish",
			goblin: "dwarvish",
			halfling: "common",
			ignan: "dwarvish",
			infernal: "infernal",
			orc: "dwarvish",
			primordial: "dwarvish",
			sylvan: "elvish",
			terran: "dwarvish",
			undercommon: "elvish",
		};
	}

	get settings() {
		return {};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		if (replaceLanguages) {
			CONFIG.A5E.languages = {};
		} else {
			for (let lang in CONFIG.A5E.languages) {
				langs[lang] = game.i18n.localize(CONFIG.A5E.languages[lang]);
			}
		}

		this.languages = langs;
	}

	/**
	 * Get an actor's languages
	 * @param {Document} actor
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		const known_languages = new Set();
		const literate_languages = new Set();

		const langs = actor.system.proficiencies?.languages;
		if (!langs) return [known_languages, literate_languages];

		langs.forEach((lang) => {
			if (this.languages[lang]) known_languages.add(lang);
		});

		return [known_languages, literate_languages];
	}
}

export class ariaLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			kohestien: "130% Tuzluca",
			aqab: "130% ArCiela",
			staum: "130% Floki",
			osmanlien: "130% Eltharin",
			mon: "130% Valmaric",
			nok: "130% DarkEldar",
			carredass: "130% Celestial",
			blanc: "130% OrkGlyphs",
			knigien: "130% Tengwar",
			esperan: "130% Thassilonian",
			alta: "130% Espruar",
		};
	}
	get originalTongues() {
		return {
			_default: "common",
			kohestien: "kohestien",
			aqab: "aqab",
			staum: "staum",
			osmanlien: "osmanlien",
			mon: "mon",
			nok: "nok",
			carredass: "carredass",
			blanc: "blanc",
			knigien: "knigien",
			esperan: "esperan",
			altabiancais: "alta",
			altanegrais: "alta",
		};
	}
	get settings() {
		return {};
	}
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		known_languages.add(game.i18n.localize("ARIA.languages.Common"));
		for (let lang of actor.items) {
			if (lang.system.language) known_languages.add(lang.name.toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class coc7LanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.items) {
			const match =
				item.name.match(game.settings.get("polyglot", "LanguageRegex") + "\\s*\\((.+)\\)", "i") ||
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOwn") + "\\s*\\((.+)\\)", "i") ||
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageAny") + "\\s*\\((.+)\\)", "i") ||
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOther") + "\\s*\\((.+)\\)", "i");
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match) known_languages.add(match[1].trim().toLowerCase());
			else if (
				[
					game.i18n.localize("POLYGLOT.COC7.LanguageSpec"),
					game.i18n.localize("POLYGLOT.COC7.LanguageOwn"),
					game.i18n.localize("POLYGLOT.COC7.LanguageAny"),
					game.i18n.localize("POLYGLOT.COC7.LanguageOther"),
					game.i18n.localize("CoC7.language"),
					"Language",
					"Language (Own)",
					"Language (Other)",
				].includes(item.system.specialization)
			)
				known_languages.add(item.name.trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class cyberpunkRedLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			cyrillic: "130% KremlinPremier",
			miroslavnormal: "200% MiroslavNormal",
			arciela: "200% ArCiela",
			oriental: "130% Oriental",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			streetslang: "common",
			arabic: "arciela",
			bengali: "common",
			berber: "common",
			burmese: "arciela",
			cantonese: "oriental",
			chinese: "oriental",
			cree: "common",
			creole: "common",
			dari: "common",
			dutch: "common",
			english: "common",
			farsi: "arciela",
			filipino: "arciela",
			finnish: "cyrillic",
			french: "common",
			german: "miroslavnormal",
			guarani: "common",
			hausa: "common",
			hawaiian: "common",
			hebrew: "common",
			hindi: "arciela",
			indonesian: "arciela",
			italian: "common",
			japanese: "oriental",
			khmer: "arciela",
			korean: "oriental",
			lingala: "common",
			malayan: "arciela",
			mandarin: "oriental",
			maori: "common",
			mayan: "common",
			mongolian: "arciela",
			navajo: "common",
			nepali: "arciela",
			norwegian: "miroslavnormal",
			oromo: "common",
			pamanyungan: "common",
			polish: "cyrillic",
			portuguese: "common",
			quechua: "common",
			romanian: "cyrillic",
			russian: "cyrillic",
			sinhalese: "common",
			spanish: "common",
			swahili: "common",
			tahitian: "common",
			tamil: "common",
			turkish: "arciela",
			twi: "common",
			ukrainian: "cyrillic",
			urdu: "arciela",
			vietnamese: "arciela",
			yoruba: "common",
		};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {
			streetslang: "Streetslang",
			arabic: "Arabic",
			bengali: "Bengali",
			berber: "Berber",
			burmese: "Burmese",
			cantonese: "Cantonese",
			chinese: "Chinese",
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
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		const languageRegex = game.settings.get("polyglot", "LanguageRegex");
		let myRegex = new RegExp(languageRegex + "\\s*\\((.+)\\)", "i");
		for (let item of actor.items) {
			if (item.type == "skill") {
				const match = item.name.match(myRegex);
				if (match) {
					known_languages.add(match[1].trim().toLowerCase());
				}
			}
		}
		return [known_languages, literate_languages];
	}
}

export class d35eLanguageProvider extends LanguageProvider {
	get settings() {
		return {};
	}
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			auran: "200% OldeThorass",
			celestial: "180% Celestial",
			outwordly: "200% ArCiela",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			druidic: "120% JungleSlang",
			gnoll: "150% Kargi",
			elvish: "150% Espruar",
			infernal: "230% Infernal",
			sylvan: "200% OldeEspruar",
			tirsu: "250% Pulsian",
			drowic: "150% HighDrowic",

			serpent: "120% Ophidian",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			aarakocra: "auran",
			abyssal: "infernal",
			aquan: "dwarvish",
			auran: "dwarvish",
			celestial: "celestial",
			deep: "outwordly",
			draconic: "draconic",
			druidic: "druidic",
			dwarven: "dwarvish",
			elven: "elvish",
			giant: "dwarvish",
			gith: "tirsu",
			gnoll: "gnoll",
			gnome: "dwarvish",
			goblin: "dwarvish",
			halfling: "common",
			ignan: "dwarvish",
			infernal: "infernal",
			orc: "dwarvish",
			primordial: "dwarvish",
			sylvan: "sylvan",
			terran: "dwarvish",
			cant: "common",
			treant: "sylvan",
			undercommon: "drowic",
		};
	}
}

export class darkHeresyLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			reikspiel: "230% Infernal",
			druhir: "150% DarkEldar",
			eltharin: "130% Eltharin",
			kislevien: "110% MiroslavNormal",
			norse: "350% ElderFuthark",
			orcish: "150% OrkGlyphs",
			queekish: "130% Skaven",
			slaan: "170% Saurian",
			klinkarhun: "110% Floki",
			romance: "130% Tengwar",
			cathan: "130% Oriental",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			chapterRunes: "",
			chaosMarks: "",
			eldar: "",
			highGothic: "reikspiel",
			imperialCodes: "",
			lowGothic: "reikspiel",
			mercenary: "",
			necrontyr: "",
			ork: "orcish",
			technaLingua: "",
			tau: "",
			underworld: "",
			xenosMarkings: "",
		};
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "lowGothic";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {
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
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang in actor.system.skills.linguistics.specialities) {
			if (actor.system.skills.linguistics.specialities[lang]["advance"] >= 0) known_languages.add(lang);
		}
		return [known_languages, literate_languages];
	}
}

export class dccLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			elvish: "150% Espruar",
			gnoll: "150% Kargi",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			draconic: "draconic",
			dwarvish: "dwarvish",
			elvish: "elvish",
			giant: "dwarvish",
			gnoll: "gnoll",
			goblin: "dwarvish",
			halfling: "common",
			orc: "dwarvish",
			cant: "common",
		};
	}

	get settings() {
		return {};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		for (let item in CONFIG.DCC.languages) {
			langs[item] = game.i18n.localize(CONFIG.DCC.languages[item]);
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.system.details.languages.split(/[,;]/)) known_languages.add(lang.trim().toLowerCase());
		return [known_languages, literate_languages];
	}
}

export class demonlordLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			elemental: "150% HighDrowic",
			trollish: "200% ArCiela",
			dwarvish: "120% Dethek",
			woad: "120% JungleSlang",
			elvish: "150% Espruar",
			infernal: "250% Infernal",
			secret: "200% Thassilonian",
			balgrennish: "150% Tengwar",
			exotic: "200% Barazhad",
		};
	}

	get originalTongues() {
		return {
			_default: "exotic",
			"Common Tongue": "common",
			"Dark Speech": "infernal",
			"High Archaic": "common",
			Elvish: "elvish",
			Dwarvish: "dwarvish",
			"Secret Language": "secret",
			Trollish: "trollish",
			Centauri: "elemental",
			Gnomish: "elemental",
			Amrin: "common",
			Balgrennish: "balgrennish",
			Bhali: "balgrennish",
			Edene: "common",
			Erath: "common",
			Grennish: "balgrennish",
			Kalasan: "common",
			Woad: "woad",
			Sylphen: "elemental",
			Molekin: "exotic",
			Naga: "exotic",
			Yerath: "exotic",
		};
	}

	get requiresReady() {
		return true;
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "Common Tongue";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		const demonlordPack = game.packs.get("demonlord.languages");
		const demonlordItemList = await demonlordPack.getIndex();
		for (let item of demonlordItemList) {
			const originalName = item?.flags?.babele?.originalName || item.name;
			langs[originalName] = item.name;
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.items) {
			if (item.type === "language") {
				const name = item?.flags?.babele?.originalName || item.name;
				if (item.system.speak) known_languages.add(name);
				if (item.system.read) literate_languages.add(name);
			}
		}
		return [known_languages, literate_languages];
	}

	conditions(lang) {
		return game.polyglot.literate_languages.has(lang);
	}
}

export class dnd4eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			barazhad: "150% Barazhad",
			davek: "150% Davek",
			iokharic: "170% Iokharic",
			rellanic: "200% Rellanic",
			celestial: "180% Celestial",
			outwordly: "200% ArCiela",
		};
	}
	get originalTongues() {
		return {
			_default: "common",
			abyssal: "barazhad",
			deep: "outwordly",
			draconic: "iokharic",
			dwarven: "davek",
			elven: "rellanic",
			giant: "davek",
			goblin: "davek",
			primordial: "davek",
			supernal: "celestial",
		};
	}
	get settings() {
		return {};
	}

	addToConfig(key, lang) {
		CONFIG.DND4EBETA.spoken[key] = lang;
	}
	removeFromConfig(key) {
		delete CONFIG.DND4EBETA.spoken[key];
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		if (replaceLanguages) CONFIG.DND4EBETA.spoken = {};
		this.languages = CONFIG.DND4EBETA.spoken;
	}
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.system.languages.spoken.value) known_languages.add(lang);
		// for (let lang of actor.system.languages.script.value) literate_languages.add(lang);
		return [known_languages, literate_languages];
	}
}

export class dnd5eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			auran: "200% OldeThorass",
			celestial: "180% Celestial",
			outwordly: "200% ArCiela",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			druidic: "120% JungleSlang",
			gnoll: "150% Kargi",
			elvish: "150% Espruar",
			infernal: "230% Infernal",
			sylvan: "200% OldeEspruar",
			tirsu: "250% Pulsian",
			drowic: "150% HighDrowic",
			serpent: "120% Ophidian",
		};
	}
	get originalTongues() {
		return {
			_default: "common",
			aarakocra: "auran",
			abyssal: "infernal",
			aquan: "dwarvish",
			auran: "dwarvish",
			celestial: "celestial",
			deep: "outwordly",
			draconic: "draconic",
			druidic: "druidic",
			dwarvish: "dwarvish",
			elvish: "elvish",
			giant: "dwarvish",
			gith: "tirsu",
			gnoll: "gnoll",
			gnomish: "dwarvish",
			goblin: "dwarvish",
			halfling: "common",
			ignan: "dwarvish",
			infernal: "infernal",
			orc: "dwarvish",
			primordial: "dwarvish",
			sylvan: "sylvan",
			terran: "dwarvish",
			cant: "common",
			undercommon: "drowic",
		};
	}
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
	 * @var literate_languages	For systems that support literacy (e.g. reading journals).
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) known_languages.add(lang);
			if (actor.system.traits.languages.custom) {
				const defaultSpecialLanguage = game.settings.get("polyglot", "DND5E.SpecialLanguages").trim().toLowerCase();
				for (let lang of actor.system.traits.languages?.custom.split(/[;]/)) {
					lang = lang.trim().toLowerCase();
					if (lang.includes("usually common") || lang.includes("in life") || lang.includes("its creator")) {
						known_languages.add(defaultSpecialLanguage);
					} else if (lang.includes("usually")) {
						lang = lang.match(/(?<=usually)(.*)(?=\))/g)[0].trim();
						known_languages.add(lang);
					} else if (lang.match(/(?<=any)(.*)(?=language)/g)) {
						lang = lang.match(/(?<=any)(.*)(?=language)/g)[0].trim();
						known_languages.add(defaultSpecialLanguage);
					} else if (lang.match(/(?<=understands)(.*)(?=but can't speak it)/g)) {
						lang = lang.match(/(?<=understands)(.*)(?=but can't speak it)/g)[0].trim();
						known_languages.add(lang);
					} else if (lang.match(/(.*)(?=plus)/)) {
						lang = lang.match(/(.*)(?=plus)/)[0].trim();
						known_languages.add(lang);
					} else known_languages.add(lang);
				}
			}
		}
		return [known_languages, literate_languages];
	}
}

export class dsa5LanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"Altes Alaani": "150% HighschoolRunes",
			Amulashtra: "150% Qijomi",
			"Angram-Bilderschrift": "150% Skaven",
			Arkanil: "170% ArCiela",
			Atak: "150% FingerAlphabet",
			Chrmk: "150% Iokharic",
			Chuchas: "150% Kargi",
			"Drakhard-Zinken": "150% Celestial",
			Fjarningsch: "150% Dethek",
			"Geheiligte Glyphen von Unau": "150% HighDrowic",
			"Gimaril-Glyphen": "150% Semphari",
			Goblinisch: "150% OrkGlyphs",
			"Hjaldingsche Runen": "140% OldeThorass",
			"Imperiale Zeichen": "160% Infernal",
			"Isdira- und Asdharia-Zeichen": "150% Tengwar",
			"Kusliker Zeichen": "150% MiroslavNormal",
			Mohisch: "150% JungleSlang",
			"Nanduria-Zeichen": "150% Espruar",
			Nujuka: "150% Reanaarian",
			// "Ogrisch": "150% OrkGlyphs",
			// "Oloarkh": "150% OrkGlyphs",
			// "Ologhaijan": "150% OrkGlyphs",
			// "Protozelemja": "150% Kargi",
			// "Rabensprache": "150% Valmaric"
			"Rogolan-Runen": "350% ElderFuthark",
			"Thorwalsche Runen": "150% Floki",
			"Trollische Raumbildschrift": "150% Eltharin",
			"Tulamidya-Zeichen": "150% Valmaric",
			"Ur-Tulamidya-Zeichen": "150% OldeEspruar",
			"Zhayad-Zeichen": "200% Pulsian",
			unbekannt: "150% Ophidian",
			// "Yash-Hualay-Glyphen": "150% Kargi",
		};
	}

	get originalTongues() {
		return {
			_default: "unbekannt",
			alaani: "Kusliker Zeichen",
			"altes alaani": "Altes Alaani",
			amulashtra: "Amulashtra",
			angram: "Angram-Bilderschrift",
			"angram-bilderschrift": "Angram-Bilderschrift",
			arkanil: "Arkanil",
			asdharia: "Isdira- und Asdharia-Zeichen",
			atak: "Atak",
			aureliani: "Imperiale Zeichen",
			bosparano: "Kusliker Zeichen",
			chrmk: "Chrmk",
			chuchas: "Chuchas",
			"drakhard-zinken": "Drakhard-Zinken",
			fjarningsch: "Fjarningsch",
			garethi: "Kusliker Zeichen",
			"geheiligte glyphen von unau": "Geheiligte Glyphen von Unau",
			"gimaril-glyphen": "Gimaril-Glyphen",
			goblinisch: "Goblinisch",
			"hjaldingsche hunen": "Hjaldingsche Runen",
			"imperiale zeichen": "Imperiale Zeichen",
			isdira: "Isdira- und Asdharia-Zeichen",
			"isdira- und asdharia-zeichen": "Isdira- und Asdharia-Zeichen",
			"kusliker zeichen": "Kusliker Zeichen",
			mohisch: "Mohisch",
			"nanduria-zeichen": "Nanduria-Zeichen",
			nujuka: "Nujuka",
			ogrisch: "Goblinisch",
			oloarkh: "Goblinisch",
			ologhaijan: "Goblinisch",
			protozelemja: "Chuchas",
			rabensprache: "Tulamidya-Zeichen",
			rogolan: "Rogolan-Runen",
			"rogolan-runen": "Rogolan-Runen",
			rssahh: "Chrmk",
			ruuz: "Tulamidya-Zeichen",
			"saga-thorwalsch": "Hjaldingsche Runen",
			tahaya: "Mohisch",
			thorwalsch: "Thorwalsche Runen",
			"thorwalsche runen": "Thorwalsche Runen",
			trollisch: "Trollische Raumbildschrift",
			"trollische raumbildschrift": "Trollische Raumbildschrift",
			tulamidya: "Tulamidya-Zeichen",
			"tulamidya-zeichen": "Tulamidya-Zeichen",
			"ur-tulamidya": "Ur-Tulamidya-Zeichen",
			"ur-tulamidya-zeichen": "Ur-Tulamidya-Zeichen",
			"yash-hualay-glyphen": "Chuchas",
			zelemja: "Chrmk",
			zhayad: "Zhayad-Zeichen",
			"zhayad-zeichen": "Zhayad-Zeichen",
			zyklopäisch: "Kusliker Zeichen",
		};
	}

	get requiresReady() {
		return true;
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "garethi";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		let langs = {};
		if (game.modules.has("dsa5-core")) {
			if (!game.modules.get("dsa5-core").active) {
				ui.notifications.warn(`Polyglot | The ${game.modules.get("dsa5-core").title} module isn't active. Defaulting to built-in languages.`);
			} else {
				const dsa5Pack = game.packs.get("dsa5-core.coreabilities") ?? game.packs.get("dsa5-core.coreenabilities");
				if (dsa5Pack) {
					const dsa5ItemList = await dsa5Pack.getIndex();
					let languageRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + "\\s*\\((.+)\\)", "i");
					let literacyRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + "\\s*\\((.+)\\)", "i");
					for (let item of dsa5ItemList) {
						let match = item.name.match(languageRegex);
						if (match) {
							let lang = match[1].trim();
							let key = lang.toLowerCase();
							langs[key] = lang;
						} else {
							match = item.name.match(literacyRegex);
							if (match) {
								let lang = match[1].trim();
								let key = lang.toLowerCase();
								langs[key] = lang;
							}
						}
					}
					this.languages = replaceLanguages ? {} : langs;
					return;
				} else {
					ui.notifications.error(`Polyglot | The ${game.modules.get("dsa5-core").title} pack wasn't retrieved correctly. Defaulting to built-in languages.`, {
						console: false,
					});
				}
			}
		}

		langs = {
			alaani: "Alaani",
			"altes alaani": "Altes Alaani",
			amulashtra: "Amulashtra",
			angram: "Angram",
			"angram-bilderschrift": "Angram-Bilderschrift",
			arkanil: "Arkanil",
			asdharia: "Asdharia",
			atak: "Atak",
			aureliani: "Aureliani",
			bosparano: "Bosparano",
			chrmk: "Chrmk",
			chuchas: "Chuchas",
			"drakhard-zinken": "Drakhard-Zinken",
			fjarningsch: "Fjarningsch",
			garethi: "Garethi",
			"geheiligte glyphen von unau": "Geheiligte Glyphen von Unau",
			"gimaril-glyphen": "Gimaril-Glyphen",
			goblinisch: "Goblinisch",
			"hjaldingsche runen": "Hjaldingsche Runen",
			"imperiale zeichen": "Imperiale Zeichen",
			isdira: "Isdira",
			"isdira- und asdharia-zeichen": "Isdira- und Asdharia-Zeichen",
			"kusliker zeichen": "Kusliker Zeichen",
			mohisch: "Mohisch",
			"nanduria-zeichen": "Nanduria-Zeichen",
			nujuka: "Nujuka",
			ogrisch: "Ogrisch",
			oloarkh: "Oloarkh",
			ologhaijan: "Ologhaijan",
			protozelemja: "Protozelemja",
			rabensprache: "Rabensprache",
			rogolan: "Rogolan",
			"rogolan-runen": "Rogolan-Runen",
			rssahh: "Rssahh",
			ruuz: "Ruuz",
			"saga-thorwalsch": "Saga-Thorwalsch",
			tahaya: "Tahaya",
			thorwalsch: "Thorwalsch",
			"thorwalsche runen": "Thorwalsche Runen",
			trollisch: "Trollisch",
			"trollische raumbildschrift": "Trollische Raumbildschrift",
			tulamidya: "Tulamidya",
			"tulamidya-zeichen": "Tulamidya-Zeichen",
			"ur-tulamidya": "Ur-Tulamidya",
			"ur-tulamidya-zeichen": "Ur-Tulamidya-Zeichen",
			"yash-hualay-glyphen": "Yash-Hualay-Glyphen",
			zelemja: "Zelemja",
			zhayad: "Zhayad",
			"zhayad-zeichen": "Zhayad-Zeichen",
			zyklopäisch: "Zyklopäisch",
		};
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		let languageRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + "\\s*\\((.+)\\)", "i");
		let literacyRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + "\\s*\\((.+)\\)", "i");
		for (let item of actor.items) {
			if (item.system.category?.value === "language") {
				let match = item.name.match(languageRegex);
				if (match) {
					known_languages.add(match[1].trim().toLowerCase());
				} else {
					match = item.name.match(literacyRegex);
					if (match) {
						literate_languages.add(match[1].trim().toLowerCase());
					}
				}
			}
		}
		return [known_languages, literate_languages];
	}

	conditions(lang) {
		return game.polyglot.literate_languages.has(lang);
	}
}

export class earthdawn4eLanguageProvider extends LanguageProvider {
	get originalTongues() {
		return {
			human: "thorass",
			dwarven: "dethek",
			elven: "espruar",
			windling: "oldethorass",
			obsidiman: "dethek",
			troll: "jungleslang",
			ork: "dethek",
			tskrang: "iokharic",
		};
	}
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
		for (let lang in this.originalTongues) {
			this.languages[lang] = game.i18n.localize(`earthdawn.l.language${lang.capitalize()}`);
		}
	}
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang in actor.system.speak.languages) {
			if (actor.system.speak.languages[lang]) known_languages.add(lang);
		}
		for (let lang in actor.system.languages.write) {
			if (actor.system.write.languages[lang]) literate_languages.add(lang);
		}
		if (actor.system.languages.other) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			const literacyRegex = game.settings.get("polyglot", "LiteracyRegex");
			for (let lang of actor.system.languages.other.split(/[,;]/)) {
				const languageMatch = lang.match(languageRegex + " \\((.+)\\)", "i");
				const literacyMatch = lang.match(literacyRegex + " \\((.+)\\)", "i");
				if (languageMatch || literacyMatch) {
					if (languageMatch) known_languages.add(languageMatch[1].trim().toLowerCase());
					else if (literacyMatch) literate_languages.add(literacyMatch[1].trim().toLowerCase());
				} else {
					known_languages.add(lang.trim().toLowerCase());
					literate_languages.add(lang.trim().toLowerCase());
				}
			}
		}
		return [known_languages, literate_languages];
	}

	conditions(lang) {
		return game.polyglot.literate_languages.has(lang);
	}
}

export class fggLanguageProvider extends LanguageProvider {
	get settings() {
		return {};
	}
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.system.languages.value) known_languages.add(lang.toLowerCase());
		if (actor.system.languages.custom) {
			for (let lang of actor.system.languages?.custom.split(/[,;]/)) known_languages.add(lang.trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class gurpsLanguageProvider extends LanguageProvider {
	/**
	 * Search through all of the advantages (including recursing into containers) looking for "Language" or translation.
	 * Depending on the source, it can be two different patterns, Language: NAME (optionals) or Language (NAME) (optionals)
	 * and the advantage names may or may not be translated, so we must search for both
	 */
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		if (GURPS) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			// window.GURPS set when the GURPS game system is loaded
			let npat1 = ": +(?<name>[^\\(]+)";
			let npat2 = " +\\((?<name>[^\\)]+)\\)";
			GURPS.recurselist(actor.system.ads, (advantage) => {
				if (!this.updateForPattern(advantage, new RegExp(languageRegex + npat1, "i"), known_languages, literate_languages))
					if (!this.updateForPattern(advantage, new RegExp(languageRegex + npat2, "i"), known_languages, literate_languages))
						if (!this.updateForPattern(advantage, new RegExp(game.i18n.localize("GURPS.language") + npat1, "i"), known_languages, literate_languages, true))
							this.updateForPattern(advantage, new RegExp(game.i18n.localize("GURPS.language") + npat2, "i"), known_languages, literate_languages, true);
			});
		}
		return [known_languages, literate_languages];
	}

	/**
    If we match on the Language name, search the name (or the notes) 
    for indicators of spoken or written levels of comprehension in English, or translated
  */
	updateForPattern(advantage, regex, known_languages, literate_languages, langDetected = false) {
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
				known_languages.add(lang);
				literate_languages.add(lang);
				return true;
			} else if (written) {
				literate_languages.add(lang);
				return true;
			} else if (spoken) {
				known_languages.add(lang);
				return true;
			} else {
				// neither is specificaly identified, assume both if "Language" detected
				if (langDetected) {
					known_languages.add(lang);
					literate_languages.add(lang);
					return true;
				}
			}
		}
		return false;
	}
}

export class oseLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			lawful: "180% Celestial",
			chaotic: "150% Barazhad",
			neutral: "230% Infernal",
			doppelganger: "250% Pulsian",
			dwarvish: "120% Dethek",
			draconic: "170% Iokharic",
			gargoyle: "150% HighDrowic",
			gnoll: "150% Kargi",
			gnomish: "120% Tengwar",
			harpy: "200% OldeThorass",
			elvish: "150% Espruar",
			ogre: "120% MeroiticDemotic",
			sylvan: "200% OldeEspruar",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			1: "lawful",
			2: "chaotic",
			3: "neutral",
			4: "dwarvish",
			5: "doppelganger",
			6: "draconic",
			7: "dwarvish",
			8: "elvish",
			9: "gargoyle",
			10: "gnoll",
			11: "gnomish",
			12: "dwarvish",
			14: "harpy",
			15: "dwarvish",
			16: "draconic",
			17: "draconic",
			18: "gargoyle",
			19: "sylvan",
			20: "ogre",
			21: "dwarvish",
			22: "sylvan",
		};
	}

	get settings() {
		return {};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		this.languages = replaceLanguages ? [] : Object.fromEntries(CONFIG.OSE.languages.map((l) => [l, l]));
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.system.languages.value) known_languages.add(lang);
		return [known_languages, literate_languages];
	}
}

export class pf1LanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			abyssal: "150% Barazhad",
			auran: "200% OldeThorass",
			azlanti: "120% Tengwar",
			boggard: "120% Semphari",
			celestial: "180% Celestial",
			outwordly: "200% ArCiela",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			drowic: "150% HighDrowic",
			dziriak: "250% Pulsian",
			giant: "120% MeroiticDemotic",
			gnoll: "150% Kargi",
			elvish: "150% Espruar",
			erutaki: "120% Tuzluca",
			garundi: "120% Qijomi",
			infernal: "230% Infernal",
			jistka: "120% Valmaric",
			jungle: "120% JungleSlang",
			kelish: "170% HighschoolRunes",
			oriental: "130% Oriental",
			requian: "150% Reanaarian",
			serpent: "120% Ophidian",
			signs: "170% FingerAlphabet",
			sylvan: "200% OldeEspruar",
			thassilonian: "150% Thassilonian",
			utopian: "140% MarasEye",
		};
	}
	get originalTongues() {
		return {
			_default: "common",
			aboleth: "outwordly",
			abyssal: "abyssal",
			aklo: "serpent",
			algollthu: "outwordly",
			anadi: "jungle",
			aquan: "auran",
			arboreal: "sylvan",
			auran: "auran",
			azlanti: "azlanti",
			boggard: "boggard",
			caligni: "drowic",
			celestial: "celestial",
			cyclops: "giant",
			daemonic: "infernal",
			dark: "drowic",
			destrachan: "outwordly",
			draconic: "draconic",
			drowsign: "signs",
			druidic: "jungle",
			dwarven: "dwarvish",
			dziriak: "dziriak",
			elven: "elvish",
			erutaki: "erutaki",
			garundi: "garundi",
			giant: "giant",
			gnoll: "gnoll",
			gnome: "dwarvish",
			gnomish: "dwarvish",
			goblin: "gnoll",
			grippli: "boggard",
			hallit: "azlanti",
			ignan: "dwarvish",
			iruxi: "boggard",
			jistkan: "jistka",
			jotun: "giant",
			jyoti: "celestial",
			infernal: "infernal",
			kelish: "kelish",
			mwangi: "azlanti",
			necril: "drowic",
			orc: "dwarvish",
			orcish: "dwarvish",
			polyglot: "azlanti",
			protean: "abyssal",
			requian: "requian",
			shoanti: "azlanti",
			skald: "jitska",
			sphinx: "requian",
			strix: "infernal",
			sylvan: "sylvan",
			shoony: "dwarvish",
			taldane: "azlanti",
			tengu: "oriental",
			terran: "dwarvish",
			thassilonian: "thassilonian",
			tien: "oriental",
			treant: "sylvan",
			undercommon: "drowic",
			utopian: "utopian",
			varisian: "azlanti",
			vegepygmy: "gnoll",
			vudrani: "garundi",
		};
	}
	get settings() {
		return {};
	}
}

export class pf2eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			abyssal: "150% Barazhad",
			auran: "200% OldeThorass",
			azlanti: "120% Tengwar",
			boggard: "120% Semphari",
			celestial: "180% Celestial",
			outwordly: "200% ArCiela",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			drowic: "150% HighDrowic",
			dziriak: "250% Pulsian",
			giant: "120% MeroiticDemotic",
			gnoll: "150% Kargi",
			elvish: "150% Espruar",
			erutaki: "120% Tuzluca",
			garundi: "120% Qijomi",
			infernal: "230% Infernal",
			jistka: "120% Valmaric",
			jungle: "120% JungleSlang",
			kelish: "170% HighschoolRunes",
			oriental: "130% Oriental",
			requian: "150% Reanaarian",
			serpent: "120% Ophidian",
			signs: "170% FingerAlphabet",
			sylvan: "200% OldeEspruar",
			thassilonian: "150% Thassilonian",
			utopian: "140% MarasEye",
		};
	}
	get originalTongues() {
		return {
			_default: "common",
			aboleth: "outwordly",
			abyssal: "abyssal",
			aklo: "serpent",
			algollthu: "outwordly",
			anadi: "jungle",
			aquan: "auran",
			arboreal: "sylvan",
			auran: "auran",
			azlanti: "azlanti",
			boggard: "boggard",
			caligni: "drowic",
			celestial: "celestial",
			cyclops: "giant",
			daemonic: "infernal",
			dark: "drowic",
			destrachan: "outwordly",
			draconic: "draconic",
			drowsign: "signs",
			druidic: "jungle",
			dwarven: "dwarvish",
			dziriak: "dziriak",
			elven: "elvish",
			erutaki: "erutaki",
			garundi: "garundi",
			giant: "giant",
			gnoll: "gnoll",
			gnome: "dwarvish",
			gnomish: "dwarvish",
			goblin: "gnoll",
			grippli: "boggard",
			hallit: "azlanti",
			ignan: "dwarvish",
			iruxi: "boggard",
			jistkan: "jistka",
			jotun: "giant",
			jyoti: "celestial",
			infernal: "infernal",
			kelish: "kelish",
			mwangi: "azlanti",
			necril: "drowic",
			orc: "dwarvish",
			orcish: "dwarvish",
			polyglot: "azlanti",
			protean: "abyssal",
			requian: "requian",
			shoanti: "azlanti",
			skald: "jitska",
			sphinx: "requian",
			strix: "infernal",
			sylvan: "sylvan",
			shoony: "dwarvish",
			taldane: "azlanti",
			tengu: "oriental",
			terran: "dwarvish",
			thassilonian: "thassilonian",
			tien: "oriental",
			treant: "sylvan",
			undercommon: "drowic",
			utopian: "utopian",
			varisian: "azlanti",
			vegepygmy: "gnoll",
			vudrani: "garundi",
		};
	}
	get settings() {
		return {};
	}
	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		if (replaceLanguages) {
			CONFIG.PF2E.languages = {};
		} else {
			for (let lang in CONFIG.PF2E.languages) {
				langs[lang] = game.i18n.localize(CONFIG.PF2E.languages[lang]);
			}
		}
		this.languages = langs;
	}
	addLanguage(lang) {
		if (!lang) return;
		lang = lang.trim();
		let key = lang.toLowerCase().replace(/ \'/g, "_");
		const homebrewLanguagesObj = game.settings.get("pf2e", "homebrew.languages");
		const homebrewLanguagesKeys = homebrewLanguagesObj.map((a) => a.id);
		const homebrewLanguagesValues = homebrewLanguagesObj.map((a) => a.value);
		if (homebrewLanguagesValues.includes(lang)) {
			const index = homebrewLanguagesValues.indexOf(lang);
			key = homebrewLanguagesKeys[index];
		}
		this.languages[key] = lang;
		this.addToConfig(key, lang);
		if (!(key in this.tongues)) {
			this.tongues[key] = this.tongues["_default"];
		}
	}
}

export class sfrpgLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			abyssal: "150% Barazhad",
			auran: "200% OldeThorass",
			azlanti: "120% Tengwar",
			boggard: "120% Semphari",
			celestial: "180% Celestial",
			outwordly: "200% ArCiela",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			drowic: "150% HighDrowic",
			dziriak: "250% Pulsian",
			giant: "120% MeroiticDemotic",
			gnoll: "150% Kargi",
			elvish: "150% Espruar",
			erutaki: "120% Tuzluca",
			garundi: "120% Qijomi",
			infernal: "230% Infernal",
			jistka: "120% Valmaric",
			jungle: "120% JungleSlang",
			kelish: "170% HighschoolRunes",
			oriental: "130% Oriental",
			requian: "150% Reanaarian",
			serpent: "120% Ophidian",
			signs: "170% FingerAlphabet",
			sylvan: "150% OldeEspruar",
			thassilonian: "150% Thassilonian",
			utopian: "140% MarasEye",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			abyssal: "abyssal",
			akito: "common",
			aklo: "serpent",
			arkanen: "common",
			aquan: "auran",
			auran: "auran",
			azlanti: "azlanti",
			celestial: "celestial",
			draconic: "draconic",
			drow: "drowic",
			dwarven: "dwarvish",
			elven: "elvish",
			gnome: "dwarvish",
			goblin: "gnoll",
			halfling: "common",
			ignan: "dwarvish",
			infernal: "infernal",
			kalo: "common",
			kasatha: "common",
			Nchaki: "common",
			orc: "dwarvish",
			sarcesian: "common",
			shirren: "common",
			shobhad: "common",
			terran: "auran",
			triaxian: "common",
			vercite: "common",
			vesk: "common",
			ysoki: "common",
		};
	}

	get settings() {
		return {};
	}
}

export class shadowrun5eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			aztec: "200% Aztec",
			chinese: "130% ScrapbookChinese",
			common: "130% Thorass",
			cyrillic: "130% KremlinPremier",
			elvish: "150% Espruar",
			orcish: "150% OrkGlyphs",
			oriental: "130% Oriental",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			cityspeak: "common",
			spanish: "common",
			lakota: "common",
			dakota: "common",
			navajo: "common",
			russian: "cyrillic",
			french: "common",
			italian: "common",
			german: "common",
			aztlaner: "aztec",
			sperethiel: "elvish",
			orzet: "orcish",
			english: "common",
			japanese: "oriental",
			mandarin: "chinese",
		};
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "cityspeak";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {
			cityspeak: "Cityspeak",
			spanish: "Spanish",
			lakota: "Lakota",
			dakota: "Dakota",
			navajo: "Navajo",
			russian: "Russian",
			french: "French",
			italian: "Italian",
			german: "German",
			aztlaner: "Aztlaner Spanish",
			sperethiel: "Sperethiel",
			"or'zet": "Or'zet",
			english: "English",
			japanese: "Japanese",
			mandarin: "Mandarin",
		};
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang in actor.system.skills.language.value) known_languages.add(actor.system.skills.language.value[lang].name.toLowerCase());
		return [known_languages, literate_languages];
	}
}

export class splittermondLanguageProvider extends LanguageProvider {
	get settings() {
		return {};
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		const isLiterate = actor.items.filter((item) => item.name == "Literat" && item.type == "strength").length > 0;
		actor.items
			.filter((item) => item.type == "language")
			.forEach((item) => {
				const name = item.name.trim().toLowerCase();
				known_languages.add(name);
				if (isLiterate) literate_languages.add(name);
			});
		return [known_languages, literate_languages];
	}

	conditions(lang) {
		return game.polyglot.literate_languages.has(lang);
	}
}

export class swadeLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.SWADE.LanguageSkills"),
			},
		};
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		const languageRegex = game.settings.get("polyglot", "LanguageRegex");
		let myRegex = new RegExp(languageRegex + " \\((.+)\\)", "i");
		for (let item of actor.items) {
			const name = item?.flags?.babele?.originalName || item.name;
			const match = name.match(myRegex);
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match) known_languages.add(match[1].trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class sw5eLanguageProvider extends LanguageProvider {
	get originalTongues() {
		return {
			_default: "celestial",
			abyssin: "barazhad",
			aleena: "jungleslang",
			antarian: "arciela",
			anzellan: "valmaric",
			aqualish: "floki",
			arconese: "orkglyphs",
			ardennian: "thorass",
			arkanian: "celestial",
			balosur: "arciela",
			barabel: "darkeldar",
			basic: "celestial",
			besalisk: "barazhad",
			binary: "celestial",
			bith: "skaven",
			bocce: "tuzluca",
			bothese: "infernal",
			catharese: "espruar",
			cerean: "oldeespruar",
			"chadra-fan": "infernal",
			chagri: "ophidian",
			cheunh: "arciela",
			chevin: "eltharin",
			chironan: "saurian",
			clawdite: "reanaarian",
			codruese: "meroiticdemotic",
			colicoid: "thassilonian",
			dashadi: "iokharic",
			defel: "darkeldar",
			devaronese: "iokharic",
			dosh: "iokharic",
			draethos: "pulsian",
			durese: "reanaarian",
			dug: "qijomi",
			ewokese: "skaven",
			falleen: "tengwar",
			felucianese: "skaven",
			gamorrese: "highschoolrunes",
			gand: "reanaarian",
			geonosian: "maraseye",
			givin: "highdrowic",
			gran: "qijomi",
			gungan: "highschoolrunes",
			hapan: "valmaric",
			harchese: "thassilonian",
			herglese: "ophidian",
			honoghran: "tuzluca",
			huttese: "thassilonian",
			iktotchese: "iokharic",
			ithorese: "dethek",
			jawaese: "valmaric",
			kaleesh: "infernal",
			kaminoan: "arciela",
			karkaran: "ophidian",
			keldor: "meroiticdemotic",
			kharan: "arciela",
			killik: "thassilonian",
			klatooinian: "thassilonian",
			kubazian: "oldethorass",
			kushiban: "thorass",
			kyuzo: "barazhad",
			lannik: "semphari",
			lasat: "floki",
			lowickese: "qijomi",
			lurmese: "jungleslang",
			mandoa: "kargi",
			miralukese: "miroslavnormal",
			mirialan: "miroslavnormal",
			moncal: "darkeldar",
			mustafarian: "orkglyphs",
			muun: "tengwar",
			nautila: "ophidian",
			ortolan: "thorass",
			pakpak: "oldethorass",
			pyke: "meroiticdemotic",
			quarrenese: "ophidian",
			rakata: "iokharic",
			rattataki: "infernal",
			rishii: "maraseye",
			rodese: "meroiticdemotic",
			ryn: "espruar",
			selkatha: "ophidian",
			semblan: "fingeralphabet",
			shistavanen: "pulsian",
			shyriiwook: "oldeespruar",
			sith: "highdrowic",
			squibbian: "valmaric",
			sriluurian: "jungleslang",
			"ssi-ruuvi": "maraseye",
			sullustese: "highschoolrunes",
			talzzi: "oldethorass",
			tarasinese: "oldeespruar",
			thisspiasian: "arciela",
			togorese: "floki",
			togruti: "pulsian",
			toydarian: "espruar",
			tusken: "semphari",
			"twi'leki": "tuzluca",
			ugnaught: "floki",
			umbaran: "jungleslang",
			utapese: "eltharin",
			verpine: "thassilonian",
			vong: "valmaric",
			voss: "iokharic",
			yevethan: "highdrowic",
			zabraki: "maraseye",
			zygerrian: "floki",
		};
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "basic";
	}
}

export class tormenta20LanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			abyssal: "150% Barazhad",
			auran: "200% OldeThorass",
			common: "130% Thorass",
			celestial: "180% Celestial",
			draconic: "170% Iokharic",
			dwarvish: "120% Dethek",
			giant: "120% MeroiticDemotic",
			gnoll: "150% Kargi",
			elvish: "150% Espruar",
			infernal: "230% Infernal",
			sylvan: "200% OldeEspruar",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			abissal: "abyssal",
			anao: "dwarvish",
			aquan: "auran",
			auran: "auran",
			celestial: "celestial",
			draconico: "draconic",
			elfico: "elvish",
			gigante: "giant",
			gnoll: "gnoll",
			goblin: "gnoll",
			ignan: "auran",
			infernal: "infernal",
			orc: "dwarvish",
			silvestre: "sylvan",
			terran: "auran",
		};
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "comum";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		if (replaceLanguages) {
			CONFIG.T20.idiomas = {};
		}
		this.languages = CONFIG.T20.idiomas;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.system.tracos.idiomas.value) known_languages.add(lang);
		return [known_languages, literate_languages];
	}
}

export class uesrpgLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			cyrodilic: "130% Thorass",
			aldmeri: "150% Espruar",
			ayleidoon: "230% OldeEspruar",
			bosmeri: "200% MageScript",
			daedric: "200% Daedra",
			dovah: "170% DragonAlphabet",
			dunmeri: "150% HighDrowic",
			dwemeris: "120% Dethek",
			falmer: "200% ArCiela",
			jel: "120% Ophidian",
			nordic: "160% NyStormning",
			taagra: "120% JungleSlang",
			yoku: "130% Oriental",
		};
	}

	get originalTongues() {
		return {
			_default: "cyrodilic",
			aldmeri: "aldmeri",
			ayleidoon: "aldmeri",
			bosmeri: "bosmeri",
			daedric: "daedric",
			dovah: "dovah",
			dunmeri: "dunmeri",
			dwemeris: "dwemeris",
			falmer: "falmer",
			jel: "jel",
			nordic: "nordic",
			taagra: "taagra",
			yoku: "yoku",
		};
	}

	get settings() {
		return {};
	}

	getSystemDefaultLanguage() {
		return "cyrodilic";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		if (replaceLanguages) {
			CONFIG.UESRPG.languages = {};
		}
		this.languages = replaceLanguages ? {} : CONFIG.UESRPG.languages;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.items) {
			if (item.type == "language") {
				if (item.system.speak) known_languages.add(item.name.trim().toLowerCase());
				if (item.system.readWrite) literate_languages.add(item.name.trim().toLowerCase());
			}
		}
		return [known_languages, literate_languages];
	}

	conditions(lang) {
		return game.polyglot.literate_languages.has(lang);
	}
}

export class warhammerLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			common: "130% Thorass",
			reikspiel: "230% Infernal",
			druhir: "150% DarkEldar",
			eltharin: "130% Eltharin",
			kislevien: "110% MiroslavNormal",
			norse: "350% ElderFuthark",
			orcish: "150% OrkGlyphs",
			queekish: "130% Skaven",
			slaan: "170% Saurian",
			klinkarhun: "110% Floki",
			romance: "130% Tengwar",
			cathan: "130% Oriental",
		};
	}

	get originalTongues() {
		return {
			_default: "common",
			reikspiel: "reikspiel",
			wastelander: "reikspiel",
			classical: "reikspiel",
			cathan: "cathan",
			tilean: "common",
			estalian: "romance",
			gospodarinyi: "kislevien",
			albion: "norse",
			norse: "norse",
			bretonnian: "romance",
			druhir: "druhir",
			elthárin: "eltharin",
			orcish: "orcish",
			queekish: "queekish",
			slaan: "slaan",
			khazalid: "klinkarhun",
			magick: "eltharin",
		};
	}

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
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		const wfrp4ePack = game.packs.get("wfrp4e-core.skills") || game.packs.get("wfrp4e.basic");
		const wfrp4eItemList = await wfrp4ePack.getIndex();
		let myRegex = new RegExp(game.settings.get("polyglot", "LanguageRegex") + "\\s*\\((.+)\\)", "i");
		for (let item of wfrp4eItemList) {
			const match = item.name.match(myRegex);
			if (match) {
				let lang = match[1].trim();
				let key = lang.toLowerCase();
				langs[key] = lang;
			}
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		let myRegex = new RegExp(game.settings.get("polyglot", "LanguageRegex") + "\\s*\\((.+)\\)", "i");
		for (let item of actor.items) {
			const match = item.name.match(myRegex);
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match) known_languages.add(match[1].trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}
