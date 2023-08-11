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

	prepRange(key) {
		const data = game.settings.settings.get(`polyglot.${key}`);
		const { name, hint, range } = data;
		return { id: key, value: game.settings.get("polyglot", key), name, hint, range };
	}

	prepSelection(key) {
		const data = game.settings.settings.get(`polyglot.${key}`);
		const { name, hint } = data;
		const selected = game.settings.get("polyglot", key);
		const select = Object.entries(data.choices).map(([key, value]) => ({ key, value }));
		return { id: key, select, name, hint, selected };
	}

	prepSetting(key) {
		const { name, hint, config, polyglotHide } = game.settings.settings.get(`polyglot.${key}`);
		return { id: key, value: game.settings.get("polyglot", key), name, hint, config, polyglotHide };
	}

	async resetToDefault(key) {
		const defaultValue = game.settings.settings.get(`polyglot.${key}`).default;
		await game.settings.set("polyglot", key, defaultValue);
	}

	getData(options) {
		return {
			journalTabName: game.i18n.localize("SIDEBAR.TabJournal"),

			// General Settings
			RuneRegex: this.prepSetting("RuneRegex"),
			enableAllFonts: this.prepSetting("enableAllFonts"),
			exportFonts: this.prepSetting("exportFonts"),
			// Journal
			IgnoreJournalFontSize: this.prepSetting("IgnoreJournalFontSize"),
			JournalHighlightColor: this.prepSetting("JournalHighlightColor"),
			JournalHighlight: this.prepRange("JournalHighlight"),
			// Languages
			replaceLanguages: this.prepSetting("replaceLanguages"),
			customLanguages: this.prepSetting("customLanguages"),
			omniglot: this.prepSetting("omniglot"),
			comprehendLanguages: this.prepSetting("comprehendLanguages"),
			truespeech: this.prepSetting("truespeech"),
			// Chat
			"display-translated": this.prepSetting("display-translated"),
			hideTranslation: this.prepSetting("hideTranslation"),
			allowOOC: this.prepSelection("allowOOC"),
			runifyGM: this.prepSetting("runifyGM"),
		};
	}

	_activateCoreListeners(html) {
		super._activateCoreListeners(html);
		if (this.changeTabs) {
			const tabName = this.changeTabs.toString();
			if (tabName !== this._tabs[0].active) this._tabs[0].activate(tabName);
			this.changeTabs = 0;
		}
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find(".polyglot-languageProvider").on("change", (event) => {
			const languagesList = html.find(".polyglot-languages-list")[0];
			const languagesTitle = html.find(".polyglot-languages-title-notes")[0];
			const languagesWarning = html.find(".polyglot-languages-warn")[0];
			const shouldDisplayLanguages = this.languageProvider === event.target.value;
			languagesList.style.display = shouldDisplayLanguages ? "block" : "none";
			languagesTitle.style.display = shouldDisplayLanguages ? "block" : "none";
			languagesWarning.style.display = shouldDisplayLanguages ? "none" : "block";
		});
		html.find(".polyglot-alphabet").each(function () {
			const font = this.previousSibling.previousSibling.children[0].value; //selectatr's value
			this.style.font = game.polyglot.languageProvider.fonts[font];
		});
		html.find(".selectatr").on("change", (event) => {
			const font = event.target.value;
			const parentElement = event.target.parentElement;
			const nextSibling = parentElement.nextSibling;
			if (nextSibling && nextSibling.nextSibling) {
				const elementToChange = nextSibling.nextSibling;
				const alphabet = game.polyglot.languageProvider.fonts[font];
				elementToChange.style.font = alphabet;
			}
		});
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				game.polyglot.languageProvider.loadFonts();
				await game.settings.set("polyglot", "Alphabets", game.polyglot.languageProvider.fonts);
				await game.settings.set("polyglot", "Languages", game.polyglot.languageProvider.languages);
				this.close();
			}
		});
	}

	async _updateObject(event, formData) {
		await Promise.all(
			Object.entries(formData).map(async ([key, value]) => {
				await game.settings.set("polyglot", key, value);
			})
		);
	}
}
