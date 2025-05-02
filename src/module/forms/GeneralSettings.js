export class PolyglotGeneralSettings extends FormApplication {
	static get defaultOptions() {
		const classes = ["sheet", "polyglot", "polyglot-general-settings"];
		if (game.system.id === "wfrp4e") {
			classes.push(game.system.id);
		}
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "polyglot-general-form",
			title: "Polyglot General Settings",
			template: "./modules/polyglot/templates/GeneralSettings.hbs",
			classes,
			tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "font" }],
			width: 600,
			height: "auto",
			closeOnSubmit: true,
		});
	}

	_prepSetting(key, flag = false) {
		const settingData = game.settings.settings.get(`polyglot.${key}`);
		if (!flag && settingData.polyglotHide) return;

		const { button, choices, default: def, hasTextarea, hint, isColor, name, range, type } = settingData;
		let select = [];
		if (choices !== undefined) {
			const type = foundry.utils.getType(choices);
			if (type === "Object") select = Object.entries(choices).map(([key, value]) => ({ key, value }));
			else if (type === "Array") select = choices;
		}

		let settingType = type.name;
		if (button) {
			settingType = "Button";
		} else if (range) {
			settingType = "Range";
		} else if (choices) {
			settingType = "Select";
		} else if (isColor) {
			settingType = "Color";
		} else if (hasTextarea) {
			settingType = "Textarea";
		}

		return {
			id: key,
			value: flag ? (game.user.flags?.polyglot?.[key] ?? def) : game.settings.get("polyglot", key),
			name,
			hint,
			type: settingType,
			range,
			select,
		};
	}

	_prepFlag(key) {
		return this._prepSetting(key, true);
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
					font: {
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
					font: {
						// Font Settings
						RuneRegex: this._prepSetting("RuneRegex"),
						enableAllFonts: this._prepSetting("enableAllFonts"),
						exportFonts: this._prepSetting("exportFonts"),
					},
					journal: {
						// Journal
						IgnoreJournalFontSize: this._prepSetting("IgnoreJournalFontSize"),
						JournalHighlightColor: this._prepSetting("JournalHighlightColor"),
						JournalHighlight: this._prepSetting("JournalHighlight"),
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
						enableChatFeatures: this._prepSetting("enableChatFeatures")
					},
				},
			};
			if (game.settings.get("polyglot", "enableChatFeatures")) {
				data.settings.chat = {
					...data.settings.chat,
					"display-translated": this._prepSetting("display-translated"),
					hideTranslation: this._prepSetting("hideTranslation"),
					allowOOC: this._prepSetting("allowOOC"),
					runifyGM: this._prepSetting("runifyGM"),
				};
			}
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
			data.settings[s] = Object.fromEntries(
				Object.entries(data.settings[s]).filter(([key, value]) => value !== undefined),
			);
		}

		return data;
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button").on("click", async (event) => {
			const dataset = event.currentTarget?.dataset;
			if (dataset?.action === "reset") {
				let keys = [
					"defaultLanguage"
				];
				if (game.user.isGM) {
					keys = [
						"RuneRegex",
						"enableAllFonts",
						"exportFonts",
						"IgnoreJournalFontSize",
						"JournalHighlightColor",
						"JournalHighlight",
						"replaceLanguages",
						"defaultLanguage",
						"customLanguages",
						"omniglot",
						"comprehendLanguages",
						"truespeech",
						"enableChatFeatures",
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
				} else {
					await Promise.all(
						keys.map(async (key) => {
							await game.user.unsetFlag("polyglot", key);
						}),
					);
				}
				this.close();
			} else if (dataset?.key) {
				const key = dataset.key;
				game.polyglot.languageProvider.settings?.[key].button?.(event);
			}
		});
		html.find(".form-group button[name]").on("click", async (event) => {
			const name = event.currentTarget.name;
			game.polyglot.languageProvider.settings?.[name].button?.(event);
		});
	}

	async _updateObject(event, formData) {
		let requiresClientReload = false;
		let requiresWorldReload = false;
		for (let [k, v] of Object.entries(foundry.utils.flattenObject(formData))) {
			let s = game.settings.settings.get(`polyglot.${k}`);
			let current = game.user.isGM ? game.settings.get(s.namespace, s.key) : game.user.getFlag("polyglot", k);
			if (v === current) continue;
			requiresClientReload ||= (s.scope !== CONST.SETTING_SCOPES.WORLD) && s.requiresReload;
			requiresWorldReload ||= (s.scope === CONST.SETTING_SCOPES.WORLD) && s.requiresReload;
			if (game.user.isGM) {
				await game.settings.set(s.namespace, s.key, v);
			} else {
				await game.user.setFlag("polyglot", k, v);
			}
		}
		if (requiresClientReload || requiresWorldReload) {
			SettingsConfig.reloadConfirm({ world: requiresWorldReload });
		}
	}
}
