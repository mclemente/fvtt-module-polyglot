import { availableLanguageProviders, currentLanguageProvider, updateLanguageProvider } from "./api.js"

export class PolyglotLanguageSettings extends FormApplication {

	constructor(object, options = {}) {
		super(object, options);
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: 'polyglot-language-form',
			title: 'Polyglot Language Settings',
			template: './modules/polyglot/templates/LanguageSettings.hbs',
			classes: ['sheet polyglot-language-settings'],
			width: "fit-content",
			height: "fit-content",
			closeOnSubmit: true
		});
	}

	getData(options) {
		const data = {};
		const selectedProvider = currentLanguageProvider.id;
		// Insert all speed providers into the template data
		data.providers = Object.values(availableLanguageProviders).map(languageProvider => {
			const provider = {}
			provider.id = languageProvider.id
			let dotPosition = provider.id.indexOf(".")
			if (dotPosition === -1)
				dotPosition = provider.id.length
			const type = provider.id.substring(0, dotPosition)
			const id = provider.id.substring(dotPosition + 1)
			if (type === "native") {
				let title = id == game.system.id ? game.system.data.title : id;
				provider.selectTitle = (game.i18n.localize("POLYGLOT.LanguageProvider.choices.native") + " " + title).trim();
			}
			else {
				let name
				if (type === "module") {
					name = game.modules.get(id).data.title
				}
				else {
					name = game.system.data.title
				}
				provider.selectTitle = game.i18n.format(`POLYGLOT.LanguageProvider.choices.${type}`, {name})
			}
			provider.isSelected = provider.id === selectedProvider
			return provider
		})

		data.providerSelection = {
			id: "languageProvider",
			name: game.i18n.localize("POLYGLOT.LanguageProvider.name"),
			hint: game.i18n.localize("POLYGLOT.LanguageProvider.hint"),
			type: String,
			choices: data.providers.reduce((choices, provider) => {
				choices[provider.id] = provider.selectTitle
				return choices
			}, {}),
			value: selectedProvider,
			isCheckbox: false,
			isSelect: true,
			isRange: false,
		}

		function prepSetting(key) {
			let settingData = game.settings.settings.get(`polyglot.${key}`);
			return {
				value: game.settings.get('polyglot', `${key}`),
				name: settingData.name,
				hint: settingData.hint
			};
		}

		return {
			data: data,
			languages: prepSetting('Languages'),
			alphabets: prepSetting('Alphabets')
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find('.polyglot-alphabet').each(function () {
			const font = this.previousSibling.previousSibling.value; //selectatr's value
			this.style.font = currentLanguageProvider.alphabets[font];
		})
		html.find('.selectatr').on('change', async (event) => {
			const font = event.target.value;
			event.target.nextSibling.nextSibling.style.font = currentLanguageProvider.alphabets[font];
		});
		html.find('button').on('click', async (event) => {
			if (event.currentTarget?.dataset?.action === 'reset') {
				game.settings.set("polyglot", "Languages", currentLanguageProvider.tongues);
				window.location.reload();
			}
		});
	}

	/**
	 * Executes on form submission
	 * @param {Event} ev - the form submission event
	 * @param {Object} formData - the form data
	 */
	async _updateObject(ev, formData) {
		let langSettings = game.settings.get("polyglot", "Languages");
		const iterableSettings = formData["language.alphabet"];
		let i = 0;
		for (let lang in langSettings) {
			langSettings[lang] = iterableSettings[i];
			i++;
		}
		currentLanguageProvider.tongues = langSettings;
		game.settings.set("polyglot", "Languages", langSettings);
		game.settings.set("polyglot", "languageProvider", formData.languageProvider);
		updateLanguageProvider();
	}
}