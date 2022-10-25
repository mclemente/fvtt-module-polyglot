import { currentLanguageProvider, registerModule, registerSystem } from "./api.js";
import { FONTS, FONTS_26, LOGOGRAPHICAL_FONTS } from "./Fonts.js";
import { libWrapper } from "./shim.js";

export class Polyglot {
	init() {
		Hooks.on("renderChatLog", this.renderChatLog.bind(this));
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
		libWrapper.register(
			"polyglot",
			"JournalTextPageSheet.prototype.activateEditor",
			(wrapped, target, editorOptions, initialContent) => {
				if (!game.user.isGM) {
					var langs = {};
					for (let lang of this.known_languages) {
						langs[lang] = currentLanguageProvider.languages[lang];
					}
					for (let lang of this.literate_languages) {
						langs[lang] = currentLanguageProvider.languages[lang];
					}
				} else langs = currentLanguageProvider.languages;
				const languages = Object.entries(langs).map(([lang, name]) => {
					return {
						title: name || "",
						inline: "span",
						classes: "polyglot-journal",
						attributes: {
							title: name || "",
							"data-language": lang || "",
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
				if (!editorOptions) editorOptions = {};
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
				return wrapped(target, editorOptions, initialContent);
			},
			"WRAPPER"
		);
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
					var lang = invertObject(currentLanguageProvider.languages)[language] || language;
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
					const unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
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
	known_languages = new Set();
	literate_languages = new Set();
	refresh_timeout = null;
	FONTS = FONTS;
	FONTS_26 = FONTS_26;
	LOGOGRAPHICAL_FONTS = LOGOGRAPHICAL_FONTS;
	CustomFontsSize = game.settings.get("polyglot", "CustomFontSizes");
	registerModule = registerModule;
	registerSystem = registerSystem;

	get chatElement() {
		return ui.sidebar.popouts.chat?.element || ui.chat.element;
	}

	/**
	 * Returns an object or array, based on the game system's own data structure.
	 *
	 * @returns {object|array}
	 */
	get languages() {
		return currentLanguageProvider.languages;
	}
	/**
	 * @returns {String}
	 */
	get defaultLanguage() {
		return currentLanguageProvider.defaultLanguage;
	}
	/**
	 * @returns {LanguageProvider}
	 */
	get LanguageProvider() {
		return currentLanguageProvider;
	}
	/**
	 * @returns {String}
	 */
	get comprehendLanguages() {
		return this._comprehendLanguages;
	}
	/**
	 * @returns {String}
	 */
	get truespeech() {
		return this._truespeech;
	}

	set comprehendLanguages(lang) {
		currentLanguageProvider.addLanguage(lang);
		if (lang == this._comprehendLanguages) return;
		if (this._comprehendLanguages) currentLanguageProvider.removeLanguage(this._comprehendLanguages);
		this._comprehendLanguages = lang.trim().toLowerCase().replace(/ \'/g, "_");
	}

	set truespeech(lang) {
		currentLanguageProvider.addLanguage(lang);
		if (lang == this._truespeech) return;
		currentLanguageProvider.removeLanguage(this._truespeech);
		this._truespeech = lang.trim().toLowerCase().replace(/ \'/g, "_");
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

	/**
	 * Updates the languages in the Languages selector and the messages that are readable by the character.
	 */
	updateUser(user, data) {
		if (user.id == game.user.id && data.character !== undefined) {
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
		if (this.refresh_timeout) clearTimeout(this.refresh_timeout);
		this.refresh_timeout = setTimeout(this.updateChatMessagesDelayed.bind(this), 500);
	}

	/**
	 * Updates the last 100 messages. Loop in reverse so most recent messages get refreshed first.
	 */
	updateChatMessagesDelayed() {
		this.refresh_timeout = null;
		const messages = this.chatElement
			.find(".message")
			.slice(-100)
			.toArray()
			.map((m) => game.messages.get(m.dataset.messageId));
		for (let i = messages.length - 1; i >= 0; i--) {
			let message = messages[i];
			if (message && (message.type == CONST.CHAT_MESSAGE_TYPES.IC || this._isMessageTypeOOC(message.type))) {
				let lang = message.getFlag("polyglot", "language") || "";
				let unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
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

	getUserLanguages(actors = []) {
		let known_languages = new Set();
		let literate_languages = new Set();
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
				[known_languages, literate_languages] = currentLanguageProvider.getUserLanguages(actor);
			} catch (err) {
				console.error(`Polyglot | Failed to get languages from actor "${actor.name}".`, err);
			}
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
		[this.known_languages, this.literate_languages] = this.getUserLanguages();
		if (this.known_languages.size == 0) {
			if (game.user.isGM) this.known_languages = new Set(Object.keys(currentLanguageProvider.languages));
			else this.known_languages.add(currentLanguageProvider.defaultLanguage);
		}
		let options = "";
		let playerCharacters = [];
		if (game.user.isGM) {
			playerCharacters = game.actors.filter((a) => a.hasPlayerOwner);
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
			} else {
				options += `<option value="${lang}">${label}</option>`;
			}
		}
		const select = html.find(".polyglot-lang-select select");
		const prevOption = select.val();
		select.html($(options));

		let defaultLanguage = currentLanguageProvider.defaultLanguage;
		let selectedLanguage = this.lastSelection || prevOption || defaultLanguage;
		if (!this.known_languages.has(selectedLanguage)) selectedLanguage = this.known_languages.has(defaultLanguage) ? defaultLanguage : [...this.known_languages][0];

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
		const font = this._getFontStyle(lang).replace(/\d+%\s/g, "");
		if (game.settings.get("polyglot", "logographicalFontToggle") && this.LOGOGRAPHICAL_FONTS.includes(font)) {
			string = string.substr(0, Math.round(string.length / 2));
		}
		const uniqueSalt = game.settings.get("polyglot", "useUniqueSalt");
		if (uniqueSalt == "c") return string;
		if (uniqueSalt == "a") salt = lang;
		const salted_string = string + salt;
		const rng = new MersenneTwister(this._hashCode(salted_string));
		let characters = "abcdefghijklmnopqrstuvwxyz";
		if (!this.FONTS_26.includes(font)) characters += "0123456789";
		const regex = game.settings.get("polyglot", "RuneRegex") ? /[a-zA-Z\d]/g : /\S/gu;
		return string.replace(regex, () => {
			const c = characters.charAt(Math.floor(rng.random() * characters.length)); //.toString(num)
			const upper = Boolean(Math.round(rng.random()));
			return upper ? c.toUpperCase() : c;
		});
	}

	createChatMessage(chatEntity, _, userId) {
		if (chatEntity.content.startsWith("<") || (chatEntity.type === CONST.CHAT_MESSAGE_TYPES.OOC && !this._allowOOC())) return;
	}
	/**
	 * Renders the messages, scrambling the text if it is not known by the user (or currently selected character)
	 * and adding the indicators ("Translated From" text and the globe icon).
	 *
	 * @param {ChatMessage} message		The ChatMessage document being rendered
	 * @param {JQuery} html 			The pending HTML as a jQuery object
	 * @param {*} data 					The input data provided for template rendering
	 *
	 * @var {Boolean} known				Determines if the actor actually knows the language, rather than being affected by Comprehend Languages or Tongues
	 */
	async renderChatMessage(message, html, data) {
		if (currentLanguageProvider.requiresReady && !game.ready) {
			Hooks.on("polyglot.languageProvider.ready", async () => {
				await this.renderChatMessage(message, html, data);
			});
			return;
		}
		// Skip for inline rolls
		if (/\[\[(.*?)\]\]/g.test(message.content)) return;
		if (!this.known_languages.size) this.updateUserLanguages(this.chatElement);
		const lang = message.getFlag("polyglot", "language") || "";
		if (!lang) return;
		let metadata = html.find(".message-metadata");
		let language = currentLanguageProvider.languages[lang] || lang;
		const known = this.known_languages.has(lang);
		const runifyGM = game.settings.get("polyglot", "runifyGM");
		const displayTranslated = game.settings.get("polyglot", "display-translated");
		const hideTranslation = game.settings.get("polyglot", "hideTranslation");
		if (game.user.isGM && !runifyGM) message.polyglot_unknown = false;
		else
			message.polyglot_unknown =
				!this._isTruespeech(lang) &&
				!known &&
				(game.user.character ? !this.known_languages.has(this.truespeech) && !this.known_languages.has(this.comprehendLanguages) : true);

		let new_content = this.scrambleString(message.content, message.id, lang);
		if (displayTranslated && (lang != currentLanguageProvider.defaultLanguage || message.polyglot_unknown)) {
			let content = html.find(".message-content");
			let translation = message.content;
			let original = $("<div>")
				.addClass("polyglot-original-text")
				.css({ font: this._getFontStyle(lang) })
				.html(new_content);
			$(content).empty().append(original);

			if (message.polyglot_force || !message.polyglot_unknown) {
				if (message.polyglot_force || (!this._isTruespeech(lang) && !message.polyglot_unknown && (game.user.isGM || !hideTranslation))) {
					$(content).append(
						$("<div>")
							.addClass("polyglot-translation-text")
							.attr("title", game.i18n.localize("POLYGLOT.TranslatedFrom") + language)
							.html(translation)
					);
				} else {
					$(content).append($("<div>").addClass("polyglot-translation-text").attr("title", game.i18n.localize("POLYGLOT.Translation")).html(translation));
				}
			}
		} else if (!message.polyglot_force && message.polyglot_unknown) {
			let content = html.find(".message-content");
			content.text(new_content);
			content[0].style.font = this._getFontStyle(lang);
			message.polyglot_unknown = true;
		}

		if (game.user.isGM || (known && !hideTranslation)) {
			const color = (game.user.isGM && !runifyGM) || known ? "green" : "red";
			metadata.find(".polyglot-message-language").remove();
			const title = game.user.isGM || known ? `title="${language}"` : "";
			let button = $(`<a class="button polyglot-message-language" ${title}>
				<i class="fas fa-globe" style="color:${color}"></i>
			</a>`);
			metadata.append(button);
			if (game.user.isGM && (runifyGM || !displayTranslated)) {
				button.click(this._onGlobeClick.bind(this));
			}
		}
	}

	/**
	 * Adds the selected language to the message's flag.
	 * Since FVTT 0.8, it has to use Document#Update instead of Document#SetFlag because Document#SetFlag can't be called during the preCreate stage.
	 *
	 * @param {*} document
	 * @param {*} data
	 * @param {*} options
	 * @param {*} userId
	 */
	preCreateChatMessage(document, data, options, userId) {
		if (data.type == CONST.CHAT_MESSAGE_TYPES.IC || (this._allowOOC() && this._isMessageTypeOOC(data.type))) {
			if (data.lang) {
				const invertedLanguages = invertObject(currentLanguageProvider.languages);
				if (currentLanguageProvider.languages[data.lang]) var lang = data.lang;
				else if (invertedLanguages[data.lang]) lang = invertedLanguages[data.lang];
			} else if (!lang) lang = this.chatElement.find("select[name=polyglot-language]").val();
			if (lang) document.updateSource({ "flags.polyglot.language": lang });
		}
	}

	/**
	 * Registers settings, adjusts the bubble dimensions so the message is displayed correctly,
	 * and loads the current languages set for Comprehend Languages Spells and Tongues Spell settings.
	 */
	ready() {
		this.comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages");
		this.truespeech = game.settings.get("polyglot", "truespeech");
		this.updateConfigFonts(game.settings.get("polyglot", "exportFonts"));
		if (currentLanguageProvider.requiresReady) {
			Hooks.on("polyglot.languageProvider.ready", () => {
				this.updateUserLanguages(this.chatElement);
				game.settings.set("polyglot", "Alphabets", currentLanguageProvider.alphabets);
				game.settings.set("polyglot", "Languages", currentLanguageProvider.tongues);
			});
		} else {
			game.settings.set("polyglot", "Alphabets", currentLanguageProvider.alphabets);
			game.settings.set("polyglot", "Languages", currentLanguageProvider.tongues);
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
		if (journalTextPageSheet.object.parent.isOwner || game.user.isGM) return;
		else if (journalTextPageSheet.document.isOwner) {
			const toggleButton = this.createJournalButton(journalTextPageSheet);
			header
				.closest(".app")
				.querySelectorAll(".polyglot-button")
				.forEach(function (container) {
					if (!container.innerHTML) {
						container.remove();
					}
				});
			const titleElement = header.closest(".app").querySelector(".window-title");
			toggleButton.insertAfter(titleElement);
		} else {
			const spans = section ? section.querySelectorAll("span.polyglot-journal") : header.querySelectorAll("span.polyglot-journal");
			spans.forEach((e) => {
				const lang = e.dataset.language;
				if (!lang) return;
				let conditions = !this._isTruespeech(lang) && !this.known_languages.has(this.comprehendLanguages) && !currentLanguageProvider.conditions(lang);
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

		let lang = message.getFlag("polyglot", "language") || "";
		if (lang != "") {
			const unknown = !this._isTruespeech(lang) && !this.known_languages.has(lang) && !this.known_languages.has(this.comprehendLanguages);
			message.polyglot_unknown = unknown;
			if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) message.polyglot_unknown = false;
			if (!message.polyglot_force && message.polyglot_unknown) {
				const new_content = this.scrambleString(chatDisplayData.text, message.id, lang);
				chatDisplayData.text = new_content;
				chatDisplayData.font = this._getFontStyle(lang);
				chatDisplayData.skipAutoQuote = true;
				message.polyglot_unknown = true;
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
		const texts = [];
		const styles = [];
		const toggleString = "<a class='polyglot-button' title='Polyglot: " + game.i18n.localize("POLYGLOT.ToggleRunes") + "'><i class='fas fa-unlink'></i></a>";
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
					styles.push(span.style.font);
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
					span.style.font = styles[i];
					i++;
				}
			}
		});
		return toggleButton;
	}

	/**
	 * Register fonts so they are available to other elements (such as Drawings).
	 */
	updateConfigFonts(value) {
		if (value) {
			for (let font in game.polyglot.FONTS) {
				game.polyglot.FONTS[font].editor = true;
			}
			game.settings.set("core", "fonts", game.polyglot.FONTS);
		} else {
			const coreFonts = game.settings.get("core", "fonts");
			for (let font in game.polyglot.FONTS) {
				delete coreFonts[font];
			}
			game.settings.set("core", "fonts", coreFonts);
		}
	}

	/**
	 *
	 * @param {String} lang
	 * @returns {Boolean}
	 */
	understands(lang) {
		return this.known_languages.has(lang) || this.known_languages.has(this.comprehendLanguages) || this.known_languages.has(this.truespeech) || this._isTruespeech(lang);
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
		}
		return false;
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
	 * Checks if a message is Out Of Character.
	 * @returns {Boolean}
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
		return currentLanguageProvider.alphabets[currentLanguageProvider.tongues[lang]] || currentLanguageProvider.alphabets[currentLanguageProvider.tongues._default];
	}
}
