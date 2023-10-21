import LanguageProvider from "./templates/Base.js";

export default class fggLanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.languages.value) knownLanguages.add(lang.toLowerCase());
		if (actor.system.languages.custom) {
			for (let lang of actor.system.languages.custom.split(/[,;]/)) knownLanguages.add(lang.trim().toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}
