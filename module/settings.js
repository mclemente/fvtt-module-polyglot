/**
 * Shorthand for addSetting.
 * Default data: {scope: "world", config: true}
 * @function addSetting
 * @param {string} key
 * @param {object} data
 */
export function addSetting (key, data) {
	const commonData = {
		scope: 'world',
		config: true
	}
	game.settings.register('polyglot', key, Object.assign(commonData, data))
}

/**
 * Shorthand for addSetting.
 * Default data: {scope: "world", config: false}
 * @param {string} key
 * @param {object} data
 */
export function addMenuSetting (key, data) {
	const commonData = {
		scope: 'world',
		config: false
	}
	game.settings.register('polyglot', key, Object.assign(commonData, data))
}

export class PolyglotChatSettings extends FormApplication {

	constructor (object, options = {}) {
		super(object, options)
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions () {
		return mergeObject(super.defaultOptions, {
			id : 'polyglot-chat-form',
			title : 'Polyglot Chat Settings',
			template : './modules/polyglot/templates/settings.hbs',
			classes : ['sheet'],
			width : 640,
			height : "auto",
			closeOnSubmit: true
		})
	}

	getData (options) {
		function prepSetting (key) {
			let data = game.settings.settings.get(`polyglot.${key}`)
			return {
				value: game.settings.get('polyglot', key),
				name : data.name,
				hint : data.hint
			}
		}

		return {
			displayTranslated : prepSetting('display-translated'),
			hideTranslation : prepSetting('hideTranslation'),
			allowOOC : prepSetting('allowOOC'),
			runifyGM : prepSetting('runifyGM')
		}
	}

	/**
	 * Executes on form submission
	 * @param {Event} e - the form submission event
	 * @param {Object} d - the form data
	 */
	async _updateObject(e,d) {
		const iterableSettings = Object.keys(d);
		for (let key of iterableSettings) {
			game.settings.set('polyglot', key, d[key]);
		}
		// location.reload()
	}
}

export class PolyglotLanguageSettings extends FormApplication {

	constructor (object, options = {}) {
		super(object, options)
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions () {
		return mergeObject(super.defaultOptions, {
			id : 'polyglot-language-form',
			title : 'Polyglot Language Settings',
			template : './modules/polyglot/templates/settings.hbs',
			classes : ['sheet'],
			width : 640,
			height : "auto",
			closeOnSubmit: true
		})
	}

	getData (options) {
		function prepSetting (key) {
			let data = game.settings.settings.get(`polyglot.${key}`)
			return {
				value: game.settings.get('polyglot', key),
				name : data.name,
				hint : data.hint
			}
		}

		return {
			replaceLanguages : prepSetting('replaceLanguages'),
			customLanguages : prepSetting('customLanguages'),
			comprehendLanguages : prepSetting('comprehendLanguages'),
			truespeech : prepSetting('truespeech')
		}
	}

	/**
	 * Executes on form submission
	 * @param {Event} e - the form submission event
	 * @param {Object} d - the form data
	 */
	async _updateObject(e,d) {
		const iterableSettings = Object.keys(d);
		for (let key of iterableSettings) {
			game.settings.set('polyglot', key, d[key]);
		}
	}
}