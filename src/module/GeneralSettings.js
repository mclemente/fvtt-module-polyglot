export class PolyglotGeneralSettings extends FormApplication {
	static get defaultOptions() {
		const classes = ["sheet", "polyglot", "polyglot-general-settings"];
		if (game.system.id === "wfrp4e") {
			classes.push(game.system.id);
		}
		return mergeObject(super.defaultOptions, {
			id: "polyglot-general-form",
			title: "Polyglot General Settings",
			template: "./modules/polyglot/templates/GeneralSettings.hbs",
			classes,
			tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "general" }],
			width: 600,
			height: "auto",
			closeOnSubmit: true,
			resizable: true,
		});
	}

	_prepSetting(key) {
		const { name, hint, polyglotHide, type, range, choices } = game.settings.settings.get(`polyglot.${key}`);
		if (polyglotHide) return;
		const select = choices !== undefined ? Object.entries(choices).map(([key, value]) => ({ key, value })) : [];
		return { id: key, value: game.settings.get("polyglot", key), name, hint, type: type.name, range, select };
	}

	_prepFlag(key) {
		const { name, hint, default: def, type } = game.settings.settings.get(`polyglot.${key}`);
		return {
			id: key,
			name,
			hint,
			value: game.user.flags?.polyglot?.[key] ?? def,
			type: type.name,
		};
	}

	async resetToDefault(key) {
		const defaultValue = game.settings.settings.get(`polyglot.${key}`).default;
		await game.settings.set("polyglot", key, defaultValue);
	}

	getData() {
		const isGM = game.user.isGM;
		let data = {};
		if (isGM) {
			data = {
				tabs: {
					general: {
						icon: "fas fa-cogs",
						name: "POLYGLOT.Fonts",
					},
					journal: {
						icon: "fas fa-book-open",
						name: "SIDEBAR.TabJournal",
					},
					languages: {
						icon: "fas fa-globe",
						name: "POLYGLOT.Languages.title",
					},
					chat: {
						icon: "fas fa-comments",
						name: "CHAT.Chat",
					},
				},
				settings: {
					general: {
						// Font Settings
						RuneRegex: this._prepSetting("RuneRegex"),
						enableAllFonts: this._prepSetting("enableAllFonts"),
						exportFonts: this._prepSetting("exportFonts"),
					},
					journal: {
						// Journal
						IgnoreJournalFontSize: this._prepSetting("IgnoreJournalFontSize"),
						JournalHighlightColor: { ...this._prepSetting("JournalHighlightColor"), type: "Color" },
						JournalHighlight: { ...this._prepSetting("JournalHighlight"), type: "Range" },
					},
					languages: {
						// Languages
						replaceLanguages: this._prepSetting("replaceLanguages"),
						defaultLanguage: this._prepSetting("defaultLanguage"),
						customLanguages: this._prepSetting("customLanguages"),
						omniglot: this._prepSetting("omniglot"),
						comprehendLanguages: this._prepSetting("comprehendLanguages"),
						truespeech: this._prepSetting("truespeech"),
					},
					chat: {
						// Chat
						"display-translated": this._prepSetting("display-translated"),
						hideTranslation: this._prepSetting("hideTranslation"),
						allowOOC: { ...this._prepSetting("allowOOC"), type: "Select" },
						runifyGM: this._prepSetting("runifyGM"),
					},
				},
			};
		} else {
			data = {
				tabs: {
					languages: {
						icon: "fas fa-globe",
						name: "POLYGLOT.Languages.title",
					},
				},
				settings: {
					languages: {
						defaultLanguage: this._prepFlag("defaultLanguage"),
					},
				},
			};
		}

		for (const s in data.settings) {
			// eslint-disable-next-line no-unused-vars
			data.settings[s] = Object.fromEntries(Object.entries(data.settings[s]).filter(([key, value]) => value !== undefined));
		}

		return data;
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				const keys = [
					"RuneRegex",
					"enableAllFonts",
					"exportFonts",
					"IgnoreJournalFontSize",
					"JournalHighlightColor",
					"JournalHighlight",
					"replaceLanguages",
					"customLanguages",
					"omniglot",
					"comprehendLanguages",
					"truespeech",
					"display-translated",
					"hideTranslation",
					"allowOOC",
					"runifyGM",
				];
				await Promise.all(
					keys.map(async (key) => {
						await this.resetToDefault(key);
					}),
				);
				this.close();
			}
		});
	}

	async _updateObject(event, formData) {
		if (game.user.isGM) {
			let requiresClientReload = false;
			let requiresWorldReload = false;
			for (let [k, v] of Object.entries(foundry.utils.flattenObject(formData))) {
				let s = game.settings.settings.get(`polyglot.${k}`);
				let current = game.settings.get(s.namespace, s.key);
				if (v === current) continue;
				requiresClientReload ||= s.scope === "client" && s.requiresReload;
				requiresWorldReload ||= s.scope === "world" && s.requiresReload;
				await game.settings.set(s.namespace, s.key, v);
			}
			if (requiresClientReload || requiresWorldReload) SettingsConfig.reloadConfirm({ world: requiresWorldReload });
		} else {
			for (let [k, v] of Object.entries(foundry.utils.flattenObject(formData))) {
				let current = game.user.getFlag("polyglot", k);
				if (v === current) continue;
				await game.user.setFlag("polyglot", k, v);
			}
		}
	}
}
