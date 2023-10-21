import LanguageProvider from "./templates/Base.js";

export default class ariaLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		kohestien: {
			font: "Tuzluca",
		},
		aqab: {
			font: "Ar Ciela",
		},
		staum: {
			font: "Floki",
		},
		osmanlien: {
			font: "Eltharin",
		},
		mon: {
			font: "Valmaric",
		},
		nok: {
			font: "Dark Eldar",
		},
		carredass: {
			font: "Celestial",
		},
		blanc: {
			font: "Ork Glyphs",
		},
		knigien: {
			font: "Tengwar",
		},
		esperan: {
			font: "Thassilonian",
		},
		altabiancais: {
			font: "Espruar",
		},
		altanegrais: {
			font: "Espruar",
		},
	};

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		knownLanguages.add(game.i18n.localize("ARIA.languages.Common"));
		for (let lang of actor.items) {
			if (lang.system.language) knownLanguages.add(lang.name.toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}
