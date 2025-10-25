import LanguageProvider from "./Base.js";

export default class GenericLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			languageDataPath: {
				hint: game.i18n.format("POLYGLOT.languageDataPath.hint", {
					setting: game.i18n.localize("POLYGLOT.LanguageRegex.title"),
				}),
				default: "",
				type: String,
				requiresReload: true,
			},
			literacyDataPath: {
				hint: game.i18n.format("POLYGLOT.literacyDataPath.hint", {
					setting: game.i18n.localize("POLYGLOT.languageDataPath.title"),
				}),
				default: "",
				type: String,
				requiresReload: true,
			},
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
			useLiteracy: {
				type: Boolean,
				default: false,
			},
			LiteracyRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Literacy"),
			},
		};
	}

	async setup() {
		this.languageDataPath = game.settings.get("polyglot", "languageDataPath");
		this.literacyDataPath = game.settings.get("polyglot", "literacyDataPath");
		if (this.languageDataPath.startsWith("actor.")) this.languageDataPath = this.languageDataPath.slice(6);
		if (this.literacyDataPath.startsWith("actor.")) this.literacyDataPath = this.literacyDataPath.slice(6);
		super.setup();
	}

	conditions(lang) {
		if (game.settings.get("polyglot", "useLiteracy")) {
			return game.polyglot.literateLanguages.has(lang);
		}
		return super.conditions(lang);
	}
}
