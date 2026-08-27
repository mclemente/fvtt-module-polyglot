import LanguageProvider from "./templates/Base.js";

export default class pf2eLanguageProvider extends LanguageProvider {
	constructor(id) {
		super(id);
		// This provider is shared between PF2e and SF2e
		if (game.system.id === "pf2e") {
			this.languages = {
				...this.languages,
				"anadi": {"font": "Jungle Slang"},
				"arboreal": {"font": "Olde Espruar"},
				"boggard": {"font": "Semphari"},
				"caligni": {"font": "High Drowic"},
				"cyclops": {"font": "Meroitic Demotic"},
				"destrachan": {"font": "Ar Ciela"},
				"dziriak": {"font": "Pulsian"},
				"erutaki": {"font": "Tuzluca"},
				"garundi": {"font": "Qijomi"},
				"grippli": {"font": "Semphari"},
				"hallit": {"font": "Tengwar"},
				"iruxi": {"font": "Semphari"},
				"jistkan": {"font": "Valmaric"},
				"jyoti": {"font": "Celestial"},
				"kelish": {"font": "Highschool Runes"},
				"kholo": {"font": "Kargi"},
				"mwangi": {"font": "Tengwar"},
				"protean": {"font": "Barazhad"},
				"sakvroth": {"font": "High Drowic"},
				"shoanti": {"font": "Tengwar"},
				"shoony": {"font": "Dethek"},
				"skald": {"font": "Valmaric"},
				"sphinx": {"font": "Reanaarian"},
				"strix": {"font": "Infernal"},
				"sylvan": {"font": "Olde Espruar"},
				"taldane": {"font": "Tengwar"},
				"tengu": {"font": "Oriental"},
				"thassilonian": {"font": "Thassilonian"},
				"tien": {"font": "Oriental"},
				"varisian": {"font": "Tengwar"},
				"vudrani": {"font": "Qijomi"},
				"wildsong": {"font": "Jungle Slang"}
			}
		} else {
			this.languages["pact-common"] = { font: "Tengwar" };
		}
	}

	// Common languages between PF2e and SF2e
	languages = {
		"aklo": {"font": "Ophidian"},
		"alghollthu": {"font": "Ar Ciela"},
		"azlanti": {"font": "Tengwar"},
		"chthonian": {"font": "Barazhad"},
		"daemonic": {"font": "Infernal"},
		"diabolic": {"font": "Infernal"},
		"draconic": {"font": "Iokharic"},
		"dwarven": {"font": "Dethek"},
		"elven": {"font": "Espruar"},
		"empyrean": {"font": "Celestial"},
		"gnomish": {"font": "Dethek"},
		"goblin": {"font": "Kargi"},
		"jotun": {"font": "Meroitic Demotic"},
		"necril": {"font": "High Drowic"},
		"orcish": {"font": "Dethek"},
		"petran": {"font": "Dethek"},
		"pyric": {"font": "Dethek"},
		"requian": {"font": "Reanaarian"},
		"sussuran": {"font": "Olde Thorass"},
		"thalassic": {"font": "Olde Thorass"},
		"utopian": {"font": "Maras Eye"}
	};

	get settings() {
		return {
			replaceLanguages: {
				...game.settings.settings.get("polyglot.replaceLanguages"),
				hint: "POLYGLOT.PF2E.replaceLanguages.hint"
			},
			customLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.customLanguages"),
			},
			defaultLanguage: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.defaultLanguage"),
			},
		};
	}

	init() {
		if (this.replaceLanguages) {
			CONFIG.PF2E.languages = {
				common: "PF2E.Actor.Creature.Language.common"
			};
		}
		Hooks.on("closeHomebrewElements", async (homebrewElements, html) => {
			await game.polyglot.provider.getLanguages();
			await game.settings.set("polyglot", "Languages", game.polyglot.provider.languages);
			game.polyglot.updateUserLanguages();
		});
	}

	async getLanguages() {
		const customSystemLanguages = game.settings.get(game.system.id, "homebrew.languages");
		if (this.replaceLanguages) {
			CONFIG.PF2E.languages = {
				common: "PF2E.Actor.Creature.Language.common"
			};
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		const systemLanguages = foundry.utils.deepClone(CONFIG.PF2E.languages);
		delete systemLanguages.common;
		Object.entries(systemLanguages).forEach(([key, value]) => {
			langs[key] = {
				label: game.i18n.has(value) ? game.i18n.localize(value) : value,
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		});
		customSystemLanguages.filter((lang) => !(lang.id in systemLanguages)).forEach((l) => {
			const key = l.id;
			langs[key] = {
				label: l.value,
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
			if (this.replaceLanguages) CONFIG.PF2E.languages[key] = l.value;
		});
		this.languages = langs;
	}

	loadLanguages() {}

	addLanguage() {}

	removeLanguage() {}

	getSystemDefaultLanguage() {
		return game.settings.get(game.system.id, "homebrew.languageRarities").commonLanguage;
	}

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
		const userDefault = game.user.getFlag("polyglot", "defaultLanguage");
		if (userDefault) {
			getLanguage(userDefault);
		}
		if (this.defaultLanguage === undefined) {
			this.defaultLanguage = this.getSystemDefaultLanguage();
		}
	}

	filterUsers(ownedActors) {
		const filtered = super.filterUsers(ownedActors);
		if (game.actors.party?.members.length) {
			const members = game.actors.party.members.map((a) => a.id);
			const users = filtered.filter((user) => ownedActors.some((actor) => members.includes(actor.id) && actor.testUserPermission(user, "OWNER")));
			return users;
		}
		return filtered;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const languageRarities = game.settings.get(game.system.id, "homebrew.languageRarities");
		const actorLanguages = actor.system?.details?.languages;
		if (actorLanguages) {
			for (let lang of actorLanguages.value) {
				if (lang === "common" && languageRarities.commonLanguage) {
					knownLanguages.add(languageRarities.commonLanguage);
				} else if (lang in CONFIG.PF2E.languages && !languageRarities.unavailable.has(lang)) {
					knownLanguages.add(lang);
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
