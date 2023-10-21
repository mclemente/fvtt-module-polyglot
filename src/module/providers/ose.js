import LanguageProvider from "./templates/Base.js";

export default class oseLanguageProvider extends LanguageProvider {
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
