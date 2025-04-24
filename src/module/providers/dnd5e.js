import LanguageProvider from "./templates/Base.js";

export default class dnd5eLanguageProvider extends LanguageProvider {
	languages = {
		aarakocra: {
			font: "Olde Thorass",
		},
		abyssal: {
			font: "Infernal",
		},
		aquan: {
			font: "Dethek",
		},
		auran: {
			font: "Dethek",
		},
		celestial: {
			font: "Celestial",
		},
		common: {
			font: "Thorass",
		},
		deep: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarvish: {
			font: "Dethek",
		},
		elvish: {
			font: "Espruar",
		},
		giant: {
			font: "Dethek",
		},
		gith: {
			font: "Pulsian",
		},
		gnoll: {
			font: "Kargi",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Dethek",
		},
		halfling: {
			font: "Thorass",
		},
		ignan: {
			font: "Dethek",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		primordial: {
			font: "Dethek",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Dethek",
		},
		cant: {
			font: "Thorass",
		},
		undercommon: {
			font: "High Drowic",
		},
	};

	get settings() {
		return {
			"DND5E.SpecialLanguages": {
				type: String,
				default: game.i18n.localize("DND5E.Language.Language.Common"),
			}
		};
	}

	languageRarities = ["standard", "exotic"];

	multiLanguages = {
		primordial: {
			parent: "exotic"
		}
	};

	async getLanguages() {
		const languagesSetting = game.settings.get("polyglot", "Languages");
		const langs = {};
		if (this.replaceLanguages) {
			CONFIG.DND5E.languages = {};
			this.languageRarities = [];
			this.multiLanguages = {};
		}
		const systemLanguages = CONFIG.DND5E.languages;
		const getLang = (key, target) => {
			const processLanguage = (label) => {
				if (label) {
					langs[key] = {
						label,
						font: languagesSetting[key]?.font || this.languages[key]?.font || this.defaultFont,
						rng: languagesSetting[key]?.rng ?? "default",
					};
				}
			};

			if (key in this.multiLanguages) {
				processLanguage(game.i18n.localize(target[key].label));
			}
			if (target[key].children) {
				Object.keys(target[key].children).forEach((kkey) => {
					getLang(kkey, target[key].children);
				});
			} else {
				processLanguage(game.i18n.localize(target[key]));
			}
		};
		Object.keys(systemLanguages).forEach((key) => {
			if (this.languageRarities.includes(key)) {
				Object.keys(systemLanguages[key].children).forEach((kkey) => {
					getLang(kkey, systemLanguages[key].children);
				});
			} else {
				getLang(key, systemLanguages);
			}
		});
		this.languages = langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) {
				if (this.languageRarities.includes(lang)) {
					for (let l in CONFIG.DND5E.languages[lang].children) {
						knownLanguages.add(l.trim().replace(/[\s']/g, "_"));
					}
				} else {
					knownLanguages.add(lang.trim().replace(/[\s']/g, "_"));
				}
				if (lang in this.multiLanguages) {
					const parent = this.multiLanguages[lang].parent;
					let languages;
					if (parent) {
						const parentChildren = CONFIG.DND5E.languages[parent].children;
						languages = parentChildren[lang].children;
					} else {
						languages = CONFIG.DND5E.languages[lang].children;
					}
					for (let l in languages) {
						knownLanguages.add(l.trim().replace(/[\s']/g, "_"));
					}
				}
			}
			if (actor.system.traits.languages.custom) {
				const defaultSpecialLanguage = game.settings
					.get("polyglot", "DND5E.SpecialLanguages")
					.trim()
					.toLowerCase();
				// eslint-disable-next-line no-unsafe-optional-chaining
				for (let lang of actor.system.traits.languages?.custom.split(/[;]/)) {
					let key = lang.trim().toLowerCase();
					try {
						if (/(usually common)|(in life)|(its creator)|(?<=any)(.*)(?=language)/i.test(key)) {
							knownLanguages.add(defaultSpecialLanguage);
						} else if (/(?<=usually)(.*)(?=\))/g.test(key)) {
							key = key.match(/(?<=usually)(.*)(?=\))/g)[0].trim();
							knownLanguages.add(key);
						} else if (/(?<=understands)(.*)(?=but can't speak it)/g.test(key)) {
							key = key.match(/(?<=understands)(.*)(?=but can't speak it)/g)[0].trim();
							knownLanguages.add(key);
						} else if (/(.*)(?=plus)/.test(key)) {
							key = key.match(/(.*)(?=plus)/)[0].trim();
							knownLanguages.add(key);
						} else {
							knownLanguages.add(key);
						}
					} catch(err) {
						console.error(
							`Polyglot | Failed to get custom language "${key}" from actor "${actor.name}".`,
							err
						);
					}
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}

	filterUsers(ownedActors) {
		const filtered = super.filterUsers(ownedActors);
		const party = game.settings.get("dnd5e", "primaryParty")?.actor;
		if (party?.system?.members.length) {
			const members = Array.from(party.system.members.ids);
			const users = filtered.filter((u) => ownedActors.some((actor) => members.includes(actor.id) && actor.testUserPermission(u, "OWNER")));
			return users;
		}
		return filtered;
	}
}
