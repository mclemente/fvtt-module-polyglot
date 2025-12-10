import LanguageProvider from "./templates/Base.js";

export default class shadowdarkLanguageProvider extends LanguageProvider {
	languages = {
		celestial: {
			label: "Celestial",
			font: "Celestial",
		},
		common: {
			label: "Common",
			font: "Thorass",
		},
		diabolic: {
			label: "Diabolic",
			font: "Barazhad",
		},
		draconic: {
			label: "Draconic",
			font: "Dragon Alphabet",
		},
		dwarvish: {
			label: "Dwarvish",
			font: "Floki",
		},
		elvish: {
			label: "Elvish",
			font: "Espruar",
		},
		giant: {
			label: "Giant",
			font: "Davek",
		},
		goblin: {
			label: "Goblin",
			font: "Iokharic",
		},
		merran: {
			label: "Merran",
			font: "High Drowic",
		},
		orcish: {
			label: "Orcish",
			font: "Dethek",
		},
		primordial: {
			label: "Primordial",
			font: "Infernal",
		},
		reptilian: {
			label: "Reptilian",
			font: "Thassilonian",
		},
		sylvan: {
			label: "Sylvan",
			font: "Rellanic",
		},
		thanian: {
			label: "Thanian",
			font: "Olde Thorass",
		},
	};

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const languages = await shadowdark.compendiums.languages();
		languages.map((i) => i.name).forEach((lang) => {
			const langIndex = lang.slugify();
			this.languages[langIndex] = {
				label: lang,
				font: languagesSetting[langIndex]?.font || this.languages[langIndex]?.font || this.defaultFont,
				rng: languagesSetting[langIndex]?.rng ?? "default",
			};
		});
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const actorLanguages = actor.system?.languages;
		if (actorLanguages) {
			for (let lang of actorLanguages) {
				let langObj = fromUuidSync(lang);
				knownLanguages.add(langObj.name.slugify());
			}
		}
		return [knownLanguages, literateLanguages];
	}

	getSystemDefaultLanguage() {
		return "common";
	}
}
