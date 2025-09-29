import LanguageProvider from "./templates/Base.js";

export default class wfrp4eLanguageProvider extends LanguageProvider {
	languages = {
		reikspiel: {
			font: "Infernal",
		},
		wastelander: {
			font: "Infernal",
		},
		classical: {
			font: "Infernal",
		},
		cathan: {
			font: "Oriental",
		},
		tilean: {
			font: "Thorass",
		},
		estalian: {
			font: "Tengwar",
		},
		gospodarinyi: {
			font: "Miroslav Normal",
		},
		albion: {
			font: "Elder Futhark",
		},
		norse: {
			font: "Elder Futhark",
		},
		bretonnian: {
			font: "Elder Futhark",
		},
		druhir: {
			font: "Dark Eldar",
		},
		elthárin: {
			font: "Eltharin",
		},
		orcish: {
			font: "Ork Glyphs",
		},
		queekish: {
			font: "Skaven",
		},
		slaan: {
			font: "Saurian",
		},
		khazalid: {
			font: "Floki",
		},
		magick: {
			font: "Eltharin",
		},
	};

	requiresReady = true;

	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.WFRP4E.LanguageSkills"),
			},
			ReadWrite: {
				name: game.i18n.localize("POLYGLOT.WFRP4E.ReadWrite.title"),
				hint: game.i18n.localize("POLYGLOT.WFRP4E.ReadWrite.hint"),
				type: String,
				default: game.i18n.localize("POLYGLOT.WFRP4E.ReadWrite.default"),
			},
		};
	}

	getSystemDefaultLanguage() {
		return "reikspiel";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const wfrp4ePack = game.packs.get("wfrp4e-core.items") || game.packs.get("wfrp4e.basic");
		const wfrp4eItemList = await wfrp4ePack.getIndex();
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const myRegex = new RegExp(`(?:Language|${game.settings.get("polyglot", "LanguageRegex")})\\s*\\((.+)\\)`, "i");
		const langs = {};
		for (let item of wfrp4eItemList) {
			if (myRegex.test(item.name)) {
				let label = item.name.match(myRegex)[1].trim();
				let key = label.toLowerCase();
				if (!label) continue;
				langs[key] = {
					label,
					font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
					rng: languagesSetting[key]?.rng ?? "default",
				};
			}
		}
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const readWrite = game.settings.get("polyglot", "ReadWrite");
		const isLiterate = actor.items.find((item) => item.name === readWrite && item.type === "talent") != null;
		let myRegex = new RegExp(`${game.settings.get("polyglot", "LanguageRegex")}\\s*\\((.+)\\)`, "i");
		for (let item of actor.items) {
			// adding only the descriptive language name, not "Language (XYZ)"
			if (myRegex.test(item.name)) {
				let language = item.name.match(myRegex)[1].trim().toLowerCase();
				knownLanguages.add(language);
				if (isLiterate) literateLanguages.add(language);
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}
