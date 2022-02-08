import { availableLanguageProviders, currentLanguageProvider, updateLanguageProvider } from "./api.js";

export class PolyglotLanguageSettings extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "polyglot-language-form",
			title: "Polyglot Language Settings",
			template: "./modules/polyglot/templates/LanguageSettings.hbs",
			classes: ["sheet polyglot-language-settings"],
			width: "fit-content",
			height: "fit-content",
			closeOnSubmit: true,
		});
	}

	getData(options) {
		const data = {};
		const selectedProvider = currentLanguageProvider.id;
		// Insert all speed providers into the template data
		data.providers = Object.values(availableLanguageProviders).map((languageProvider) => {
			const provider = {};
			provider.id = languageProvider.id;
			let dotPosition = provider.id.indexOf(".");
			if (dotPosition === -1) dotPosition = provider.id.length;
			const type = provider.id.substring(0, dotPosition);
			const id = provider.id.substring(dotPosition + 1);
			if (type === "native") {
				let title = id == game.system.id ? game.system.data.title : id;
				provider.selectTitle = (game.i18n.localize("POLYGLOT.LanguageProvider.choices.native") + " " + title).trim();
			} else {
				let name;
				if (type === "module") {
					name = game.modules.get(id).data.title;
				} else {
					name = game.system.data.title;
				}
				provider.selectTitle = game.i18n.format(`POLYGLOT.LanguageProvider.choices.${type}`, { name });
			}
			provider.isSelected = provider.id === selectedProvider;
			return provider;
		});

		data.providerSelection = {
			id: "languageProvider",
			name: game.i18n.localize("POLYGLOT.LanguageProvider.name"),
			hint: game.i18n.localize("POLYGLOT.LanguageProvider.hint"),
			type: String,
			choices: data.providers.reduce((choices, provider) => {
				choices[provider.id] = provider.selectTitle;
				return choices;
			}, {}),
			value: selectedProvider,
			isCheckbox: false,
			isSelect: true,
			isRange: false,
		};

		this.languageProvider = data.providerSelection.value;

		function prepSetting(key) {
			let settingData = game.settings.settings.get(`polyglot.${key}`);
			return {
				value: game.settings.get("polyglot", `${key}`),
				name: settingData.name,
				hint: settingData.hint,
			};
		}

		return {
			data: data,
			languages: prepSetting("Languages"),
			alphabets: prepSetting("Alphabets"),
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find(".polyglot-languageProvider").on("change", (event) => {
			const list = html.find(".polyglot-languages-list")[0];
			const title = html.find(".polyglot-languages-title-notes")[0];
			const warning = html.find(".polyglot-languages-warn")[0];
			if (this.languageProvider == event.target.value) {
				list.style.display = "block";
				title.style.display = "block";
				warning.style.display = "none";
			} else {
				list.style.display = "none";
				title.style.display = "none";
				warning.style.display = "block";
			}
		});
		html.find(".polyglot-alphabet").each(function () {
			const font = this.previousSibling.previousSibling.value; //selectatr's value
			this.style.font = currentLanguageProvider.alphabets[font];
		});
		html.find(".selectatr").on("change", async (event) => {
			const font = event.target.value;
			event.target.nextSibling.nextSibling.style.font = currentLanguageProvider.alphabets[font];
		});
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				currentLanguageProvider.loadAlphabet();
				await game.settings.set("polyglot", "Alphabets", currentLanguageProvider.alphabets);
				await game.settings.set("polyglot", "Languages", currentLanguageProvider.originalTongues);
				this.close();
			}
		});
	}

	/**
	 * Executes on form submission
	 * @param {Event} ev - the form submission event
	 * @param {Object} formData - the form data
	 */
	async _updateObject(ev, formData) {
		const languageProvider = game.settings.get("polyglot", "languageProvider");
		if (languageProvider != formData.languageProvider) {
			await game.settings.set("polyglot", "languageProvider", formData.languageProvider);
			updateLanguageProvider();
			currentLanguageProvider.loadAlphabet();
			await game.settings.set("polyglot", "Alphabets", currentLanguageProvider.alphabets);
			await game.settings.set("polyglot", "Languages", currentLanguageProvider.originalTongues);
		} else {
			let langSettings = game.settings.get("polyglot", "Languages");
			const iterableSettings = formData["language.alphabet"];
			let i = 0;
			for (let lang in langSettings) {
				langSettings[lang] = iterableSettings[i];
				i++;
			}
			currentLanguageProvider.tongues = langSettings;
			await game.settings.set("polyglot", "Languages", langSettings);
		}
	}
}
