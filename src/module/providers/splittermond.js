import LanguageProvider from "./templates/Base.js";

export default class splittermondLanguageProvider extends LanguageProvider {
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const isLiterate = actor.items.filter((item) => item.name === "Literat" && item.type === "strength").length > 0;
		actor.items
			.filter((item) => item.type === "language")
			.forEach((item) => {
				const name = item.name.trim().toLowerCase();
				knownLanguages.add(name);
				if (isLiterate) literateLanguages.add(name);
			});
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}
