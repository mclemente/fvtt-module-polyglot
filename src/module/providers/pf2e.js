import LanguageProvider from "./templates/Base.js";

export default class pf2eLanguageProvider extends LanguageProvider {
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

	get settings() {
		const parties = Object.fromEntries(game.actors.filter((a) => a.type === "party").map((a) => [a.id, a.name]));
		return {
			"PF2E.TargetedParty": {
				type: String,
				default: Object.keys(parties).length ? Object.keys(parties)[0] : "none",
				choices: {
					none: "",
					...parties,
				},
				onChange: () => {
					game.polyglot.updateUserLanguages(game.polyglot.chatElement);
				},
			},
		};
	}

	addLanguage(lang) {
		if (!lang) return;
		lang = lang.trim();
		let key = lang.toLowerCase().replace(/[\s']/g, "_");
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

	filterUsers(ownedActors) {
		const filtered = super.filterUsers(ownedActors);
		const party = game.actors.find((a) => a.id === game.settings.get("polyglot", "PF2E.TargetedParty"));
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
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) {
				if (lang in CONFIG.PF2E.languages) {
					knownLanguages.add(lang);
				}
			}
			if (actor.system.traits.languages.custom) {
				for (let lang of actor.system.traits.languages.custom.split(/[,;]/)) {
					const key = lang.trim().toLowerCase();
					knownLanguages.add(key);
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
