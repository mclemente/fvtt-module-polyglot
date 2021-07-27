import { currentLanguageProvider } from "./api.js";

/**
 * Returns if the system is one of the systems that were originally supported prior to 1.7.2.
 * 
 * @returns {Boolean}
 */
export function legacyGenericSystem() {
	const systems = [
		"aria", "dark-heresy", "dcc", "D35E", "dnd5e", "demonlord", "dsa5", "kryx_rpg", "ose",
		"pf1", "pf2e", "sfrpg", "shadowrun5e", "sw5e", "tormenta20", "uesrpg-d100", "wfrp4e"
	];
	return systems.includes(game.system.id);
}

export class Polyglot {
	constructor() {
		this.known_languages = new Set();
		this.literate_languages = new Set();
		this.refresh_timeout = null;
	}

	/**
	 * Returns an object or array, based on the game system's own data structure.
	 * 
	 * @returns {object|array}
	 */
	get languages() {
		return currentLanguageProvider.languages;
	}
	get defaultLanguage() {
		return currentLanguageProvider.defaultLanguage;
	}
	get LanguageProvider() {
		return currentLanguageProvider;
	}

	/* -------------------------------------------- */
	/*  Hooks	                                    */
	/* -------------------------------------------- */

	/**
	 * Adds the Languages selector to the chatlog.
	 */
	renderChatLog(chatlog, html, data) {
		html.find("#chat-controls").after(`<div id='polyglot' class='polyglot-lang-select flexrow'><label>${game.i18n.localize("POLYGLOT.LanguageLabel")}:</label><select name='polyglot-language'></select></div>`);
		const select = html.find(".polyglot-lang-select select");
		select.change(e => {
			this.lastSelection = select.val();
		});
		this.updateUserLanguages(html);
	}

	/**
	 * Updates the languages in the Languages selector and the messages that are readable by the character.
	 */
	updateUser(user, data) {
		if (user.id == game.user.id && data.character !== undefined) {
			this.updateUserLanguages(ui.chat.element);
			this.updateChatMessages();
		}
	}

	controlToken() {
		this.updateUserLanguages(ui.chat.element);
		this.updateChatMessages();
	}

	/**
	 * Updates the chat messages.
	 * It has a delay because switching tokens could cause a controlToken(false) then controlToken(true) very fast.
	 */
	updateChatMessages() {
		if (this.refresh_timeout)
			clearTimeout(this.refresh_timeout);
		this.refresh_timeout = setTimeout(this.updateChatMessagesDelayed.bind(this), 500);
	}

	/**
	 * Updates the last 100 messages. Loop in reverse so most recent messages get refreshed first.
	 */
	updateChatMessagesDelayed() {
		this.refresh_timeout = null;
		const messages = ui.chat.element.find('.message').slice(-100).toArray().map(m => game.messages.get(m.dataset.messageId));
		for (let i = messages.length - 1; i >= 0; i--) {
			let message = messages[i];
			if (message && (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC || this._isMessageTypeOOC(message.data.type))) {
				let lang = message.getFlag("polyglot", "language") || "";
				let unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
				if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) {
					// Update globe color
					const globe = ui.chat.element.find(`.message[data-message-id="${message.id}"] .message-metadata .polyglot-message-language i`);
					const color = unknown ? "red" : "green";
					globe.css({ color });
					unknown = false;
				}
				if (unknown != message.polyglot_unknown)
					ui.chat.updateMessage(message);
			}
		}
	}

	getUserLanguages(actors = []) {
		let known_languages = new Set();
		let literate_languages = new Set();
		if (actors.length == 0) {
			if (canvas && canvas.tokens) {
				for (let token of canvas.tokens.controlled) {
					if (token.actor)
						actors.push(token.actor);
				}
			}
			if (actors.length == 0 && game.user.character)
				actors.push(game.user.character);
		}
		for (let actor of actors) {
			[known_languages, literate_languages] = currentLanguageProvider.getUserLanguages(actor);
		}
		return [known_languages, literate_languages];
	}

	/**
	 * 
	 * @param {*} html 
	 * 
	 * @var {Set} this.known_languages
	 */
	updateUserLanguages(html) {
		const userLanguages = this.getUserLanguages();
		this.known_languages = userLanguages[0];
		this.literate_languages = userLanguages[1];
		if (this.known_languages.size == 0) {
			if (game.user.isGM)
				this.known_languages = new Set(Object.keys(currentLanguageProvider.languages))
			else
				this.known_languages.add(currentLanguageProvider.defaultLanguage);
		}
		let options = "";
		let playerCharacters = [];
		if (game.user.isGM) {
			playerCharacters = game.actors.filter(a => a.hasPlayerOwner);
			for (let i = 0; i < playerCharacters.length; i++) {
				let known_languages = this.getUserLanguages([playerCharacters[i]])[0];
				playerCharacters[i].known_languages = known_languages;
			}
		}
		for (let lang of this.known_languages) {
			if (!this._isTruespeech(lang) && lang === this.comprehendLanguages) continue;
			let label = currentLanguageProvider.languages[lang] || lang;
			if (game.user.isGM && playerCharacters.length) {
				let title = `title="PCs that know ${label}:\n`;
				for (let actor of playerCharacters) {
					if (actor.known_languages.has(lang)) {
						title += `${actor.name}\n`;
					}
				}
				title += `"`;
				if (title == `title="PCs that know ${label}:\n"`) title = ``;
				options += `<option ${title.trim()} value="${lang}">${label}</option>`;
			}
			else {
				options += `<option value="${lang}">${label}</option>`;
			}
		}
		const select = html.find(".polyglot-lang-select select");
		const prevOption = select.val();
		select.html($(options));

		let defaultLanguage = currentLanguageProvider.defaultLanguage;
		let selectedLanguage = this.lastSelection || prevOption || defaultLanguage;
		if (!this.known_languages.has(selectedLanguage))
			selectedLanguage = (this.known_languages.has(defaultLanguage) ? defaultLanguage : [...this.known_languages][0]);

		select.val(selectedLanguage);
	}

	/**
	 * Generates a string using alphanumeric characters (0-9a-z)
	 * Use a seeded PRNG (pseudorandom number generator) to get consistent scrambled results.
	 * 
	 * @param {string} string	The message's text.
	 * @param {string} salt		The message's id, if Randomize Runes setting is enabled (to make no two messages equal), or its language.
	 * @return {string}			The message's text with its characters scrambled by the PRNG.
	 */
	scrambleString(string, salt) {
		const salted_string = string + salt;
		const rng = new MersenneTwister(this._hashCode(salted_string));
		return string.replace(/\S/gu, () => {
			const c = Math.floor(rng.random() * 36).toString(36)
			const upper = Boolean(Math.round(rng.random()));
			return upper ? c.toUpperCase() : c;
		});
	}

	/**
     * Renders the messages, scrambling the text if it is not known by the user (or currently selected character)
	 * and adding the indicators ("Translated From" text and the globe icon).
	 * 
	 * @param {ChatMessage} message		The ChatMessage document being rendered
	 * @param {JQuery} html 			The pending HTML as a jQuery object
	 * @param {object} data 			The input data provided for template rendering
	 * 
	 * @var {Boolean} known				Determines if the actor actually knows the language, rather than being affected by Comprehend Languages or Tongues
	 */
	async renderChatMessage(message, html, data) {
		if (!this.known_languages.size) this.updateUserLanguages(ui.chat.element);
		const lang = message.getFlag("polyglot", "language") || "";
		if (!lang) return;
		let metadata = html.find(".message-metadata")
		let language = currentLanguageProvider.languages[lang] || lang
		const known = this.known_languages.has(lang);
		const runifyGM = game.settings.get("polyglot", "runifyGM");
		const displayTranslated = game.settings.get('polyglot', 'display-translated');
		const hideTranslation = game.settings.get('polyglot', 'hideTranslation');
		if (game.user.isGM && !runifyGM)
			message.polyglot_unknown = false;
		else
			message.polyglot_unknown = !this._isTruespeech(lang) && !known && (game.user.character ? !this.known_languages.has(this.truespeech) && !this.known_languages.has(this.comprehendLanguages) : true);

		let new_content = this.scrambleString(message.data.content, game.settings.get('polyglot', 'useUniqueSalt') ? message.data._id : lang)
		if (displayTranslated && (lang != currentLanguageProvider.defaultLanguage || message.polyglot_unknown)) {
			let content = html.find(".message-content");
			let translation = message.data.content;
			let original = $('<div>').addClass('polyglot-original-text').css({ font: this._getFontStyle(lang) }).html(new_content);
			$(content).empty().append(original);

			if (message.polyglot_force || !message.polyglot_unknown) {
				if (message.polyglot_force || (!this._isTruespeech(lang) && !message.polyglot_unknown && (game.user.isGM || !hideTranslation))) {
					$(content).append($('<div>').addClass('polyglot-translation-text').attr('title', game.i18n.localize("POLYGLOT.TranslatedFrom") + language).html(translation));
				}
				else {
					$(content).append($('<div>').addClass('polyglot-translation-text').attr('title', game.i18n.localize("POLYGLOT.Translation")).html(translation));
				}
			}
		}
		else if (!message.polyglot_force && message.polyglot_unknown) {
			let content = html.find(".message-content")
			content.text(new_content)
			content[0].style.font = this._getFontStyle(lang)
			message.polyglot_unknown = true;
		}

		if (game.user.isGM || (known && !hideTranslation)) {
			const color = (game.user.isGM && !runifyGM || known) ? "green" : "red";
			metadata.find(".polyglot-message-language").remove()
			const title = game.user.isGM || known ? `title="${language}"` : ""
			let button = $(`<a class="button polyglot-message-language" ${title}>
				<i class="fas fa-globe" style="color:${color}"></i>
			</a>`)
			metadata.append(button)
			if (game.user.isGM && (runifyGM || !displayTranslated)) {
				button.click(this._onGlobeClick.bind(this))
			}
		}
	}

	/**
	 * Adds the selected language to the message's flag.
	 * Since FVTT 0.8, it has to use Document#Update instead of Document#SetFlag because Document#SetFlag can't be call use during the preCreate stage.
	 * 
	 * @param {*} document 
	 * @param {*} data 
	 * @param {*} options 
	 * @param {*} userId 
	 */
	preCreateChatMessage(document, data, options, userId) {
		let allowOOC = false;
		switch (game.settings.get("polyglot", "allowOOC")) {
			case "a":
				allowOOC = true;
				break;
			case "b":
				allowOOC = game.user.isGM;
				break;
			case "c":
				allowOOC = [CONST.USER_ROLES.TRUSTED, CONST.USER_ROLES.PLAYER].includes(game.user.role);
				break;
		}
		if (data.type == CONST.CHAT_MESSAGE_TYPES.IC || (allowOOC && this._isMessageTypeOOC(data.type))) {
			let lang;
			if (data.lang) {
				const invertedLanguages = invertObject(currentLanguageProvider.languages);
				if (currentLanguageProvider.languages[data.lang]) lang = data.lang;
				else if (invertedLanguages[data.lang]) lang = invertedLanguages[data.lang];
			}
			else if (!lang) lang = ui.chat.element.find("select[name=polyglot-language]").val();
			if (lang)
				document.data.update({ "flags.polyglot.language": lang });
		}
	}

	/**
	 * Registers settings, adjusts the bubble dimensions so the message is displayed correctly,
	 * and loads the current languages set for Comprehend Languages Spells and Tongues Spell settings.
	 */
	setup() {
		ChatBubbles.prototype._getMessageDimensions = (message) => {
			let div = $(`<div class="chat-bubble" style="visibility:hidden;font:${this._bubble.font}">${this._bubble.message || message}</div>`);
			$('body').append(div);
			let dims = {
				width: div[0].clientWidth + 8,
				height: div[0].clientHeight
			};
			div.css({ maxHeight: "none" });
			dims.unconstrained = div[0].clientHeight;
			div.remove();
			return dims;
		}
		this.comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages").trim().toLowerCase().replace(/ \'/g, "_");
		this.truespeech = game.settings.get("polyglot", "truespeech").trim().toLowerCase().replace(/ \'/g, "_");
	}

	/**
	 * Register fonts so they are available to other elements (such as Drawings)
	 * First, remove all our fonts, then add them again if needed.
	 */
	updateConfigFonts() {
		CONFIG.fontFamilies = CONFIG.fontFamilies.filter(f => !Polyglot.FONTS.includes(f));
		if (game.settings.get("polyglot", "exportFonts")) {
			CONFIG.fontFamilies.push(...Polyglot.FONTS);
		}
	}

	/**
	 * Renders a journal entry, scrambling the text of strings marked as under some language.
	 * 
	 * @param {Document} journalSheet 
	 * @param {*} html 
	 * @returns 
	 */
	renderJournalSheet(journalSheet, html) {
		this._addPolyglotEditor(journalSheet);
		if (journalSheet.document.isOwner || game.user.isGM) {
			let runes = false;
			const texts = [];
			const styles = [];
			const toggleString = "<a class='polyglot-button' title='Polyglot: " + game.i18n.localize("POLYGLOT.ToggleRunes") + "'><i class='fas fa-unlink'></i></a>";
			const toggleButton = $(toggleString);
			toggleButton.click(ev => {
				ev.preventDefault();
				let button = ev.currentTarget.firstChild
				runes = !runes
				button.className = runes ? 'fas fa-link' : 'fas fa-unlink';
				const spans = journalSheet.element.find("span.polyglot-journal");
				if (runes) {
					for (let span of spans.toArray()) {
						const lang = span.dataset.language;
						if (!lang) continue;
						texts.push(span.textContent)
						styles.push(span.style.font)
						span.textContent = this.scrambleString(span.textContent, game.settings.get('polyglot', 'useUniqueSalt') ? journalSheet._id : lang)
						span.style.font = this._getFontStyle(lang)
					}
				}
				else {
					let i = 0;
					for (let span of spans.toArray()) {
						const lang = span.dataset.language;
						if (!lang) continue;
						span.textContent = texts[i]
						span.style.font = styles[i]
						i++;
					}
				}
			});
			html.closest('.app').find('.polyglot-button').remove();
			const titleElement = html.closest('.app').find('.window-title');
			toggleButton.insertAfter(titleElement);
			return;
		}
		const spans = journalSheet.element.find("span.polyglot-journal");
		for (let span of spans.toArray()) {
			const lang = span.dataset.language;
			if (!lang) continue;
			let conditions = !this._isTruespeech(lang) && !this.known_languages.has(this.comprehendLanguages) && !currentLanguageProvider.conditions(this, lang);
			if (conditions) {
				span.title = "????"
				span.textContent = this.scrambleString(span.textContent, game.settings.get('polyglot', 'useUniqueSalt') ? journalSheet._id : lang)
				span.style.font = this._getFontStyle(lang)
			}
		}
	}

	/**
	 * Renders a chat bubble, scrambling its text.
	 * It checks for emote.language in case a bubble is sent without a message (e.g. calling canvas.hud.bubbles.say()).
	 * 
	 * @param {Token} token 
	 * @param {*} html 
	 * @param {*} messageContent 
	 * @param {*} emote 
	 */
	chatBubble(token, html, messageContent, { emote }) {
		this._bubble = { font: '', message: '' };
		if (emote.language) {
			let lang = invertObject(currentLanguageProvider.languages)[emote.language] || emote.language || "";
			const unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
			if (game.user.isGM && !game.settings.get("polyglot", "runifyGM"))
				return;
			if (unknown) {
				const content = html.find(".bubble-content")
				const new_content = this.scrambleString(messageContent, game.settings.get('polyglot', 'useUniqueSalt') ? message._id : lang)
				content.text(new_content)
				this._bubble.font = this._getFontStyle(lang)
				this._bubble.message = new_content
				content[0].style.font = this._bubble.font
			}
		}
		else {
			const message = game.messages.contents.slice(-10).reverse().find(m => m.data.content === messageContent);
			if (message?.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
				let lang = message.getFlag("polyglot", "language") || "";
				if (lang) {
					const unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
					message.polyglot_unknown = unknown;
					if (game.user.isGM && !game.settings.get("polyglot", "runifyGM"))
						message.polyglot_unknown = false;
					if (!message.polyglot_force && message.polyglot_unknown) {
						const content = html.find(".bubble-content")
						const new_content = this.scrambleString(message.data.content, game.settings.get('polyglot', 'useUniqueSalt') ? message._id : lang)
						content.text(new_content)
						this._bubble.font = this._getFontStyle(lang)
						this._bubble.message = new_content
						content[0].style.font = this._bubble.font
						message.polyglot_unknown = true;
					}
				}
			}
		}
	}

	/**
	 * Scrambles the text of vino messages.
	 * @param {*} chatDisplayData 
	 */
	vinoChatRender(chatDisplayData) {
		const message = chatDisplayData.message;

		let lang = message.getFlag("polyglot", "language") || ""
		if (lang != "") {
			const unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
			message.polyglot_unknown = unknown;
			if (game.user.isGM && !game.settings.get("polyglot", "runifyGM"))
				message.polyglot_unknown = false;
			if (!message.polyglot_force && message.polyglot_unknown) {
				const new_content = this.scrambleString(chatDisplayData.text, game.settings.get('polyglot', 'useUniqueSalt') ? message._id : lang)
				chatDisplayData.text = new_content;
				chatDisplayData.font = this._getFontStyle(lang)
				chatDisplayData.skipAutoQuote = true;
				message.polyglot_unknown = true;
			}
		}
	}

	/* -------------------------------------------- */
	/*  Internal Helpers	                        */
	/* -------------------------------------------- */

	/**
	 * Adds the Polyglot menu to the Journal's editor.
	 * 
	 * @param {Document} sheet 
	 * @returns 
	 */
	_addPolyglotEditor(sheet) {
		if (sheet._polyglotEditor) return;
		const methodName = sheet.activateEditor ? "activateEditor" : "_createEditor"
		sheet._polyglot_original_activateEditor = sheet[methodName];
		let langs = currentLanguageProvider.languages;
		if (!game.user.isGM) {
			langs = {};
			for (let lang of this.known_languages) {
				langs[lang] = currentLanguageProvider.languages[lang];
			}
			for (let lang of this.literate_languages) {
				langs[lang] = currentLanguageProvider.languages[lang];
			}
		}
		const languages = Object.entries(langs).map(([lang, name]) => {
			return {
				title: name || "",
				inline: 'span',
				classes: 'polyglot-journal',
				attributes: {
					title: name || "",
					"data-language": lang || ""
				}
			};
		});
		if (this.truespeech) {
			const truespeechIndex = languages.findIndex(element => element.attributes["data-language"] == this.truespeech);
			languages.splice(truespeechIndex, 1);
		}
		if (this.comprehendLanguages && !this._isTruespeech(this.comprehendLanguages)) {
			const comprehendLanguagesIndex = languages.findIndex(element => element.attributes["data-language"] == this.comprehendLanguages);
			languages.splice(comprehendLanguagesIndex, 1);
		}
		sheet[methodName] = function (target, editorOptions, initialContent) {
			if (!editorOptions) editorOptions = {};
			editorOptions.style_formats = [
				...CONFIG.TinyMCE.style_formats,
				{
					title: "Polyglot",
					items: languages
				}
			];
			editorOptions.formats = {
				removeformat: [
					// Default remove format configuration from tinyMCE
					{
						selector: 'b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins',
						remove: 'all',
						split: true,
						expand: false,
						block_expand: true,
						deep: true
					},
					{
						selector: 'span',
						attributes: [
							'style',
							'class'
						],
						remove: 'empty',
						split: true,
						expand: false,
						deep: true
					},
					{
						selector: '*',
						attributes: [
							'style',
							'class'
						],
						split: false,
						expand: false,
						deep: true
					},
					// Add custom config to remove spans from polyglot when needed
					{
						selector: 'span',
						classes: 'polyglot-journal',
						attributes: ['title', 'class', 'data-language'],
						remove: 'all',
						split: true,
						expand: false,
						deep: true
					},
				]
			};
			return this._polyglot_original_activateEditor(target, editorOptions, initialContent);
		}
		sheet._polyglotEditor = true;
	}

	/**
	 * Generates a hash based on the input string to be used as a seed.
	 * 
	 * @author https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	 * 
	 * @param {string} string 	The salted string.
	 * @returns {int}
	 */
	_hashCode(string) {
		let hash = 0;
		for (let i = 0; i < string.length; i++) {
			const char = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
		}
		return hash;
	}

	/**
	 * Checks if a message is Out Of Character.
	 */
	_isMessageTypeOOC(type) {
		return [CONST.CHAT_MESSAGE_TYPES.OOC, CONST.CHAT_MESSAGE_TYPES.WHISPER].includes(type);
	}

	/**
	 * Returns if the language is the target of the Tongues Spell setting.
	 * 
	 * @param {string} lang 
	 * @returns {Boolean}
	 */
	_isTruespeech(lang) {
		return lang == this.truespeech;
	}

	_onGlobeClick(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents('.message');
		const message = Messages.instance.get(li.data("messageId"));
		message.polyglot_force = !message.polyglot_force;
		ui.chat.updateMessage(message)
	}

	/**
	 * 
	 * @param {string} lang 	A message's polyglot.language flag.
	 * @returns 				The alphabet of the lang or the default alphabet.
	 */
	_getFontStyle(lang) {
		return currentLanguageProvider.alphabets[currentLanguageProvider.tongues[lang]] || currentLanguageProvider.alphabets[currentLanguageProvider.tongues._default]
	}
}
