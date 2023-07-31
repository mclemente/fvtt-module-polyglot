import { FONTS } from "./Fonts.js";

export class Polyglot {
	init() {
		Hooks.on("renderChatLog", this.renderChatLog.bind(this));
		Hooks.on("updateActor", this.updateActor.bind(this));
		Hooks.on("updateUser", this.updateUser.bind(this));
		Hooks.on("updateActiveEffect", this.controlToken.bind(this));
		Hooks.on("controlToken", this.controlToken.bind(this));
		Hooks.on("preCreateChatMessage", this.preCreateChatMessage.bind(this));
		Hooks.on("createChatMessage", this.createChatMessage.bind(this));
		Hooks.on("renderChatMessage", this.renderChatMessage.bind(this));
		Hooks.on("renderJournalSheet", this.renderJournalSheet.bind(this));
		Hooks.on("renderStorySheet", this.renderJournalSheet.bind(this));
		Hooks.on("renderJournalTextPageSheet", this.renderJournalTextPageSheet.bind(this));
		Hooks.on("vinoPrepareChatDisplayData", this.vinoChatRender.bind(this));
		libWrapper.register("polyglot", "JournalTextPageSheet.prototype.activateEditor", this.activateEditorWrapper.bind(this), "WRAPPER");
		/**
		 * Speak a message as a particular Token, displaying it as a chat bubble
		 * WRAPPER:
		 * 	Scrambles the message's text if a language is present.
		 * @param {Token} token                   The speaking Token
		 * @param {string} message                The spoken message text
		 * @param {ChatBubbleOptions} [options]   Options which affect the bubble appearance
		 * @returns {Promise<jQuery|null>}        A Promise which resolves to the created bubble HTML element, or null
		 */
		libWrapper.register(
			"polyglot",
			"ChatBubbles.prototype.say",
			async (wrapped, token, message, { cssClasses, requireVisible = false, pan = true, language = "" } = {}) => {
				if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) return wrapped(token, message, { cssClasses, requireVisible, pan });
				if (language) {
					var lang = invertObject(this.languageProvider.languages)[language] || language;
					var randomId = foundry.utils.randomID(16);
				} else {
					// Find the message out of the last 10 chat messages, last to first
					const gameMessages = game.messages.contents
						.slice(-10)
						.reverse()
						.find((m) => m.content === message);
					// Message was sent in-character (no /ooc or /emote)
					if (gameMessages?.type === CONST.CHAT_MESSAGE_TYPES.IC) {
						lang = gameMessages.getFlag("polyglot", "language") || "";
						randomId = gameMessages.id;
					}
				}
				if (lang) {
					//Language isn't truespeech, isn't known and user isn't under Comprehend Languages effect
					const unknown = !this.isLanguageknownOrUnderstood(lang);
					if (unknown) {
						message = this.scrambleString(message, randomId, lang);
						document.documentElement.style.setProperty("--polyglot-chat-bubble-font", this._getFontStyle(lang).replace(/\d+%\s/g, ""));
						if (cssClasses == undefined) cssClasses = [];
						cssClasses.push("polyglot-chat-bubble");
					}
				}
				return wrapped(token, message, { cssClasses, requireVisible, pan });
			},
			"WRAPPER"
		);
	}
	constructor() {}
	knownLanguages = new Set();
	literateLanguages = new Set();
	refreshTimeout = null;
	FONTS = FONTS;
	// TODO consider removing this variable and let LanguageProvider handle it instead
	CustomFontSizes = game.settings.get("polyglot", "CustomFontSizes");
	registerModule = null;
	registerSystem = null;

	get chatElement() {
		return ui.sidebar.popouts.chat?.element || ui.chat.element;
	}

	/**
	 * Returns an object or array, based on the game system's own data structure.
	 *
	 * @returns {object|array}
	 */
	get languages() {
		return this.languageProvider.languages;
	}

	/**
	 * @returns {String}
	 */
	get defaultLanguage() {
		return this.languageProvider.defaultLanguage;
	}

	get omniglot() {
		return this._omniglot;
	}

	set omniglot(lang) {
		this.languageProvider.addLanguage(lang);
		lang = lang
			.trim()
			.toLowerCase()
			.replace(/[\s\']/g, "_");
		if (lang === this._omniglot) return;
		if (this._omniglot) this.languageProvider.removeLanguage(this._omniglot);
		this._omniglot = lang;
	}

	get comprehendLanguages() {
		return this._comprehendLanguages;
	}

	set comprehendLanguages(lang) {
		this.languageProvider.addLanguage(lang);
		lang = lang
			.trim()
			.toLowerCase()
			.replace(/[\s\']/g, "_");
		if (lang === this._comprehendLanguages) return;
		if (this._comprehendLanguages) this.languageProvider.removeLanguage(this._comprehendLanguages);
		this._comprehendLanguages = lang;
	}

	get truespeech() {
		return this._truespeech;
	}

	set truespeech(lang) {
		this.languageProvider.addLanguage(lang);
		lang = lang
			.trim()
			.toLowerCase()
			.replace(/[\s\']/g, "_");
		if (lang === this._truespeech) return;
		this.languageProvider.removeLanguage(this._truespeech);
		this._truespeech = lang;
	}

	/* -------------------------------------------- */
	/*  Hooks	                                    */
	/* -------------------------------------------- */

	/**
	 * Adds the Languages selector to the chatlog.
	 */
	renderChatLog(chatlog, html, data) {
		html.find("#chat-controls").after(
			`<div id='polyglot' class='polyglot-lang-select flexrow'><label>${game.i18n.localize(
				"POLYGLOT.LanguageLabel"
			)}:</label><select name='polyglot-language'></select></div>`
		);
		const select = html.find(".polyglot-lang-select select");
		select.change((e) => {
			this.lastSelection = select.val();
		});
		this.updateUserLanguages(html);
	}

	updateActor(actor, data, options, userId) {
		if (actor.hasPlayerOwner) {
			const owner = game.users.find((user) => user.character?.id === actor.id);
			if (game.user.isGM || owner.id == userId) {
				this.updateUserLanguages(this.chatElement);
				this.updateChatMessages();
			}
		}
	}

	/**
	 * Updates the languages in the Languages selector and the messages that are readable by the character.
	 */
	updateUser(user, data, options, userId) {
		if (user.id == userId && data.character !== undefined) {
			this.updateUserLanguages(this.chatElement);
			this.updateChatMessages();
		}
	}

	controlToken() {
		this.updateUserLanguages(this.chatElement);
		this.updateChatMessages();
	}

	/**
	 * Updates the chat messages.
	 * It has a delay because switching tokens could cause a controlToken(false) then controlToken(true) very fast.
	 */
	updateChatMessages() {
		if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
		this.refreshTimeout = setTimeout(this.updateChatMessagesDelayed.bind(this), 500);
	}

	/**
	 * Updates the last 100 messages. Loop in reverse so most recent messages get refreshed first.
	 */
	updateChatMessagesDelayed() {
		this.refreshTimeout = null;
		const messages = this.chatElement
			.find(".message")
			.slice(-100)
			.toArray()
			.map((m) => game.messages.get(m.dataset.messageId));
		for (let i = messages.length - 1; i >= 0; i--) {
			let message = messages[i];
			if (message && (message.type == CONST.CHAT_MESSAGE_TYPES.IC || this._isMessageTypeOOC(message.type))) {
				let lang = message.getFlag("polyglot", "language");
				if (lang) {
					let unknown = !this.isLanguageknownOrUnderstood(lang);
					if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) {
						// Update globe color
						const globe = this.chatElement.find(`.message[data-message-id="${message.id}"] .message-metadata .polyglot-message-language i`);
						const color = unknown ? "red" : "green";
						globe.css({ color });
						unknown = false;
					}
					if (unknown != message.polyglot_unknown) ui.chat.updateMessage(message);
				}
			}
		}
	}

	getUserLanguages(actors = []) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actors.length == 0) {
			if (canvas && canvas.tokens) {
				for (let token of canvas.tokens.controlled) {
					if (token.actor) actors.push(token.actor);
				}
			}
			if (actors.length == 0 && game.user.character) actors.push(game.user.character);
		}
		for (let actor of actors) {
			try {
				[knownLanguages, literateLanguages] = this.languageProvider.getUserLanguages(actor);
			} catch (err) {
				console.error(`Polyglot | Failed to get languages from actor "${actor.name}".`, err);
			}
		}
		return [knownLanguages, literateLanguages];
	}

	/**
	 *
	 * @param {*} html
	 *
	 * @var {Set} this.knownLanguages
	 */
	updateUserLanguages(html) {
		[this.knownLanguages, this.literateLanguages] = this.getUserLanguages();
		const defaultLanguage = this.languageProvider.defaultLanguage;
		if (this.knownLanguages.size == 0) {
			if (game.user.isGM) this.knownLanguages = new Set(Object.keys(this.languageProvider.languages));
			else this.knownLanguages.add(defaultLanguage);
		} else if (this.knownLanguages.has(this.omniglot)) this.knownLanguages = new Set(Object.keys(this.languageProvider.languages));

		let options = "";
		let playerCharacters = [];
		if (game.user.isGM) {
			playerCharacters = game.actors.filter((actor) => actor.hasPlayerOwner);
			for (let i = 0; i < playerCharacters.length; i++) {
				const knownLanguages = this.getUserLanguages([playerCharacters[i]])[0];
				playerCharacters[i].knownLanguages = knownLanguages;
			}
		}
		for (let lang of this.knownLanguages) {
			if (!this._isTruespeech(lang) && (lang === this.omniglot || lang === this.comprehendLanguages)) continue;
			const label = this.languageProvider.languages[lang].label || lang;
			if (game.user.isGM && playerCharacters.length) {
				const actorsThatKnowLang = playerCharacters.filter((actor) => actor.knownLanguages.has(lang));
				if (actorsThatKnowLang.length) {
					const names = actorsThatKnowLang.map((actor) => actor.name).join("\n");
					options += `<option title="${`PCs that know ${label}:\n${names}`}" value="${lang}">${label}</option>`;
					continue;
				}
			}
			options += `<option value="${lang}">${label}</option>`;
		}

		const select = html.find(".polyglot-lang-select select");
		const prevOption = select.val();
		select.html($(options));

		let selectedLanguage = this.lastSelection || prevOption || defaultLanguage;
		if (!this.isLanguageKnown(selectedLanguage)) {
			if (this.isLanguageKnown(defaultLanguage)) selectedLanguage = defaultLanguage;
			else selectedLanguage = [...this.knownLanguages][0];
		}

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
	scrambleString(string, salt, lang) {
		const language = this.languageProvider.languages[lang];
		if (!language) {
			console.warn(`Polyglot | Language "${lang}" doesn't exist on the Language Provider, scrambling has been skipped for this string.`);
			return string;
		}
		const rng = language.rng;
		if (rng == "none") return string;
		if (rng == "default") salt = lang;
		// const font = this._getFontStyle(lang).replace(/\d+%\s/g, "");
		const font = this.languageProvider.getLanguageFont(lang);
		const selectedFont = this.languageProvider.fonts[font];
		if (!selectedFont) {
			console.error(`Invalid font style '${font}'`);
			return string;
		}

		const salted_string = string + salt;
		const seed = new MersenneTwister(this._hashCode(salted_string));
		const regex = game.settings.get("polyglot", "RuneRegex") ? /[a-zA-Z\d]/g : /\S/gu;
		const characters = selectedFont.alphabeticOnly ? "abcdefghijklmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz0123456789";

		// if (selectedFont.replace) {
		// 	Object.keys(selectedFont.replace).forEach((key) => {
		// 		const replaceRegex = new RegExp(key, "g");
		// 		string = string.replace(replaceRegex, selectedFont.replace[key]);
		// 	});
		// }
		if (selectedFont.logographical) {
			string = string.substring(0, Math.round(string.length / 2));
		}
		return string.replace(regex, () => {
			const c = characters.charAt(Math.floor(seed.random() * characters.length));
			const upper = Boolean(Math.round(seed.random()));
			return upper ? c.toUpperCase() : c;
		});
	}

	/**
	 * This is required for when Polyglot tries to update messages that have no language set.
	 * This is essential for compatibility with modules that create messages (see https://github.com/mclemente/fvtt-module-polyglot/pull/285).
	 * @param {ChatMessage} message
	 * @param {Object} options
	 * @param {String} userId
	 * @returns {Boolean}
	 */
	createChatMessage(message, options, userId) {
		if (this._isMessageLink(message.content) || (message.type === CONST.CHAT_MESSAGE_TYPES.OOC && !this._allowOOC())) return false;
	}

	/**
	 * Renders the messages, scrambling the text if it is not known by the user (or currently selected character)
	 * and adding the indicators ("Translated From" text and the globe icon).
	 *
	 * @param {ChatMessage} message		The ChatMessage document being rendered
	 * @param {JQuery} html 			The pending HTML as a jQuery object
	 * @param {Object} data 					The input data provided for template rendering
	 *
	 * @var {Boolean} known				Determines if the actor actually knows the language, rather than being affected by Comprehend Languages or Tongues
	 */
	async renderChatMessage(message, html, data) {
		const lang = message.getFlag("polyglot", "language");
		if (!lang || /\[\[(.*?)\]\]/g.test(message.content)) return;

		if (this.languageProvider.requiresReady && !game.ready) {
			Hooks.once("polyglot.languageProvider.ready", async () => {
				await this.renderChatMessage(message, html, data);
			});
			return;
		}
		// Skip for inline rolls
		if (!this.knownLanguages.size) this.updateUserLanguages(this.chatElement);
		const metadata = html.find(".message-metadata");
		const language = this.languageProvider.languages?.[lang]?.label || lang;
		const known = this.isLanguageKnown(lang);
		const isGM = game.user.isGM;
		const runifyGM = game.settings.get("polyglot", "runifyGM");
		const displayTranslated = game.settings.get("polyglot", "display-translated");
		const hideTranslation = game.settings.get("polyglot", "hideTranslation");
		if (isGM && !runifyGM) message.polyglot_unknown = false;
		else {
			message.polyglot_unknown =
				!this._isTruespeech(lang) && !known && (game.user.character ? !this.isLanguageKnown(this.truespeech) && !this.isLanguageKnown(this.comprehendLanguages) : true);
		}
		const forceTranslation = message.polyglot_force || !message.polyglot_unknown;

		const content = $("<div>")
			.addClass("polyglot-original-text")
			.css({ font: this._getFontStyle(lang) })
			.html(this.scrambleString(message.content, message.id, lang));
		const translation = $("<div>").addClass("polyglot-translation-text").attr("data-tooltip", language).attr("data-tooltip-direction", "UP").html(message.content);

		if (displayTranslated && (lang !== this.languageProvider.defaultLanguage || message.polyglot_unknown)) {
			html.find(".message-content").empty().append(content);
			if (forceTranslation || (!this._isTruespeech(lang) && !message.polyglot_unknown && (isGM || !hideTranslation))) {
				html.find(".message-content").append(translation);
			}
		} else if (!forceTranslation && message.polyglot_unknown) {
			html.find(".message-content").empty().append(content);
			message.polyglot_unknown = true;
		}

		if (isGM || (known && !hideTranslation)) {
			const color = (isGM && !runifyGM) || known ? "green" : "red";
			const title = isGM || known ? `data-tooltip="${language}" data-tooltip-direction="LEFT"` : "";
			const clickable = isGM && (runifyGM || !displayTranslated);
			const button = $(`<a class="button polyglot-message-language ${clickable ? "" : "unclickable"}" ${title}>
				<i class="fas fa-globe" style="color:${color}"></i>
			</a>`);
			metadata.find(".polyglot-message-language").remove();
			metadata.append(button);
			if (clickable) {
				button.click(this._onGlobeClick.bind(this));
			}
		}
	}

	/**
	 * Adds the selected language to the message's flag.
	 * @param {ChatMessage} message
	 * @param {Object} data
	 * @param {Object} options
	 * @param {String} userId
	 * @returns {Boolean}
	 */
	preCreateChatMessage(message, data, options, userId) {
		if (this._isMessageLink(data.content)) return true;
		if (data.type == CONST.CHAT_MESSAGE_TYPES.IC || (this._allowOOC() && this._isMessageTypeOOC(data.type))) {
			if (data.lang) {
				const invertedLanguages = invertObject(this.languageProvider.languages);
				if (this.languageProvider.languages[data.lang]) var lang = data.lang;
				else if (invertedLanguages[data.lang]) lang = invertedLanguages[data.lang];
			} else if (!lang) lang = this.chatElement.find("select[name=polyglot-language]").val();
			if (lang) message.updateSource({ "flags.polyglot.language": lang });
		}
	}

	/**
	 * Registers settings, adjusts the bubble dimensions so the message is displayed correctly,
	 * and loads the current languages set for Comprehend Languages Spells and Tongues Spell settings.
	 */
	ready() {
		this.updateConfigFonts(game.settings.get("polyglot", "exportFonts"));
		if (this.languageProvider.requiresReady) {
			Hooks.on("polyglot.languageProvider.ready", () => {
				this.updateUserLanguages(this.chatElement);
				game.settings.set("polyglot", "Alphabets", this.languageProvider.fonts);
				game.settings.set("polyglot", "Languages", this.languageProvider.languages);
			});
		} else {
			game.settings.set("polyglot", "Alphabets", this.languageProvider.fonts);
			game.settings.set("polyglot", "Languages", this.languageProvider.languages);
		}
	}

	/**
	 * Renders a journal entry, adding the scrambling button to its header in case user is the document's owner or a GM.
	 *
	 * @param {Document} journalSheet		A JournalSheet document.
	 * @param {*} html
	 */
	renderJournalSheet(journalSheet, html) {
		if (journalSheet.document?.isOwner || game.user.isGM) {
			const toggleButton = this.createJournalButton(journalSheet);
			html.closest(".app").find(".polyglot-button").remove();
			const titleElement = html.closest(".app").find(".window-title");
			toggleButton.insertAfter(titleElement);
		}
	}

	/**
	 * Renders a page entry, adds the scrambling button to the journal's header in case user is the page's owner, scrambles the text of strings marked as under some language.
	 *
	 * @param {Document} journalTextPageSheet		A JournalTextPageSheet document.
	 * @param {*} param1
	 * @param {*} data
	 * @returns
	 */
	renderJournalTextPageSheet(journalTextPageSheet, [header, text, section], data) {
		if (journalTextPageSheet.object.parent.isOwner || game.user.isGM || data.editable) return;
		else if (journalTextPageSheet.document.isOwner) {
			const toggleButton = this.createJournalButton(journalTextPageSheet);
			header
				.closest(".app")
				.querySelectorAll(".polyglot-button")
				.forEach((container) => container.remove());
			const titleElement = header.closest(".app").querySelector(".window-title");
			toggleButton.insertAfter(titleElement);
		} else {
			const spans = section ? section.querySelectorAll("span.polyglot-journal") : header.querySelectorAll("span.polyglot-journal");
			spans.forEach((e) => {
				const lang = e.dataset.language;
				if (!lang) return;
				let conditions = !this._isTruespeech(lang) && !this.isLanguageKnown(this.comprehendLanguages) && !this.languageProvider.conditions(lang);
				if (conditions) {
					e.title = "????";
					e.textContent = this.scrambleString(e.textContent, journalTextPageSheet.id, lang);
					e.style.font = this._getFontStyle(lang);
				}
			});
		}
	}

	/**
	 * Scrambles the text of vino messages.
	 * @param {*} chatDisplayData
	 */
	vinoChatRender(chatDisplayData) {
		const message = chatDisplayData.message;
		const lang = message.getFlag("polyglot", "language");

		if (lang) {
			const isLanguageUnknown = !this.isLanguageknownOrUnderstood(lang);
			message.polyglot_unknown = isLanguageUnknown;
			if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) message.polyglot_unknown = false;
			if (!message.polyglot_force && message.polyglot_unknown) {
				const newContent = this.scrambleString(chatDisplayData.text, message.id, lang);
				chatDisplayData.text = newContent;
				chatDisplayData.font = this._getFontStyle(lang);
				chatDisplayData.skipAutoQuote = true;
			}
		}
	}

	/* -------------------------------------------- */
	/*  Helpers				                        */
	/* -------------------------------------------- */

	/**
	 * Creates the Header button for the Journal or Journal's Pages.
	 * @param {Document} document 	A JournalSheet or JournalTextPageSheet
	 * @returns {} toggleButton
	 */
	createJournalButton(document) {
		let runes = false;
		let texts = [];
		let styles = [];
		const toggleString = `<a class='polyglot-button'
			data-tooltip='Polyglot: ${game.i18n.localize("POLYGLOT.ToggleRunes")}'>
			<i class='fas fa-unlink' data-tooltip-direction="UP"></i>
		</a>`;
		const toggleButton = $(toggleString);
		const IgnoreJournalFontSize = game.settings.get("polyglot", "IgnoreJournalFontSize");
		toggleButton.click((ev) => {
			ev.preventDefault();
			let button = ev.currentTarget.firstChild;
			runes = !runes;
			button.className = runes ? "fas fa-link" : "fas fa-unlink";
			const spans = document.element.find("span.polyglot-journal");
			if (runes) {
				for (let span of spans.toArray()) {
					const lang = span.dataset.language;
					if (!lang) continue;
					texts.push(span.textContent);
					if (span.children.length && span.children[0].nodeName == "SPAN") {
						var spanStyle = {
							fontFamily: span.children[0].style.fontFamily,
							fontSize: span.children[0].style.fontSize,
							font: span.children[0].style.font,
						};
					} else {
						spanStyle = {
							fontFamily: span.style.fontFamily,
							fontSize: span.style.fontSize,
							font: span.style.font,
						};
					}
					styles.push(spanStyle);
					span.textContent = this.scrambleString(span.textContent, document.id, lang);
					if (IgnoreJournalFontSize) span.style.fontFamily = this._getFontStyle(lang).replace(/\d+%\s/g, "");
					else span.style.font = this._getFontStyle(lang);
				}
			} else {
				let i = 0;
				for (let span of spans.toArray()) {
					const lang = span.dataset.language;
					if (!lang) continue;
					span.textContent = texts[i];
					if (styles[i].font) {
						span.style.font = styles[i].font;
					} else {
						span.style.fontFamily = styles[i].fontFamily;
						span.style.fontSize = styles[i].fontSize;
					}
					i++;
				}
				texts = [];
				styles = [];
			}
		});
		return toggleButton;
	}

	/**
	 * Register fonts so they are available to other elements (such as Drawings).
	 */
	updateConfigFonts(value) {
		const coreFonts = game.settings.get("core", "fonts");
		if (value) {
			for (let font in game.polyglot.FONTS) {
				game.polyglot.FONTS[font].editor = true;
			}
			game.settings.set("core", "fonts", { ...coreFonts, ...game.polyglot.FONTS });
		} else {
			for (let font in game.polyglot.FONTS) {
				delete coreFonts[font];
			}
			game.settings.set("core", "fonts", coreFonts);
		}
	}

	isLanguageKnown(lang) {
		return this.knownLanguages.has(lang);
	}

	isLanguageUnderstood(lang) {
		return (
			this.knownLanguages.has(this.omniglot) ||
			this.knownLanguages.has(this.comprehendLanguages) ||
			this.knownLanguages.has(this.truespeech) ||
			this._isOmniglot(lang) ||
			this._isTruespeech(lang)
		);
	}

	/**
	 *
	 * @param {String} lang
	 * @returns {Boolean}
	 */
	isLanguageknownOrUnderstood(lang) {
		return this.isLanguageKnown(lang) || this.isLanguageUnderstood(lang);
	}

	/* -------------------------------------------- */
	/*  Internal Helpers	                        */
	/* -------------------------------------------- */

	_allowOOC() {
		switch (game.settings.get("polyglot", "allowOOC")) {
			case "a":
				return true;
			case "b":
				return game.user.isGM;
			case "c":
				return [CONST.USER_ROLES.TRUSTED, CONST.USER_ROLES.PLAYER].includes(game.user.role);
			default:
				return false;
		}
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
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return hash;
	}

	/**
	 * Determines if the message content is a link.
	 * @param {String} messageContent
	 * @returns {Boolean} - Whether the message content is a link to an image file or not.
	 */
	_isMessageLink(messageContent) {
		return /(^(@|<|(http+?)(s\b|\b)|www\.))|(\.(com|jpg|gif|png|bmp|webp)$)/gi.test(messageContent);
	}

	/**
	 * Checks if a message is Out Of Character.
	 * @param {Number} type
	 * @returns {Boolean}
	 */
	_isMessageTypeOOC(type) {
		return [CONST.CHAT_MESSAGE_TYPES.OOC, CONST.CHAT_MESSAGE_TYPES.WHISPER].includes(type);
	}

	_isOmniglot(lang) {
		return lang == this.omniglot;
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
		const li = $(event.currentTarget).parents(".message");
		const message = Messages.instance.get(li.data("messageId"));
		message.polyglot_force = !message.polyglot_force;
		ui.chat.updateMessage(message);
	}

	/**
	 *
	 * @param {string} lang 	A message's polyglot.language flag.
	 * @returns 				The alphabet of the lang or the default alphabet.
	 */
	_getFontStyle(lang) {
		const langFont = this.languageProvider.getLanguageFont(lang);
		const defaultFont = this.languageProvider.defaultFont;
		const font = this.languageProvider.fonts[langFont] || this.languageProvider.fonts[defaultFont];
		return `${font.fontSize}% ${font.fontFamily}`;
	}

	/* -------------------------------------------- */
	/*  Wrappers			                        */
	/* -------------------------------------------- */

	activateEditorWrapper(wrapped, target, editorOptions, initialContent) {
		// let { target, editorOptions, initialContent } = activeEditorLogic(target, editorOptions, initialContent);
		this.activeEditorLogic(editorOptions);
		return wrapped(target, editorOptions, initialContent);
	}

	activeEditorLogic(editorOptions = {}) {
		if (!game.user.isGM) {
			var langs = {};
			for (let lang of this.knownLanguages) {
				langs[lang] = this.languageProvider.languages[lang];
			}
			for (let lang of this.literateLanguages) {
				langs[lang] = this.languageProvider.languages[lang];
			}
		} else langs = this.languageProvider.languages;
		const languages = Object.entries(langs).map(([key, lang]) => {
			return {
				title: lang.label || "",
				inline: "span",
				classes: "polyglot-journal",
				attributes: {
					title: lang.label || "",
					"data-language": key || "",
				},
			};
		});
		if (this.truespeech) {
			const truespeechIndex = languages.findIndex((element) => element.attributes["data-language"] == this.truespeech);
			if (truespeechIndex !== -1) languages.splice(truespeechIndex, 1);
		}
		if (this.comprehendLanguages && !this._isTruespeech(this.comprehendLanguages)) {
			const comprehendLanguagesIndex = languages.findIndex((element) => element.attributes["data-language"] == this.comprehendLanguages);
			if (comprehendLanguagesIndex !== -1) languages.splice(comprehendLanguagesIndex, 1);
		}
		editorOptions.style_formats = [
			...CONFIG.TinyMCE.style_formats,
			{
				title: "Polyglot",
				items: languages,
			},
		];
		editorOptions.formats = {
			removeformat: [
				// Default remove format configuration from tinyMCE
				{
					selector: "b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins",
					remove: "all",
					split: true,
					expand: false,
					block_expand: true,
					deep: true,
				},
				{
					selector: "span",
					attributes: ["style", "class"],
					remove: "empty",
					split: true,
					expand: false,
					deep: true,
				},
				{
					selector: "*",
					attributes: ["style", "class"],
					split: false,
					expand: false,
					deep: true,
				},
				// Add custom config to remove spans from polyglot when needed
				{
					selector: "span",
					classes: "polyglot-journal",
					attributes: ["title", "class", "data-language"],
					remove: "all",
					split: true,
					expand: false,
					deep: true,
				},
			],
		};
	}

	/* -------------------------------------------- */
	/*  Legacy Support	                            */
	/* -------------------------------------------- */

	get known_languages() {
		return this.knownLanguages;
	}

	get literate_languages() {
		return this.literateLanguages;
	}

	get LanguageProvider() {
		return this.languageProvider;
	}
}
