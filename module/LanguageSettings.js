
export class PolyglotLanguageSettings extends FormApplication {

	constructor (object, options = {}) {
		super(object, options);
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions () {
		return mergeObject(super.defaultOptions, {
			id : 'polyglot-death-form',
			title : 'Polyglot Language Settings',
			template : './modules/polyglot/templates/LanguageSettings.hbs',
			classes : ['sheet'],
			width : "auto",
			height : 600,
			closeOnSubmit: true
		});
	}

	getData (options) {

		function prepSetting (key) {
			let data = game.settings.settings.get(`polyglot.${key}`);
			return {
				value: game.settings.get('polyglot',`${key}`),
				name : data.name,
				hint : data.hint
			};
		}

		return {
			languages : prepSetting('Languages'),
			alphabets : prepSetting('Alphabets')
		};
	}
	
	activateListeners(html) {
			super.activateListeners(html);
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
		const iterableSettings = Object.values(formData);
		let i = 0;
		for (let lang in langSettings) {
			langSettings[lang] = iterableSettings[i];
			i++;
		}
	}
}