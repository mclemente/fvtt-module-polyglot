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
			font: "romance",
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
		let wfrp4ePack;
		if (isNewerVersion(game.system.version, "6.6.1")) {
			wfrp4ePack = game.packs.get("wfrp4e-core.items") || game.packs.get("wfrp4e.basic");
		} else {
			wfrp4ePack = game.packs.get("wfrp4e-core.skills") || game.packs.get("wfrp4e.basic");
		}
		const wfrp4eItemList = await wfrp4ePack.getIndex();
		const languagesSetting = game.settings.get("polyglot", "Languages");
		let myRegex = new RegExp(`(?:Language|${game.settings.get("polyglot", "LanguageRegex")})\\s*\\((.+)\\)`, "i");
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
		let myRegex = new RegExp(`${game.settings.get("polyglot", "LanguageRegex")}\\s*\\((.+)\\)`, "i");
		for (let item of actor.items) {
			// adding only the descriptive language name, not "Language (XYZ)"
			if (myRegex.test(item.name)) knownLanguages.add(item.name.match(myRegex)[1].trim().toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}
