import LanguageProvider from "./templates/Base.js";

export default class coc7LanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let item of actor.items) {
			const match = item.name.match(`${game.settings.get("polyglot", "LanguageRegex")}\\s*\\((.+)\\)`, "i")
				|| item.name.match(`${game.i18n.localize("POLYGLOT.COC7.LanguageOwn")}\\s*\\((.+)\\)`, "i")
				|| item.name.match(`${game.i18n.localize("POLYGLOT.COC7.LanguageAny")}\\s*\\((.+)\\)`, "i")
				|| item.name.match(`${game.i18n.localize("POLYGLOT.COC7.LanguageOther")}\\s*\\((.+)\\)`, "i");
			// adding only the descriptive language name, not "Language (XYZ)"
			if (match) knownLanguages.add(match[1].trim().toLowerCase());
			else {
				switch (item.system.specialization) {
					case "LanguageSpec":
					case "Language":
					case "Language (Own)":
					case "Language (Other)":
					case game.i18n.localize("POLYGLOT.COC7.LanguageOwn"):
					case game.i18n.localize("POLYGLOT.COC7.LanguageAny"):
					case game.i18n.localize("POLYGLOT.COC7.LanguageOther"):
					case game.i18n.localize("CoC7.language"):
						knownLanguages.add(item.name.trim().toLowerCase());
						break;
					default:
						break;
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
