import LanguageProvider from "./templates/Base.js";

export default class pf2eLanguageProvider extends LanguageProvider {
	languages = {
		chthonian: {
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
		empyrean: {
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
		wildsong: {
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
		kholo: {
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
		diabolic: {
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
		petran: {
			font: "Dethek",
		},
		thassilonian: {
			font: "Thassilonian",
		},
		tien: {
			font: "Oriental",
		},
		sakvroth: {
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

	get settings() {
		return {
			replaceLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.replaceLanguages"),
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

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		const systemLanguages = foundry.utils.deepClone(CONFIG.PF2E.languages);
		delete systemLanguages.common;
		Object.keys(systemLanguages).forEach((key) => {
			langs[key] = {
				label: game.i18n.localize(`PF2E.Actor.Creature.Language.${key}`),
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		});
		const customSystemLanguages = game.settings.get("pf2e", "homebrew.languages");
		customSystemLanguages.forEach((l) => {
			const key = l.id;
			langs[key] = {
				label: l.value,
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		});
		this.languages = langs;
	}

	loadLanguages() {}

	addLanguage() {}

	removeLanguage() {}

	getSystemDefaultLanguage() {
		return game.settings.get("pf2e", "homebrew.languageRarities").commonLanguage;
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
		const party = game.actors.find((a) => a.id === game.settings.get("pf2e", "activeParty"));
		if (party?.members.length) {
			const members = party.members.map((a) => a.id);
			const users = filtered.filter((u) => ownedActors.some((actor) => members.includes(actor.id) && actor.testUserPermission(u, "OWNER"))
			);
			return users;
		}
		return filtered;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system?.details?.languages) {
			for (let lang of actor.system.details.languages.value) {
				if (lang === "common") {
					const common = game.settings.get("pf2e", "homebrew.languageRarities").commonLanguage;
					knownLanguages.add(common);
					// Legacy support for old-Common languages that would turn unreadable if the character doesn't know it
					knownLanguages.add(lang);
				} else if (lang in CONFIG.PF2E.languages) {
					knownLanguages.add(lang);
				}
			}
			if (actor.system.details.languages.custom) {
				for (let lang of actor.system.details.languages.custom.split(/[,;]/)) {
					const key = lang.trim().toLowerCase();
					knownLanguages.add(key);
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
