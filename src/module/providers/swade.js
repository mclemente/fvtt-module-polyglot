import LanguageProvider from "./templates/Base.js";

export default class swadeLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.SWADE.LanguageSkills"),
			},
			"SWADE.AdditionalLanguageStat": {
				hint: game.i18n.format("POLYGLOT.SWADE.AdditionalLanguageStat.hint", {
					setting: game.i18n.localize("POLYGLOT.LanguageRegex.title"),
				}),
				type: String,
				default: "",
			},
			"SWADE.AdditionalLiterateStat": {
				hint: game.i18n.format("POLYGLOT.SWADE.AdditionalLiterateStat.hint", {
					setting: game.i18n.localize("POLYGLOT.SWADE.AdditionalLanguageStat.title"),
				}),
				type: String,
				default: "",
			},
		};
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const additionalLanguageStat = game.settings.get("polyglot", "SWADE.AdditionalLanguageStat");
		const additionalLiterateStat = game.settings.get("polyglot", "SWADE.AdditionalLiterateStat");
		if (!additionalLanguageStat) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			let myRegex = new RegExp(`${languageRegex} \\((.+)\\)`, "i");
			for (let item of actor.items) {
				const name = item?.flags?.babele?.originalName || item.name;
				if (myRegex.test(name)) knownLanguages.add(name.match(myRegex)[1].trim().toLowerCase());
			}
		} else {
			const languages = actor.system?.additionalStats?.[additionalLanguageStat]?.value.split(/[,;]/) ?? [];
			for (let lang of languages) {
				lang = lang.trim();
				knownLanguages.add(lang.toLowerCase());
				this.addLanguage(lang);
			}
		}
		if (additionalLiterateStat) {
			const languages = actor.system?.additionalStats?.[additionalLiterateStat]?.value.split(/[,;]/) ?? [];
			for (let lang of languages) {
				lang = lang.trim();
				literateLanguages.add(lang.toLowerCase());
				this.addLanguage(lang);
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		if (game.settings.get("polyglot", "SWADE.AdditionalLiterateStat")) return game.polyglot.literateLanguages.has(lang);
		return game.polyglot.knownLanguages.has(lang);
	}
}
