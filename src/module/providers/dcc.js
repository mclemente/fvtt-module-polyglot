import LanguageProvider from "./templates/Base.js";

export default class dccLanguageProvider extends LanguageProvider {
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
