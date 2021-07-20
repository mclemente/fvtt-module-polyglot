/**
 * Base class for all language providers.
 * If you want to offer a language provider in your system/module you must derive this class.
 */
export class LanguageProvider {
	constructor(id) {
		this.id = id
		this.alphabets = this.originalAlphabets;
		this.tongues = this.originalTongues;
		this.languages = {};
	}

	get originalAlphabets() {
		return {
			"arciela": "200% ArCiela",
			"aztec": "200% Aztec",
			"barazhad": "200% Barazhad",
			"celestial": "200% Celestial",
			"chinese": "130% ScrapbookChinese",
			"cyrillic": "130% KremlinPremier",
			"daedra": "200% Daedra",
			"darkeldar": "200% DarkEldar",
			"dethek": "200% Dethek",
			"dovah": "170% DragonAlphabet",
			"elderfuthark": "350% ElderFuthark",
			"eltharin": "200% Eltharin",
			"espruar": "150% Espruar",
			"fingeralphabet": "150% FingerAlphabet",
			"floki": "200% Floki",
			"highdrowic": "150% HighDrowic",
			"highschoolrunes": "200% HighschoolRunes",
			"infernal": "230% Infernal",
			"iokharic": "170% Iokharic",
			"jungleslang": "180% JungleSlang",
			"kargi": "150% Kargi",
			"magescript": "200% MageScript",
			"maraseye": "200% MarasEye",
			"meroiticdemotic": "200% MeroiticDemotic",
			"miroslavnormal": "200% MiroslavNormal",
			"nordic": "160% NyStormning",
			"oldeespruar": "200% OldeEspruar",
			"oldethorass": "200% OldeThorass",
			"ophidian": "250% Ophidian",
			"oriental": "130% Oriental",
			"orkglyphs": "200% OrkGlyphs",
			"pulsian": "270% Pulsian",
			"qijomi": "200% Qijomi",
			"reanaarian": "200% Reanaarian",
			"saurian": "200% Saurian",
			"semphari": "200% Semphari",
			"skaven": "200% Skaven",
			"tengwar": "200% Tengwar",
			"thassilonian": "200% Thassilonian",
			"thorass": "200% Thorass",
			"tuzluca": "200% Tuzluca",
			"valmaric": "200% Valmaric"
		};
	}
	get originalTongues() {
		return { "_default": "thorass" };
	}
	getSystemDefaultLanguage() {
		const keys = Object.keys(this.languages);
		if (keys.includes("common")) return "common";
		else return this.languages[0] || Object.keys(this.languages)[0] || "";
	}
	getDefaultLanguage() {
		const defaultLang = game.settings.get("polyglot", "defaultLanguage");
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		if (defaultLang) {
			if (this.languages[defaultLang.toLowerCase()]) this.defaultLanguage = defaultLang.toLowerCase();
			const inverted = invertObject(this.languages);
			if (inverted[defaultLang]) this.defaultLanguage = inverted[defaultLang];
		}
		else if (!replaceLanguages) {
			this.defaultLanguage = this.getSystemDefaultLanguage();
		}
	}

	/**
	 * Loads everything that can't be loaded on the constructor due to async/await.
	 */
	async setup() {
		await this.getLanguages();
		this.loadAlphabet();
		this.loadTongues();
		this.getDefaultLanguage();
	}

	/**
	 * Even though the base method doesn't have an await, some providers might need it to look into compendiums.
	 */
	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		if (CONFIG[game.system.id.toUpperCase()]?.languages) {
			if (replaceLanguages)
				CONFIG[game.system.id.toUpperCase()].languages = {};
			this.languages = CONFIG[game.system.id.toUpperCase()].languages;
		}
	}
	loadAlphabet() {
		this.alphabets = this.originalAlphabets;
		if (game.settings.get("polyglot", "enableAllFonts")) {
			const defaultAlphabets = new LanguageProvider().originalAlphabets;
			const invertedThis = invertObject(this.alphabets);
			for (let alp in defaultAlphabets) {
				if (!invertedThis[defaultAlphabets[alp]]) this.alphabets[alp] = defaultAlphabets[alp];
			}
		}
	}
	loadTongues() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const customLanguages = game.settings.get("polyglot", "customLanguages");
		this.tongues = !replaceLanguages ? this.originalTongues : {};
		if (customLanguages) {
			for (let lang of customLanguages.split(/[,;]/)) {
				lang = lang.trim();
				const key = lang.toLowerCase().replace(/ \'/g, "_");
				this.languages[key] = lang;
				if (!(key in this.tongues)) {
					this.tongues[key] = this.tongues["_default"];
				}
			}
		}
	}
	/**
	 * Called when Custom Languages setting is changed.
	 */
	reloadLanguages() {
		let langSettings = game.settings.get("polyglot", "Languages");
		for (let lang in langSettings) {
			if (!(lang in this.tongues)) {
				delete langSettings[lang];
			}
		}
		for (let lang in this.tongues) {
			if (!(lang in langSettings)) {
				langSettings[lang] = this.tongues["_default"];
			}
		}
		game.settings.set("polyglot", "Languages", langSettings);
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.data.data.traits.languages.value)
			known_languages.add(lang)
		if (actor.data.data.traits.languages.custom) {
			for (let lang of actor.data.data.traits.languages.custom.split(/[,;]/))
				known_languages.add(lang.trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}

	/**
	 * Returns the set with the languages to be shown on the journal.
	 * @param {} polyglot
	 * @param {string} lang
	 */
	conditions(polyglot, lang) {
		return polyglot.known_languages.has(lang);
	}
}

export class ariaLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"kohestien":"130% Tuzluca",
			"aqab": "130% ArCiela",
			"staum": "130% Floki",
			"osmanlien": "130% Eltharin",
			"mon": "130% Valmaric",
			"nok": "130% DarkEldar",
			"carredass": "130% Celestial",
			"blanc": "130% OrkGlyphs",
			"knigien": "130% Tengwar",
			"esperan": "130% Thassilonian",
			"alta": "130% Espruar"
		};
	}
	get originalTongues() {
		return {
			"_default": "common",
			"kohestien": "kohestien",
			"aqab": "aqab",
			"staum": "staum",
			"osmanlien": "osmanlien",
			"mon": "mon",
			"nok": "nok",
			"carredass": "carredass",
			"blanc": "blanc",
			"knigien": "knigien",
			"esperan": "esperan",
			"altabiancais": "alta",
			"altanegrais": "alta"
		};
	}
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		known_languages.add(game.i18n.localize("ARIA.languages.Common"));
		for (let lang of actor.data.items) {
			if (lang.data.data.language)
				known_languages.add(lang.name.toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class coc7LanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.data.items) {
			const match =
				item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOwn") + '\\s*\\((.+)\\)', 'i')
				|| item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageAny") + '\\s*\\((.+)\\)', 'i')
				|| item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOther") + '\\s*\\((.+)\\)', 'i');
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match)
				known_languages.add(match[1].trim().toLowerCase());
			else if ([game.i18n.localize("POLYGLOT.COC7.LanguageSpec"), game.i18n.localize("POLYGLOT.COC7.LanguageOwn"), game.i18n.localize("POLYGLOT.COC7.LanguageAny"), game.i18n.localize("POLYGLOT.COC7.LanguageOther"), game.i18n.localize("CoC7.language"), "Language", "Language (Own)", "Language (Other)"].includes(item.data.specialization))
				known_languages.add(item.name.trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class d35eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"auran":"200% OldeThorass",
			"celestial": "180% Celestial",
			"outwordly": "200% ArCiela",
			"draconic": "170% Iokharic",
			"dwarvish": "120% Dethek",
			"druidic": "120% JungleSlang",
			"gnoll": "150% Kargi",
			"elvish": "150% Espruar",
			"infernal": "230% Infernal",
			"sylvan":"200% OldeEspruar",
			"tirsu": "250% Pulsian",
			"drowic": "150% HighDrowic",
			
			"serpent":"120% Ophidian"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"aarakocra": "auran",
			"abyssal": "infernal",
			"aquan": "dwarvish",
			"auran": "dwarvish",
			"celestial": "celestial",
			"deep": "outwordly",
			"draconic": "draconic",
			"druidic": "druidic",
			"dwarven": "dwarvish",
			"elven": "elvish",
			"giant": "dwarvish",
			"gith": "tirsu",
			"gnoll": "gnoll",
			"gnome": "dwarvish",
			"goblin": "dwarvish",
			"halfling": "common",
			"ignan": "dwarvish",
			"infernal": "infernal",
			"orc": "dwarvish",
			"primordial": "dwarvish",
			"sylvan": "sylvan",
			"terran": "dwarvish",
			"cant": "common",
			"treant": "sylvan",
			"undercommon": "drowic"
		};
	}
}

export class darkHeresyLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"reikspiel": "230% Infernal",
			"druhir": "150% DarkEldar",
			"eltharin": "130% Eltharin",
			"kislevien": "110% MiroslavNormal",
			"norse": "350% ElderFuthark",
			"orcish": "150% OrkGlyphs",
			"queekish": "130% Skaven",
			"slaan": "170% Saurian",
			"klinkarhun": "110% Floki",
			"romance": "130% Tengwar",
			"cathan": "130% Oriental"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"chapterRunes": "",
			"chaosMarks": "",
			"eldar": "",
			"highGothic": "reikspiel",
			"imperialCodes": "",
			"lowGothic": "reikspiel",
			"mercenary": "",
			"necrontyr": "",
			"ork": "orcish",
			"technaLingua": "",
			"tau": "",
			"underworld": "",
			"xenosMarkings": ""
		};
	}

	getSystemDefaultLanguage() {
		return "lowGothic";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		const specialities = {
			"chapterRunes": "Chapter Runes",
			"chaosMarks": "Chaos Marks",
			"eldar": "Eldar",
			"highGothic": "High Gothic",
			"imperialCodes": "Imperial Codes",
			"lowGothic": "Low Gothic",
			"mercenary": "Mercenary",
			"necrontyr": "Necrontyr",
			"ork": "Ork",
			"tau": "Tau",
			"technaLingua": "Techna-Lingua",
			"underworld": "Underworld",
			"xenosMarkings": "Xenos Markings"
		};
		for (let item in specialities) {
			langs[item] = specialities[item];
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang in actor.data.data.skills.linguistics.specialities) {
			if (actor.data.data.skills.linguistics.specialities[lang]["advance"] >= 0)
				known_languages.add(lang);
		}
		return [known_languages, literate_languages];
	}
}

export class dccLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"draconic": "170% Iokharic",
			"dwarvish": "120% Dethek",
			"elvish": "150% Espruar",
			"gnoll": "150% Kargi"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"draconic": "draconic",
			"dwarvish": "dwarvish",
			"elvish": "elvish",
			"giant": "dwarvish",
			"gnoll": "gnoll",
			"goblin": "dwarvish",
			"halfling": "common",
			"orc": "dwarvish",
			"cant": "common"
		};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		for (let item in CONFIG.DCC.languages) {
			langs[item] = game.i18n.localize(CONFIG.DCC.languages[item]);
		}
		this.languages =  replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.data.data.details.languages.split(/[,;]/))
			known_languages.add(lang.trim().toLowerCase());
		return [known_languages, literate_languages];
	}
}

export class demonlordLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"elemental": "150% HighDrowic",
			"trollish": "200% ArCiela",
			"dwarvish": "120% Dethek",
			"woad": "120% JungleSlang",
			"elvish": "150% Espruar",
			"infernal": "250% Infernal",
			"secret": "200% Thassilonian",
			"balgrennish": "150% Tengwar",
			"exotic": "200% Barazhad"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "exotic",
			"Common Tongue": "common",
			"Dark Speech": "infernal",
			"High Archaic": "common",
			"Elvish": "elvish",
			"Dwarvish": "dwarvish",
			"Secret Language": "secret",
			"Trollish": "trollish",
			"Centauri": "elemental",
			"Gnomish": "elemental",
			"Amrin": "common",
			"Balgrennish": "balgrennish",
			"Bhali": "balgrennish",
			"Edene": "common",
			"Erath": "common",
			"Grennish": "balgrennish",
			"Kalasan": "common",
			"Woad": "woad",
			"Sylphen": "elemental",
			"Molekin": "exotic",
			"Naga": "exotic",
			"Yerath": "exotic"
		};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		const demonlordPack = game.packs.get("demonlord.languages");
		const demonlordItemList = await demonlordPack.getIndex();
		for (let item of demonlordItemList) {
			langs[item.name] = game.i18n.localize(item.name);
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.data.items) {
			if (item.type === "language") {
				if (item.data.speak)
					known_languages.add(item.name);
				if (item.data.read)
					literate_languages.add(item.name);
			}
		}
		return [known_languages, literate_languages];
	}
}

export class dnd5eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"auran":"200% OldeThorass",
			"celestial": "180% Celestial",
			"outwordly": "200% ArCiela",
			"draconic": "170% Iokharic",
			"dwarvish": "120% Dethek",
			"druidic": "120% JungleSlang",
			"gnoll": "150% Kargi",
			"elvish": "150% Espruar",
			"infernal": "230% Infernal",
			"sylvan":"200% OldeEspruar",
			"tirsu": "250% Pulsian",
			"drowic": "150% HighDrowic",
			"serpent":"120% Ophidian"
		}
	}
	get originalTongues() {
		return {
			"_default": "common",
			"aarakocra": "auran",
			"abyssal": "infernal",
			"aquan": "dwarvish",
			"auran": "dwarvish",
			"celestial": "celestial",
			"deep": "outwordly",
			"draconic": "draconic",
			"druidic": "druidic",
			"dwarvish": "dwarvish",
			"elvish": "elvish",
			"giant": "dwarvish",
			"gith": "tirsu",
			"gnoll": "gnoll",
			"gnomish": "dwarvish",
			"goblin": "dwarvish",
			"halfling": "common",
			"ignan": "dwarvish",
			"infernal": "infernal",
			"orc": "dwarvish",
			"primordial": "dwarvish",
			"sylvan": "sylvan",
			"terran": "dwarvish",
			"cant": "common",
			"undercommon": "drowic"
		};
	}
}

export class dsa5LanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"Altes Alaani": "150% HighschoolRunes",
			"Amulashtra": "150% Qijomi",
			"Angram-Bilderschrift": "150% Skaven",
			"Arkanil": "170% ArCiela",
			"Chrmk": "150% Iokharic",
			"Chuchas": "150% Kargi",
			"Protozelemja": "150% Kargi",
			"Yash-Hualay-Glyphen": "150% Kargi",
			"Drakhard-Zinken": "150% Celestial",
			"Geheiligte Glyphen von Unau": "150% HighDrowic",
			"Gimaril-Glyphen": "150% Semphari",
			"Hjaldingsche Runen": "140% OldeThorass",
			"Imperiale Zeichen": "160% Infernal",
			"Isdira- und Asdharia-Zeichen": "150% Tengwar",
			"Kusliker Zeichen": "150% MiroslavNormal",
			"Nanduria-Zeichen": "150% Espruar",
			"Rogolan-Runen": "350% ElderFuthark",
			"Thorwalsche Runen": "150% Floki",
			"Trollische Raumbildschrift": "150% Eltharin",
			"Tulamidya-Zeichen": "150% Valmaric",
			"Ur-Tulamidya-Zeichen": "150% OldeEspruar",
			"Zhayad-Zeichen": "200% Pulsian",
			"unbekannt": "150% Ophidian",
			"Atak": "150% FingerAlphabet",
			"Fjarningsch": "150% Dethek",
			"Goblinisch": "150% OrkGlyphs",
			"Mohisch": "150% JungleSlang",
			"Nujuka": "150% Reanaarian",
			"Ogrisch": "150% OrkGlyphs",
			"Oloarkh": "150% OrkGlyphs",
			"Ologhaijan": "150% OrkGlyphs",
			"Rabensprache": "150% Valmaric"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "unbekannt",
			"Altes Alaani": "Altes Alaani",
			"Amulashtra": "Amulashtra",
			"Angram-Bilderschrift": "Angram-Bilderschrift",
			"Arkanil": "Arkanil",
			"Chrmk": "Chrmk",
			"Chuchas": "Chuchas",
			"Protozelemja": "Protozelemja",
			"Yash-Hualay-Glyphen": "Yash-Hualay-Glyphen",
			"Drakhard-Zinken": "Drakhard-Zinken",
			"Geheiligte Glyphen von Unau": "Geheiligte Glyphen von Unau",
			"Gimaril-Glyphen": "Gimaril-Glyphen",
			"Hjaldingsche Runen": "Hjaldingsche Runen",
			"Imperiale Zeichen": "Imperiale Zeichen",
			"Isdira- und Asdharia-Zeichen": "Isdira- und Asdharia-Zeichen",
			"Kusliker Zeichen": "Kusliker Zeichen",
			"Nanduria-Zeichen": "Nanduria-Zeichen",
			"Rogolan-Runen": "Rogolan-Runen",
			"Thorwalsche Runen": "Thorwalsche Runen",
			"Trollische Raumbildschrift": "Trollische Raumbildschrift",
			"Tulamidya-Zeichen": "Tulamidya-Zeichen",
			"Ur-Tulamidya-Zeichen": "Ur-Tulamidya-Zeichen",
			"Zhayad-Zeichen": "Zhayad-Zeichen",
			"Alaani": "Kusliker Zeichen",
			"Angram": "Angram-Bilderschrift",
			"Asdharia": "Isdira- und Asdharia-Zeichen",
			"Atak": "Atak",
			"Aureliani": "Imperiale Zeichen",
			"Bosparano": "Kusliker Zeichen",
			"Fjarningsch": "Fjarningsch",
			"Garethi": "Kusliker Zeichen",
			"Goblinisch": "Goblinisch",
			"Isdira": "Isdira- und Asdharia-Zeichen",
			"Mohisch": "Mohisch",
			"Nujuka": "Nujuka",
			"Ogrisch": "Ogrisch",
			"Oloarkh": "Oloarkh",
			"Ologhaijan": "Ologhaijan",
			"Rabensprache": "Rabensprache",
			"Rogolan": "Rogolan-Runen",
			"Rssahh": "Chrmk",
			"Ruuz": "Tulamidya-Zeichen",
			"Saga-Thorwalsch": "Hjaldingsche Runen",
			"Tahaya": "Mohisch",
			"Thorwalsch": "Thorwalsche Runen",
			"Trollisch": "Trollische Raumbildschrift",
			"Tulamidya": "Tulamidya-Zeichen",
			"Ur-Tulamidya": "Ur-Tulamidya-Zeichen",
			"Zelemja": "Chrmk",
			"Zhayad": "Zhayad-Zeichen",
			"Zyklopäisch": "Kusliker Zeichen"
		};
	}

	getSystemDefaultLanguage() {
		return "Garethi";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		if (game.modules.get("dsa5-core")) {
			const dsa5Pack = game.packs.get("dsa5-core.corespecialabilites");
			const dsa5ItemList = await dsa5Pack.getIndex();
			for (let item of dsa5ItemList) {
				let myRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + '\\s*\\((.+)\\)', 'i');
				let match = item.name.match(myRegex);
				if (match) {
					let key = match[1].trim();
					langs[key] = key;
				}
				else {
					myRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + '\\s*\\((.+)\\)', 'i');
					match = item.name.match(myRegex);
					if (match) {
						let key = match[1].trim();
						langs[key] = key;
					}
				}
			}
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.data.items) {
			if (item.data.data.category?.value === "language") {
				let myRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + '\\s*\\((.+)\\)', 'i');
				let match = item.name.match(myRegex);
				if (match) {
					known_languages.add(match[1].trim());
				}
				else {
					myRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + '\\s*\\((.+)\\)', 'i');
					match = item.name.match(myRegex);
					if (match) {
						literate_languages.add(match[1].trim());
					}
				}
			}
		}
		return [known_languages, literate_languages];
	}
}

export class kryxrpgLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"auran":"200% OldeThorass",
			"celestial": "180% Celestial",
			"outwordly": "200% ArCiela",
			"draconic": "170% Iokharic",
			"dwarvish": "120% Dethek",
			"druidic": "120% JungleSlang",
			"gnoll": "150% Kargi",
			"elvish": "150% Espruar",
			"infernal": "230% Infernal",
			"sylvan":"200% OldeEspruar",
			"tirsu": "250% Pulsian",
			"drowic": "150% HighDrowic",
			
			"serpent":"120% Ophidian"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"aarakocra": "auran",
			"abyssal": "infernal",
			"aklo": "serpent",
			"aquan": "dwarvish",
			"auran": "dwarvish",
			"celestial": "celestial",
			"deep": "outwordly",
			"draconic": "draconic",
			"druidic": "druidic",
			"dwarvish": "dwarvish",
			"elvish": "elvish",
			"jotun": "dwarvish",
			"gith": "tirsu",
			"gnoll": "gnoll",
			"gnomish": "dwarvish",
			"goblin": "dwarvish",
			"halfling": "common",
			"ignan": "dwarvish",
			"infernal": "infernal",
			"orcish": "dwarvish",
			"primordial": "dwarvish",
			"sylvan": "sylvan",
			"terran": "dwarvish",
			"cant": "common",
			"undercommon": "drowic"
		};
	}
}

export class oseLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"lawful": "180% Celestial",
			"chaotic": "150% Barazhad",
			"neutral": "230% Infernal",
			"doppelganger": "250% Pulsian",
			"dwarvish": "120% Dethek",
			"draconic": "170% Iokharic",
			"gargoyle": "150% HighDrowic",
			"gnoll": "150% Kargi",
			"gnomish": "120% Tengwar",
			"harpy": "200% OldeThorass",
			"elvish": "150% Espruar",
			"ogre": "120% MeroiticDemotic",
			"sylvan": "200% OldeEspruar"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"1": "lawful",
			"2": "chaotic",
			"3": "neutral",
			"4": "dwarvish",
			"5": "doppelganger",
			"6": "draconic",
			"7": "dwarvish",
			"8": "elvish",
			"9": "gargoyle",
			"10": "gnoll",
			"11": "gnomish",
			"12": "dwarvish",
			"14": "harpy",
			"15": "dwarvish",
			"16": "draconic",
			"17": "draconic",
			"18": "gargoyle",
			"19": "sylvan",
			"20": "ogre",
			"21": "dwarvish",
			"22": "sylvan"
		};
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		this.languages = replaceLanguages ? [] : Object.fromEntries(CONFIG.OSE.languages.map(l => [l, l]));
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang of actor.data.data.languages.value)
			known_languages.add(lang)
		return [known_languages, literate_languages];
	}
}

export class pf1LanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common":"130% Thorass",
			"abyssal":"150% Barazhad",
			"auran":"200% OldeThorass",
			"azlanti":"120% Tengwar",
			"boggard":"120% Semphari",
			"celestial":"180% Celestial",
			"outwordly":"200% ArCiela",
			"draconic":"170% Iokharic",
			"dwarvish":"120% Dethek",
			"drowic":"150% HighDrowic",
			"dziriak":"250% Pulsian",
			"giant":"120% MeroiticDemotic",
			"gnoll":"150% Kargi",
			"elvish":"150% Espruar",
			"erutaki":"120% Tuzluca",
			"garundi":"120% Qijomi",
			"infernal":"230% Infernal",
			"jistka":"120% Valmaric",
			"jungle":"120% JungleSlang",
			"kelish":"170% HighschoolRunes",
			"oriental":"130% Oriental",
			"requian":"150% Reanaarian",
			"serpent":"120% Ophidian",
			"signs":"170% FingerAlphabet",
			"sylvan":"200% OldeEspruar",
			"thassilonian":"150% Thassilonian",
			"utopian":"140% MarasEye"
		}
	}
	get originalTongues() {
		return {
			"_default": "common",
			"aboleth": "outwordly",
			"abyssal": "abyssal",
			"aklo": "serpent",
			"algollthu": "outwordly",
			"anadi": "jungle",
			"aquan": "auran",
			"arboreal": "sylvan",
			"auran": "auran",
			"azlanti": "azlanti",
			"boggard": "boggard",
			"caligni": "drowic",
			"celestial": "celestial",
			"cyclops": "giant",
			"daemonic": "infernal",
			"dark": "drowic",
			"destrachan": "outwordly",
			"draconic": "draconic",
			"drowsign": "signs",
			"druidic": "jungle",
			"dwarven": "dwarvish",
			"dziriak": "dziriak",
			"elven": "elvish",
			"erutaki": "erutaki",
			"garundi": "garundi",
			"giant": "giant",
			"gnoll": "gnoll",
			"gnome": "dwarvish",
			"gnomish": "dwarvish",
			"goblin": "gnoll",
			"grippli": "boggard",
			"hallit": "azlanti",
			"ignan": "dwarvish",
			"iruxi": "boggard",
			"jistkan": "jistka",
			"jotun": "giant",
			"jyoti": "celestial",
			"infernal": "infernal",
			"kelish": "kelish",
			"mwangi": "azlanti",
			"necril": "drowic",
			"orc": "dwarvish",
			"orcish": "dwarvish",
			"polyglot": "azlanti",
			"protean": "abyssal",
			"requian": "requian",
			"shoanti": "azlanti",
			"skald": "jitska",
			"sphinx": "requian",
			"strix": "infernal",
			"sylvan": "sylvan",
			"shoony": "dwarvish",
			"taldane": "azlanti",
			"tengu": "oriental",
			"terran": "dwarvish",
			"thassilonian": "thassilonian",
			"tien": "oriental",
			"treant": "sylvan",
			"undercommon": "drowic",
			"utopian": "utopian",
			"varisian": "azlanti",
			"vegepygmy": "gnoll",
			"vudrani": "garundi"
		}
	}
}

export class pf2eLanguageProvider extends pf1LanguageProvider {
	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		if (replaceLanguages) {
			CONFIG.PF2E.languages = {};
		}
		else {
			for (let lang in CONFIG.PF2E.languages) {
				langs[lang] = game.i18n.localize(CONFIG.PF2E.languages[lang]);
			}
		}
		this.languages = langs;
	}
	loadTongues() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const customLanguages = game.settings.get("polyglot", "customLanguages");
		this.tongues = !replaceLanguages ? this.originalTongues : {};
		if (customLanguages) {
			for (let lang of customLanguages.split(/[,;]/)) {
				lang = lang.trim();
				const key = lang.toLowerCase().replace(/ \'/g, "_");
				CONFIG.PF2E.languages[key] = lang;
				this.languages[key] = lang;
				if (!(key in this.tongues)) {
					this.tongues[key] = this.tongues["_default"];
				}
			}
		}
	}
}

export class sfrpgLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common":"130% Thorass",
			"abyssal":"150% Barazhad",
			"auran":"200% OldeThorass",
			"azlanti":"120% Tengwar",
			"boggard":"120% Semphari",
			"celestial":"180% Celestial",
			"outwordly":"200% ArCiela",
			"draconic":"170% Iokharic",
			"dwarvish":"120% Dethek",
			"drowic":"150% HighDrowic",
			"dziriak":"250% Pulsian",
			"giant":"120% MeroiticDemotic",
			"gnoll":"150% Kargi",
			"elvish":"150% Espruar",
			"erutaki":"120% Tuzluca",
			"garundi":"120% Qijomi",
			"infernal":"230% Infernal",
			"jistka":"120% Valmaric",
			"jungle":"120% JungleSlang",
			"kelish":"170% HighschoolRunes",
			"oriental":"130% Oriental",
			"requian":"150% Reanaarian",
			"serpent":"120% Ophidian",
			"signs":"170% FingerAlphabet",
			"sylvan":"150% OldeEspruar",
			"thassilonian":"150% Thassilonian",
			"utopian":"140% MarasEye"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"abyssal": "abyssal",
			"akito": "common",
			"aklo": "serpent",
			"arkanen": "common",
			"aquan": "auran",
			"auran": "auran",
			"azlanti": "azlanti",
			"celestial": "celestial",
			"draconic": "draconic",
			"drow": "drowic",
			"dwarven": "dwarvish",
			"elven": "elvish",
			"gnome": "dwarvish",
			"goblin": "gnoll",
			"halfling": "common",
			"ignan": "dwarvish",
			"infernal": "infernal",
			"kalo": "common",	
			"kasatha": "common",
			"Nchaki": "common",
			"orc": "dwarvish",
			"sarcesian": "common",
			"shirren": "common",
			"shobhad": "common",	
			"terran": "auran",
			"triaxian": "common",
			"vercite": "common",
			"vesk": "common",
			"ysoki": "common"
		};
	}
}

export class shadowrun5eLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"aztec": "200% Aztec",
			"chinese": "130% ScrapbookChinese",
			"common": "130% Thorass",
			"cyrillic": "130% KremlinPremier",
			"elvish": "150% Espruar",
			"orcish": "150% OrkGlyphs",
			"oriental":"130% Oriental"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"cityspeak": "common",
			"spanish": "common",
			"lakota": "common",
			"dakota": "common",
			"navajo": "common",
			"russian": "cyrillic",
			"french": "common",
			"italian": "common",
			"german": "common",
			"aztlaner": "aztec",
			"sperethiel": "elvish",
			"orzet": "orcish",
			"english": "common",
			"japanese": "oriental",
			"mandarin": "chinese"
		};
	}
	
	getSystemDefaultLanguage() {
		return "cityspeak";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		const sr5eLanguages = {
			"cityspeak": "Cityspeak",
			"spanish": "Spanish",
			"lakota": "Lakota",
			"dakota": "Dakota",
			"navajo": "Navajo",
			"russian": "Russian",
			"french": "French",
			"italian": "Italian",
			"german": "German",
			"aztlaner": "Aztlaner Spanish",
			"sperethiel": "Sperethiel",
			"orzet": "Or'zet",
			"english": "English",
			"japanese": "Japanese",
			"mandarin": "Mandarin"
		}
		for (let item in sr5eLanguages) {
			langs[item] = sr5eLanguages[item];
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let lang in actor.data.data.skills.language.value)
			known_languages.add(actor.data.data.skills.language.value[lang].name.toLowerCase())
		return [known_languages, literate_languages];
	}
}

export class swadeLanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.data.items) {
			const name = item?.flags?.babele?.originalName || item.name;
			const match = name.match(/Language \((.+)\)/i);
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match)
				known_languages.add(match[1].trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class sw5eLanguageProvider extends LanguageProvider {
	get originalTongues() {
		return {
			"_default": "celestial",
			"abyssin": "barazhad",
			"aleena": "jungleslang",
			"antarian": "arciela",
			"anzellan": "valmaric",
			"aqualish": "floki",
			"arconese": "orkglyphs",
			"ardennian": "thorass",
			"arkanian": "celestial",
			"balosur": "arciela",
			"barabel": "darkeldar",
			"basic": "celestial",
			"besalisk": "barazhad",
			"binary": "celestial",
			"bith": "skaven",
			"bocce": "tuzluca",
			"bothese": "infernal",
			"catharese": "espruar",
			"cerean": "oldeespruar",
			"chadra-fan": "infernal",
			"chagri": "ophidian",
			"cheunh": "arciela",
			"chevin": "eltharin",
			"chironan": "saurian",
			"clawdite": "reanaarian",
			"codruese": "meroiticdemotic",
			"colicoid": "thassilonian",
			"dashadi": "iokharic",
			"defel": "darkeldar",
			"devaronese": "iokharic",
			"dosh": "iokharic",
			"draethos": "pulsian",
			"durese": "reanaarian",
			"dug": "qijomi",
			"ewokese": "skaven",
			"falleen": "tengwar",
			"felucianese": "skaven",
			"gamorrese": "highschoolrunes",
			"gand": "reanaarian",
			"geonosian": "maraseye",
			"givin": "highdrowic",
			"gran": "qijomi",
			"gungan": "highschoolrunes",
			"hapan": "valmaric",
			"harchese": "thassilonian",
			"herglese": "ophidian",
			"honoghran": "tuzluca",
			"huttese": "thassilonian",
			"iktotchese": "iokharic",
			"ithorese": "dethek",
			"jawaese": "valmaric",
			"kaleesh": "infernal",
			"kaminoan": "arciela",
			"karkaran": "ophidian",
			"keldor": "meroiticdemotic",
			"kharan": "arciela",
			"killik": "thassilonian",
			"klatooinian": "thassilonian",
			"kubazian": "oldethorass",
			"kushiban": "thorass",
			"kyuzo": "barazhad",
			"lannik": "semphari",
			"lasat": "floki",
			"lowickese": "qijomi",
			"lurmese": "jungleslang",
			"mandoa": "kargi",
			"miralukese": "miroslavnormal",
			"mirialan": "miroslavnormal",
			"moncal": "darkeldar",
			"mustafarian": "orkglyphs",
			"muun": "tengwar",
			"nautila": "ophidian",
			"ortolan": "thorass",
			"pakpak": "oldethorass",
			"pyke": "meroiticdemotic",
			"quarrenese": "ophidian",
			"rakata": "iokharic",
			"rattataki": "infernal",
			"rishii": "maraseye",
			"rodese": "meroiticdemotic",
			"ryn": "espruar",
			"selkatha": "ophidian",
			"semblan": "fingeralphabet",
			"shistavanen": "pulsian",
			"shyriiwook": "oldeespruar",
			"sith": "highdrowic",
			"squibbian": "valmaric",
			"sriluurian": "jungleslang",
			"ssi-ruuvi": "maraseye",
			"sullustese": "highschoolrunes",
			"talzzi": "oldethorass",
			"tarasinese": "oldeespruar",
			"thisspiasian": "arciela",
			"togorese": "floki",
			"togruti": "pulsian",
			"toydarian": "espruar",
			"tusken": "semphari",
			"twi'leki": "tuzluca",
			"ugnaught": "floki",
			"umbaran": "jungleslang",
			"utapese": "eltharin",
			"verpine": "thassilonian",
			"vong": "valmaric",
			"voss": "iokharic",
			"yevethan": "highdrowic",
			"zabraki": "maraseye",
			"zygerrian": "floki"
		};
	}

	getSystemDefaultLanguage() {
		return "basic";
	}
}

export class tormenta20LanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"abyssal":"150% Barazhad",
			"auran":"200% OldeThorass",
			"common": "130% Thorass",
			"celestial": "180% Celestial",
			"draconic": "170% Iokharic",
			"dwarvish": "120% Dethek",
			"giant":"120% MeroiticDemotic",
			"gnoll": "150% Kargi",
			"elvish": "150% Espruar",
			"infernal": "230% Infernal",
			"sylvan":"200% OldeEspruar"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "common",
			"abissal": "abyssal",
			"anao": "dwarvish",
			"aquan": "auran",
			"auran": "auran",
			"celestial": "celestial",
			"draconico": "draconic",
			"elfico": "elvish",
			"gigante": "giant",
			"gnoll": "gnoll",
			"goblin": "gnoll",
			"ignan": "auran",
			"infernal": "infernal",
			"orc": "dwarvish",
			"silvestre": "sylvan",
			"terran": "auran"
		};
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
		for (let lang of actor.data.data.detalhes.idiomas.value)
			known_languages.add(lang)
		return [known_languages, literate_languages];
	}
}

export class uesrpgLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"cyrodilic": "130% Thorass",
			"aldmeri": "150% Espruar",
			"ayleidoon": "230% OldeEspruar",
			"bosmeri": "200% MageScript",
			"daedric": "200% Daedra",
			"dovah": "170% DragonAlphabet",
			"dunmeri": "150% HighDrowic",
			"dwemeris": "120% Dethek",
			"falmer": "200% ArCiela",
			"jel": "120% Ophidian",
			"nordic": "160% NyStormning",
			"taagra": "120% JungleSlang",
			"yoku": "130% Oriental"
		};
	}
	
	get originalTongues() {
		return {
			"_default": "cyrodilic",
			"aldmeri": "aldmeri",
			"ayleidoon": "aldmeri",
			"bosmeri": "bosmeri",
			"daedric": "daedric",
			"dovah": "dovah",
			"dunmeri": "dunmeri",
			"dwemeris": "dwemeris",
			"falmer": "falmer",
			"jel": "jel",
			"nordic": "nordic",
			"taagra": "taagra",
			"yoku": "yoku"
		};
	}

	getSystemDefaultLanguage() {
		return "cyrodilic";
	}

	async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		const uesrpgLanguages = {
			"aldmeri": "Aldmeri",
			"ayleidoon": "Ayleidoon",
			"bosmeri": "Bosmeri",
			"cyrodilic": "Cyrodilic",
			"daedric": "Daedric",
			"dovah": "Dovah",
			"dunmeri": "Dunmeri",
			"dwemeris": "Dwemeris",
			"falmer": "Falmer",
			"jel": "Jel",
			"nordic": "Nordic",
			"taagra": "Ta'Agra",
			"yoku": "Yoku"
		};
		for (let item in uesrpgLanguages) {
			langs[item] = uesrpgLanguages[item];
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.data.items) {
			let myRegex = new RegExp(game.i18n.localize("POLYGLOT.UESRPG.Language") + '\\s*\\((.+)\\)', 'i');
			const match = item.name.match(myRegex);
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match)
				known_languages.add(match[1].trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}

export class warhammerLanguageProvider extends LanguageProvider {
	get originalAlphabets() {
		return {
			"common": "130% Thorass",
			"reikspiel": "230% Infernal",
			"druhir": "150% DarkEldar",
			"eltharin": "130% Eltharin",
			"kislevien": "110% MiroslavNormal",
			"norse": "350% ElderFuthark",
			"orcish": "150% OrkGlyphs",
			"queekish": "130% Skaven",
			"slaan": "170% Saurian",
			"klinkarhun": "110% Floki",
			"romance": "130% Tengwar",
			"cathan": "130% Oriental"
		};
	}

	get originalTongues() {
		return {
			"_default": "common",
			"reikspiel": "reikspiel",
			"Wastelander": "reikspiel",
			"Classical": "reikspiel",
			"Cathan": "cathan",
			"Tilean": "common",
			"Estalian": "romance",
			"Gospodarinyi": "kislevien",
			"Albion": "norse",
			"Norse": "norse",
			"Bretonnian": "romance",
			"Druhir": "druhir",
			"Elthárin": "eltharin",
			"Orcish": "orcish",
			"Queekish": "queekish",
			"Slaan": "slaan",
			"Khazalid": "klinkarhun",
			"Magick": "eltharin"
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
		for (let item of wfrp4eItemList) {
			let myRegex = new RegExp(game.i18n.localize("POLYGLOT.WFRP4E.LanguageSkills") + '\\s*\\((.+)\\)', 'i');
			const match = item.name.match(myRegex);
			if (match) {
				let key = match[1].trim().toLowerCase();
				langs[key] = key;
			}
		}
		this.languages = replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();
		for (let item of actor.data.items) {
			let myRegex = new RegExp(game.i18n.localize("POLYGLOT.WFRP4E.LanguageSkills") + '\\s*\\((.+)\\)', 'i');
			const match = item.name.match(myRegex);
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match)
				known_languages.add(match[1].trim().toLowerCase());
		}
		return [known_languages, literate_languages];
	}
}
