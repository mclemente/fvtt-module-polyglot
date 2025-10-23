import LanguageProvider from "./templates/Base.js";

export default class wwnLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			// System has a built-in setting to handle languages.
			replaceLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.replaceLanguages"),
			},
			customLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.customLanguages"),
			},
		};
	}

	getSystemDefaultLanguage() {
		return Object.keys(this.languages)[0];
	}

	addLanguage(lang) {
		if (!lang) return;
		let languages = game.settings.get("wwn", "languageList");
		const languagesSetting = game.settings.get("polyglot", "Languages");
		if (!languages.includes(lang)) {
			if (languages.endsWith(",")) languages += lang;
			else languages += `,${lang}`;
			game.settings.set("wwn", "languageList", languages);
		}
		lang = lang.trim();
		const key = lang.slugify({ replacement: "_" });
		this.languages[key] = {
			label: lang,
			font: languagesSetting[key]?.font ?? this.defaultFont,
			rng: languagesSetting[key]?.rng ?? "default",
		};
	}

	removeLanguage(lang) {
		if (!lang) return;
		let languages = game.settings.get("wwn", "languageList");
		if (languages.includes(lang)) {
			languages.replace(new RegExp(`,\\s*${lang}`), "");
			game.settings.set("wwn", "languageList", languages);
		}
		const key = lang.slugify({ replacement: "_" });
		delete this.languages[key];
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang of game.settings.get("wwn", "languageList").split(",")) {
			const key = lang.slugify({ replacement: "_" });
			this.languages[key] = {
				label: lang,
				font: languagesSetting[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system.languages) {
			for (let lang of actor.system.languages.value) {
				knownLanguages.add(lang.toLowerCase());
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
