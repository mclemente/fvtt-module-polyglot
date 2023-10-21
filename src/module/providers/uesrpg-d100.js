import LanguageProvider from "./templates/Base.js";

export default class uesrpgLanguageProvider extends LanguageProvider {
	languages = {
		cyrodilic: {
			font: "Thorass",
		},
		aldmeri: {
			font: "Espruar",
		},
		ayleidoon: {
			font: "Espruar",
		},
		bosmeri: {
			font: "Mage Script",
		},
		daedric: {
			font: "Daedra",
		},
		dovah: {
			font: "Dragon Alphabet",
		},
		dunmeri: {
			font: "High Drowic",
		},
		dwemeris: {
			font: "Dethek",
		},
		falmer: {
			font: "Ar Ciela",
		},
		jel: {
			font: "Ophidian",
		},
		nordic: {
			font: "Ny Stormning",
		},
		taagra: {
			font: "Jungle Slang",
		},
		yoku: {
			font: "Oriental",
		},
	};

	getSystemDefaultLanguage() {
		return "cyrodilic";
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.UESRPG.languages = {};
		}
		Object.keys(CONFIG.UESRPG.languages).forEach((key) => {
			const label = CONFIG.UESRPG.languages[key];
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
		for (let item of actor.items) {
			if (item.type === "language") {
				if (item.system.speak) knownLanguages.add(item.name.trim().toLowerCase());
				if (item.system.readWrite) literateLanguages.add(item.name.trim().toLowerCase());
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}
