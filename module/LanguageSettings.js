import { getSystemResponse } from "./logic.js";

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
			classes: ['sheet'],
			width: 800,
			height: 600,
			closeOnSubmit: true
		});
	}

	getData(options) {

		function prepSetting(key) {
			let data = game.settings.settings.get(`polyglot.${key}`);
			return {
				value: game.settings.get('polyglot', `${key}`),
				name: data.name,
				hint: data.hint
			};
		}

		return {
			languages: prepSetting('Languages'),
			alphabets: prepSetting('Alphabets')
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		const settingInfo = await getSystemResponse();
		html.find('.polyglot-alphabet').each(function () {
			const font = this.previousSibling.previousSibling.value; //selectatr's value
			this.style.font = settingInfo.alphabets[font];
		})
		html.find('.selectatr').on('change', async (event) => {
			const font = event.target.value;
			event.target.nextSibling.nextSibling.style.font = settingInfo.alphabets[font];
		});
		html.find('button').on('click', async (event) => {
			if (event.currentTarget?.dataset?.action === 'reset') {
				await game.settings.set("polyglot", "Languages", {});
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
		const iterableSettings = Object.values(formData)[0];
		let i = 0;
		for (let lang in langSettings) {
			langSettings[lang] = iterableSettings[i];
			i++;
		}
		game.settings.set("polyglot", "Languages", langSettings);
	}
}