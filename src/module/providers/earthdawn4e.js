import LanguageProvider from "./templates/Base.js";

export default class earthdawn4eLanguageProvider extends LanguageProvider {
	languages = {
		human: {
			font: "Thorass",
		},
		dwarven: {
			font: "Dethek",
		},
		elven: {
			font: "Espruar",
		},
		windling: {
			font: "Olde Thorass",
		},
		obsidiman: {
			font: "Dethek",
		},
		troll: {
			font: "Jungle Slang",
		},
		ork: {
			font: "Dethek",
		},
		tskrang: {
			font: "Iokharic",
		},
	};

	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
			LiteracyRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Read"),
			},
		};
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang in this.languages) {
			this.languages[lang] = {
				label: game.i18n.localize(`earthdawn.l.language${lang.capitalize()}`),
				font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang in actor.system.speak.languages) {
			if (actor.system.speak.languages[lang]) knownLanguages.add(lang);
		}
		for (let lang in actor.system.languages.write) {
			if (actor.system.write.languages[lang]) literateLanguages.add(lang);
		}
		if (actor.system.languages.other) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			const literacyRegex = game.settings.get("polyglot", "LiteracyRegex");
			for (let lang of actor.system.languages.other.split(/[,;]/)) {
				const languageMatch = lang.match(`${languageRegex} \\((.+)\\)`, "i");
				const literacyMatch = lang.match(`${literacyRegex} \\((.+)\\)`, "i");
				if (languageMatch || literacyMatch) {
					if (languageMatch) knownLanguages.add(languageMatch[1].trim().toLowerCase());
					else if (literacyMatch) literateLanguages.add(literacyMatch[1].trim().toLowerCase());
				} else {
					knownLanguages.add(lang.trim().toLowerCase());
					literateLanguages.add(lang.trim().toLowerCase());
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}

	conditions(lang) {
		return game.polyglot.literateLanguages.has(lang);
	}
}
