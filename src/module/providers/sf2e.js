import LanguageProvider from "./templates/Base.js";

export default class sf2eLanguageProvider extends LanguageProvider {
	languages = {};

	get settings() {
		return {
			replaceLanguages: {
				...game.settings.settings.get("polyglot.replaceLanguages"),
				hint: "POLYGLOT.PF2E.replaceLanguages.hint"
			},
			customLanguages: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.customLanguages"),
			},
			defaultLanguage: {
				polyglotHide: true,
				...game.settings.settings.get("polyglot.defaultLanguage"),
			},
		};
	}

	init() {
		if (this.replaceLanguages) {
			CONFIG.PF2E.languages = {
				common: "PF2E.Actor.Creature.Language.common"
			};
		}
		Hooks.on("closeHomebrewElements", async (homebrewElements, html) => {
			await game.polyglot.languageProvider.getLanguages();
			await game.settings.set("polyglot", "Languages", game.polyglot.languageProvider.languages);
			game.polyglot.updateUserLanguages();
		});
	}

	async getLanguages() {
		const customSystemLanguages = game.settings.get("sf2e", "homebrew.languages");
		if (this.replaceLanguages) {
			CONFIG.PF2E.languages = {
				common: "PF2E.Actor.Creature.Language.common"
			};
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		const systemLanguages = foundry.utils.deepClone(CONFIG.PF2E.languages);
		delete systemLanguages.common;
		Object.entries(systemLanguages).forEach(([key, value]) => {
			langs[key] = {
				label: game.i18n.has(value) ? game.i18n.localize(value) : value,
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
		});
		customSystemLanguages.filter((lang) => !(lang.id in systemLanguages)).forEach((l) => {
			const key = l.id;
			langs[key] = {
				label: l.value,
				font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
				rng: languagesSetting[key]?.rng ?? "default",
			};
			if (this.replaceLanguages) CONFIG.PF2E.languages[key] = l.value;
		});
		this.languages = langs;
	}

	loadLanguages() {}

	addLanguage() {}

	removeLanguage() {}

	getSystemDefaultLanguage() {
		return game.settings.get("sf2e", "homebrew.languageRarities").commonLanguage;
	}

	getDefaultLanguage() {
		const getLanguage = (language) => {
			if (this.languages[language]) {
				this.defaultLanguage = language;
			} else {
				Object.entries(this.languages).every(([key, lang]) => {
					if (language === lang.label) {
						this.defaultLanguage = key;
						return false;
					}
					return true;
				});
			}
		};
		const userDefault = game.user.getFlag("polyglot", "defaultLanguage");
		if (userDefault) {
			getLanguage(userDefault);
		}
		if (this.defaultLanguage === undefined) {
			this.defaultLanguage = this.getSystemDefaultLanguage();
		}
	}

	filterUsers(ownedActors) {
		const filtered = super.filterUsers(ownedActors);
		if (game.actors.party?.members.length) {
			const members = game.actors.party.members.map((a) => a.id);
			const users = filtered.filter((user) => ownedActors.some((actor) => members.includes(actor.id) && actor.testUserPermission(user, "OWNER")));
			return users;
		}
		return filtered;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const languageRarities = game.settings.get("sf2e", "homebrew.languageRarities");
		const actorLanguages = actor.system?.details?.languages;
		if (actorLanguages) {
			for (let lang of actorLanguages.value) {
				if (lang === "common" && languageRarities.commonLanguage) {
					knownLanguages.add(languageRarities.commonLanguage);
				} else if (lang in CONFIG.PF2E.languages && !languageRarities.unavailable.has(lang)) {
					knownLanguages.add(lang);
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
