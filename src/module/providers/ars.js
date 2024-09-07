import LanguageProvider from "./templates/Base.js";

export default class arsLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			}
		};
	}

	async getLanguages() {
		this.languages = {};
		if (this.replaceLanguages) return;
		if (game.modules.get("osric-compendium")?.active) {
			const langs = {};
			const osricPack = game.packs.get("osric-compendium.items");
			const osricItemList = await osricPack.getIndex();
			const languagesSetting = game.settings.get("polyglot", "Languages");
			let myRegex = new RegExp(`(?:Language:|${game.settings.get("polyglot", "LanguageRegex")}:)\\s*(.+)`, "i");
			for (let item of osricItemList) {
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
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		let myRegex = new RegExp(`(?:Language:|${game.settings.get("polyglot", "LanguageRegex")}:)\\s*(.+)`, "i");
		for (let item of actor.items) {
			// adding only the descriptive language name, not "Language: XYZ"
			if (myRegex.test(item.name)) knownLanguages.add(item.name.match(myRegex)[1].trim().toLowerCase());
		}
		return [knownLanguages, literateLanguages];
	}
}
