import LanguageProvider from "./templates/Base.js";

export default class pf2eLanguageProvider extends LanguageProvider {
	languages = {
		chthonian: {
			font: "Barazhad",
		},
		aklo: {
			font: "Ophidian",
		},
		alghollthu: {
			font: "Ar Ciela",
		},
		anadi: {
			font: "Jungle Slang",
		},
		thalassic: {
			font: "Olde Thorass",
		},
		arboreal: {
			font: "Olde Espruar",
		},
		sussuran: {
			font: "Olde Thorass",
		},
		azlanti: {
			font: "Tengwar",
		},
		boggard: {
			font: "Semphari",
		},
		caligni: {
			font: "High Drowic",
		},
		empyrean: {
			font: "Celestial",
		},
		cyclops: {
			font: "Meroitic Demotic",
		},
		daemonic: {
			font: "Infernal",
		},
		destrachan: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		wildsong: {
			font: "Jungle Slang",
		},
		dwarven: {
			font: "Dethek",
		},
		dziriak: {
			font: "Pulsian",
		},
		elven: {
			font: "Espruar",
		},
		erutaki: {
			font: "Tuzluca",
		},
		garundi: {
			font: "Qijomi",
		},
		kholo: {
			font: "Kargi",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Kargi",
		},
		grippli: {
			font: "Semphari",
		},
		hallit: {
			font: "Tengwar",
		},
		pyric: {
			font: "Dethek",
		},
		iruxi: {
			font: "Semphari",
		},
		jistkan: {
			font: "Valmaric",
		},
		jotun: {
			font: "Meroitic Demotic",
		},
		jyoti: {
			font: "Celestial",
		},
		diabolic: {
			font: "Infernal",
		},
		kelish: {
			font: "Highschool Runes",
		},
		mwangi: {
			font: "Tengwar",
		},
		necril: {
			font: "High Drowic",
		},
		orcish: {
			font: "Dethek",
		},
		protean: {
			font: "Barazhad",
		},
		requian: {
			font: "Reanaarian",
		},
		shoanti: {
			font: "Tengwar",
		},
		skald: {
			font: "Valmaric",
		},
		sphinx: {
			font: "Reanaarian",
		},
		strix: {
			font: "Infernal",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		shoony: {
			font: "Dethek",
		},
		taldane: {
			font: "Tengwar",
		},
		tengu: {
			font: "Oriental",
		},
		petran: {
			font: "Dethek",
		},
		thassilonian: {
			font: "Thassilonian",
		},
		tien: {
			font: "Oriental",
		},
		sakvroth: {
			font: "High Drowic",
		},
		utopian: {
			font: "Maras Eye",
		},
		varisian: {
			font: "Tengwar",
		},
		vudrani: {
			font: "Qijomi",
		},
	};

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

	ready() {
		if (game.user.isGM) {
			const pf2eDefaultLanguage = game.settings.get("pf2e", "homebrew.languageRarities").commonLanguage;
			const pf2eDefaultLangString = game.i18n.localize(CONFIG.PF2E.languages[pf2eDefaultLanguage]);
			const messagesInCommon = game.messages.contents
				.slice(-CONFIG.ChatMessage.batchSize)
				.filter((m) => m.flags?.polyglot?.language === "common");
			if (!messagesInCommon.length) return;

			new Dialog({
				title: "Polyglot Changes",
				content: `<div>
					<p>Polyglot has updated to integrate some new features of PF2e, you can read all changes on <a class="hyperlink" href="https://github.com/mclemente/fvtt-module-polyglot/releases/tag/2.3.24" target="_blank" rel="nofollow noopener">this link</a>.</p>
					<p style="color: red"><b>These changes will render all chat messages written in Common unreadable for players that know Common. They need to be updated to a proper language.</b></p>
					<p>Polyglot will update the language of the last ${messagesInCommon.length} Common messages to <b style="color: red">${pf2eDefaultLangString}</b>.</p>
					<p>If you want to change them to another language on PF2e, you can do so by changing PF2e's "Common" language in the Homebrew Elements menu and reloading the page.</p>
				</div>`,
				buttons: {
					site: {
						label: "Polyglot Wiki",
						icon: '<i class="fas fa-landmark"></i>',
						callback: () => window.open("https://github.com/mclemente/fvtt-module-polyglot/wiki/%5BPF2e%5D-Languages")
					},
					update: {
						label: `Update to ${pf2eDefaultLangString}`,
						icon: '<i class="fa-solid fa-wrench"></i>',
						callback: () => {
							const changed = messagesInCommon.map((m) => {
								return {
									_id: m._id,
									"flags.polyglot.language": pf2eDefaultLanguage
								};
							});
							ChatMessage.updateDocuments(changed);
						}
					}
				}
			}, { width: 500 }).render(true);
		}
	}

	async getLanguages() {
		const customSystemLanguages = game.settings.get("pf2e", "homebrew.languages");
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
		return game.settings.get("pf2e", "homebrew.languageRarities").commonLanguage;
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
		const languageRarities = game.settings.get("pf2e", "homebrew.languageRarities");
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
