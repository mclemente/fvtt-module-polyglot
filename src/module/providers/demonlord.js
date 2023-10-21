import LanguageProvider from "./templates/Base.js";

export default class demonlordLanguageProvider extends LanguageProvider {
	languages = {
		"Common Tongue": {
			font: "Thorass",
		},
		"Dark Speech": {
			font: "Infernal",
		},
		"High Archaic": {
			font: "Mage Script",
		},
		Elvish: {
			font: "Espruar",
		},
		Dwarfish: {
			font: "Dethek",
		},
		"Dead Languages": {
			font: "Olde Thorass",
		},
		"Secret Language": {
			font: "Thassilonian",
		},
		Trollish: {
			font: "Ar Ciela",
		},
		Centauri: {
			font: "High Drowic",
		},
		Gnomish: {
			font: "High Drowic",
		},
		Amrin: {
			font: "Thorass",
		},
		Balgrennish: {
			font: "Tengwar",
		},
		Bhali: {
			font: "Tengwar",
		},
		Edene: {
			font: "Thorass",
		},
		Erath: {
			font: "Thorass",
		},
		Grennish: {
			font: "Tengwar",
		},
		Kalasan: {
			font: "Thorass",
		},
		Woad: {
			font: "Jungle Slang",
		},
		Sylphen: {
			font: "High Drowic",
		},
		Molekin: {
			font: "Barazhad",
		},
		Naga: {
			font: "Barazhad",
		},
		Yerath: {
			font: "Barazhad",
		},
	};

	requiresReady = true;

	getSystemDefaultLanguage() {
		return "Common Tongue";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const demonlordPack = game.packs.get("demonlord.languages");
		const demonlordItemList = await demonlordPack.getIndex();
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let item of demonlordItemList) {
			const originalName = item?.flags?.babele?.originalName || item.name;
			this.languages[originalName] = {
				label: item.name,
				font: languagesSetting[originalName]?.font || this.languages[originalName]?.font || this.defaultFont,
				rng: languagesSetting[originalName]?.rng ?? "default",
			};
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let item of actor.items) {
			if (item.type === "language") {
				const name = item?.flags?.babele?.originalName || item.name;
				if (item.system.speak) knownLanguages.add(name);
				if (item.system.read) literateLanguages.add(name);
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}
