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
		const parties = Object.fromEntries(game.actors.filter((a) => a.type === "group").map((a) => [a.id, a.name]));
		return {
			"DND5E.SpecialLanguages": {
				type: String,
				default: game.i18n.localize("DND5E.LanguagesCommon"),
			},
			"DND5E.TargetedParty": {
				type: String,
				default: Object.keys(parties).length ? Object.keys(parties)[0] : "none",
				choices: {
					none: "",
					...parties,
				},
				onChange: () => {
					game.polyglot.updateUserLanguages(game.polyglot.chatElement);
				},
			},
		};
	}

	/**
	 * Gets an actor's languages.
	 * @param {Document} actor
	 * @var literateLanguages	For systems that support literacy (e.g. reading journals).
	 * @returns [Set, Set]
	 */
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.value) {
				knownLanguages.add(lang.trim().replace(/[\s']/g, "_"));
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
		const party = game.actors.find((a) => a.id === game.settings.get("polyglot", "DND5E.TargetedParty"));
		if (filtered.length > 10 && party?.system?.members.size) {
			const members = Array.from(party.system.members.map((a) => a.id));
			const users = filtered.filter((u) => ownedActors.some((actor) => members.includes(actor.id) && actor.testUserPermission(u, "OWNER"))
			);
			return users;
		}
		return filtered;
	}
}
