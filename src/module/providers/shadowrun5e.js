import LanguageProvider from "./templates/Base.js";

export default class shadowrun5eLanguageProvider extends LanguageProvider {
	defaultFont = "Olde English";

	languages = {
		cityspeak: {
			label: "Cityspeak",
			font: "Olde English",
		},
		spanish: {
			label: "Spanish",
			font: "Olde English",
		},
		lakota: {
			label: "Lakota",
			font: "Olde English",
		},
		dakota: {
			label: "Dakota",
			font: "Olde English",
		},
		navajo: {
			label: "Navajo",
			font: "Olde English",
		},
		russian: {
			label: "Russian",
			font: "Kremlin Premier",
		},
		french: {
			label: "French",
			font: "Olde English",
		},
		italian: {
			label: "Italian",
			font: "Olde English",
		},
		german: {
			label: "German",
			font: "Olde English",
		},
		aztlaner: {
			label: "Aztlaner Spanish",
			font: "Aztec",
		},
		sperethiel: {
			label: "Sperethiel",
			font: "Espruar",
		},
		orzet: {
			label: "Or'zet",
			font: "Ork Glyphs",
		},
		english: {
			label: "English",
			font: "Olde English",
		},
		japanese: {
			label: "Japanese",
			font: "Oriental",
		},
		mandarin: {
			label: "Mandarin",
			font: "Scrapbook Chinese",
		},
	};

	getSystemDefaultLanguage() {
		return "cityspeak";
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang in actor.system.skills.language.value) {
			knownLanguages.add(actor.system.skills.language.value[lang].name.toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}
