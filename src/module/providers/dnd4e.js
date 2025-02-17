import LanguageProvider from "./templates/Base.js";

export default class dnd4eLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		abyssal: {
			font: "Barazhad",
		},
		deep: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		dwarven: {
			font: "Davek",
		},
		elven: {
			font: "Rellanic",
		},
		giant: {
			font: "Davek",
		},
		goblin: {
			font: "Davek",
		},
		primordial: {
			font: "Davek",
		},
		supernal: {
			font: "Celestial",
		},
	};

	addToConfig(key, lang) {
		CONFIG.DND4E.spoken[key] = lang;
	}

	removeFromConfig(key) {
		delete CONFIG.DND4E.spoken[key];
	}

	async getLanguages() {
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.DND4E.spoken = {};
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang in CONFIG.DND4E.spoken) {
			langs[lang] = {
				label: CONFIG.DND4E.spoken[lang],
				font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
		}
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.languages.spoken.value) {
			knownLanguages.add(lang);
		}
		// for (let lang of actor.system.languages.script.value) {
		// 	literateLanguages.add(lang);
		// }
		return [knownLanguages, literateLanguages];
	}
}
