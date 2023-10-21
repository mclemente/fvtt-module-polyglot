import LanguageProvider from "./templates/Base.js";

export default class tormenta20LanguageProvider extends LanguageProvider {
	languages = {
		comum: {
			font: "Thorass",
		},
		abissal: {
			font: "Barazhad",
		},
		anao: {
			font: "Dethek",
		},
		aquan: {
			font: "Olde Thorass",
		},
		auran: {
			font: "Olde Thorass",
		},
		celestial: {
			font: "Celestial",
		},
		draconico: {
			font: "Iokharic",
		},
		elfico: {
			font: "Espruar",
		},
		gigante: {
			font: "Meroitic Demotic",
		},
		gnoll: {
			font: "Kargi",
		},
		goblin: {
			font: "Kargi",
		},
		ignan: {
			font: "Olde Thorass",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		silvestre: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Olde Thorass",
		},
	};

	getSystemDefaultLanguage() {
		return "comum";
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.T20.idiomas = {};
		}
		Object.keys(CONFIG.T20.idiomas).forEach((key) => {
			const label = CONFIG.T20.idiomas[key];
			if (label) {
				langs[key] = {
					label,
					font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
					rng: languagesSetting[key]?.rng ?? "default",
				};
			}
		});
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang of actor.system.tracos.idiomas.value) knownLanguages.add(lang);
		return [knownLanguages, literateLanguages];
	}
}
