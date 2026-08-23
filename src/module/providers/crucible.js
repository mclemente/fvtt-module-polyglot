/* global crucible */
import LanguageProvider from "./templates/Base.js";

export default class crucibleLanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "High Drowic"
		},
		sign: {
			font: "Finger Alphabet"
		}
	};

	addToConfig(key, lang) {
		crucible.CONFIG.languages[key] = {
			label: lang
		};
	}

	removeFromConfig(key) {
		delete crucible.CONFIG.languages[key];
	}

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (this.replaceLanguages) {
			crucible.CONFIG.languages = {};
		}
		const systemLanguages = crucible.CONFIG.languages;
		const getLang = (key, target) => {
			const label = target[key]?.label;
			if (label) {
				langs[key] = {
					label,
					font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
					rng: languagesSetting[key]?.rng ?? "default"
				};
			}
		};
		Object.keys(systemLanguages).forEach((key) => {
			getLang(key, systemLanguages);
		});
		this.languages = langs;
	}

	getUserLanguages(actor) {
		const knownLanguages = new Set(actor.system.details.languages);
		return [knownLanguages, knownLanguages];
	}

	filterUsers(ownedActors) {
		const filtered = super.filterUsers(ownedActors);
		const party = crucible.party;
		if (party?.system.members.length) {
			return filtered.filter((u) => ownedActors.some((actor) => party.system.memberIds.has(actor.id) && actor.testUserPermission(u, "OWNER")));
		}
		return filtered;
	}
}
