import LanguageProvider from "./templates/Base.js";

export default class a5eLanguageProvider extends LanguageProvider {
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
