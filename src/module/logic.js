import { getFonts } from "./Fonts.js";
import PolyglotHooks from "./hooks.js";
import { libWrapper } from "./libs/libWrapper.js";

export class Polyglot {
	constructor() {
		this.knownLanguages = new Set();
		this.literateLanguages = new Set();
		this.refreshTimeout = null;
		this.FONTS = getFonts();
		// TODO consider removing this variable and let LanguageProvider handle it instead
		this.CustomFontSizes = game.settings.get("polyglot", "CustomFontSizes");
		CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, this.FONTS);
	}

	init() {
		for (let hook of Object.getOwnPropertyNames(PolyglotHooks)) {
			if (!["length", "name", "prototype"].includes(hook)) {
				Hooks.on(hook, PolyglotHooks[hook]);
			}
		}
		Polyglot.handleTinyMCE();

		libWrapper.register(
			"polyglot",
			"ChatBubbles.prototype.say",
			async (wrapped, token, message, { cssClasses, requireVisible = false, pan = true, language = "" } = {}) => {
				if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) {
					return wrapped(token, message, { cssClasses, requireVisible, pan });
				}
				let lang = "";
				let randomId = "";
				if (language) {
					randomId = foundry.utils.randomID(16);
					if (this.languageProvider.languages[language]) {
						lang = language;
					} else {
						Object.values(this.languageProvider.languages).every((l) => {
							if (language === l.label) {
								lang = language;
								return false;
							}
							return true;
						});
					}
				} else {
					// Find the message out of the last 10 chat messages, last to first
					const messages = game.messages.contents
						.slice(-10)
						.reverse()
						.find((m) => m.content === message);
					// Message was sent in-character (no /ooc or /emote)
					if (messages?.type === CONST.CHAT_MESSAGE_STYLES.IC) {
						lang = messages.getFlag("polyglot", "language") || "";
						randomId = messages.id;
					}
				}
				if (lang) {
					// Language isn't truespeech, isn't known and user isn't under Comprehend Languages effect
					const unknown = !this.isLanguageknownOrUnderstood(lang);
					if (unknown) {
						message = this.scrambleString(message, randomId, lang);
						document.documentElement.style.setProperty(
							"--polyglot-chat-bubble-font",
							this._getFontStyle(lang).replace(/\d+%\s/g, ""),
						);
						if (cssClasses === undefined) cssClasses = [];
						cssClasses.push("polyglot", "polyglot-chat-bubble");
					}
				}
				return wrapped(token, message, { cssClasses, requireVisible, pan });
			},
			"WRAPPER",
		);
	}

	get chatElement() {
		return ui.sidebar.popouts.chat?.element || ui.chat.element;
	}

	/**
	 * @returns {object}
	 */
	get alphabets() {
		return this.languageProvider.alphabets;
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
		return this._omniglot.trim().toLowerCase().replace(/[\s']/g, "_");
	}

	set omniglot(lang) {
		if (lang === this._omniglot) return;
		this.languageProvider.removeLanguage(this._omniglot);
		this.languageProvider.addLanguage(lang);
		this._omniglot = lang;
	}

	get comprehendLanguages() {
		return this._comprehendLanguages.trim().toLowerCase().replace(/[\s']/g, "_");
	}

	set comprehendLanguages(lang) {
		if (lang === this._comprehendLanguages) return;
		this.languageProvider.removeLanguage(this._comprehendLanguages);
		this.languageProvider.addLanguage(lang);
		this._comprehendLanguages = lang;
	}

	get truespeech() {
		return this._truespeech.trim().toLowerCase().replace(/[\s']/g, "_");
	}

	set truespeech(lang) {
		if (lang === this._truespeech) return;
		this.languageProvider.removeLanguage(this._truespeech);
		this.languageProvider.addLanguage(lang);
		this._truespeech = lang;
	}

	/* -------------------------------------------- */
	/*  Hooks	                                    */
	/* -------------------------------------------- */

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
		const messages = game.messages.contents
			.slice(-CONFIG.ChatMessage.batchSize)
			.map((m) => game.messages.get(m.id));
		for (const message of messages) {
			if (
				message.style === CONST.CHAT_MESSAGE_STYLES.IC
				|| (message.style === CONST.CHAT_MESSAGE_STYLES.OOC && message.getFlag("polyglot", "language"))
			) {
				ui.chat.updateMessage(message);
			}
		}
	}

	getUserLanguages(actors = []) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actors.length === 0) {
			if (canvas && canvas.tokens) {
				for (let token of canvas.tokens.controlled) {
					if (token.actor) actors.push(token.actor);
				}
			}
			if (actors.length === 0 && game.user.character) actors.push(game.user.character);
		}
		for (let actor of actors) {
			try {
				[knownLanguages, literateLanguages] = this.languageProvider.getUserLanguages(actor);
			} catch(err) {
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
	updateUserLanguages() {
		if (game.polyglot.languageProvider.requiresReady && !game.ready) return;
		[this.knownLanguages, this.literateLanguages] = this.getUserLanguages();
		const defaultLanguage = this.defaultLanguage;
		if (this.knownLanguages.size === 0) {
			if (game.user.isGM) this.knownLanguages = new Set(Object.keys(this.languageProvider.languages).sort());
			else this.knownLanguages.add(defaultLanguage);
		} else if (this.knownLanguages.has(this.omniglot)) {
			this.knownLanguages = new Set(Object.keys(this.languageProvider.languages).sort());
		}

		if (!game.polyglot.renderChatLog) return;
		let options = [];
		let ownedActors = [];
		if (game.user.isGM) {
			// GM's list has optgroups separated between known and unknown.
			options.push(...[
				{
					id: "known",
					text: game.i18n.localize("POLYGLOT.KnownLanguages"),
					children: []
				},
				{
					id: "unknown",
					text: game.i18n.localize("POLYGLOT.UnknownLanguages"),
					children: []
				}
			]);
			ownedActors = game.actors.filter((actor) => actor.hasPlayerOwner);
			for (const actor of ownedActors) {
				actor.knownLanguages = this.getUserLanguages([actor])[0];
				if (
					actor.knownLanguages.has(this.omniglot)
					|| actor.knownLanguages.has(this.truespeech)
					|| actor.knownLanguages.has(this.comprehendLanguages)
				) {
					actor.knownLanguages = new Set(Object.keys(this.languageProvider.languages).sort());
				} else if (this.truespeech) {
					actor.knownLanguages.add(this.truespeech);
				}
			}
		}
		const filteredUsers = this.languageProvider.filterUsers(ownedActors);
		for (let lang of this.knownLanguages) {
			if (!this._isTruespeech(lang) && (lang === this.omniglot || lang === this.comprehendLanguages)) {
				continue;
			}
			const label = this.languageProvider.languages[lang]?.label || lang.capitalize();
			if (game.user.isGM) {
				if (ownedActors.length) {
					const usersThatKnowLang = filteredUsers.filter((u) =>
						ownedActors.some((actor) => actor.knownLanguages.has(lang) && actor.testUserPermission(u, "OWNER")),
					);
					const usersWithOwnedActors = usersThatKnowLang.map((u) => {
						const actorsOwnedByUser = ownedActors
							.filter((actor) => actor.knownLanguages.has(lang) && actor.testUserPermission(u, "OWNER"))
							.map((a) => a.name);
						return { ...u, actorsOwnedByUser };
					});
					if (usersWithOwnedActors.length) {
						let users = [];
						for (let user of usersWithOwnedActors) {
							const { name, color, actorsOwnedByUser } = user;
							users.push({ bgColor: color, userName: name, ownedActors: actorsOwnedByUser.join(", ") });
						}
						options[0].children.push({
							id: lang,
							text: label,
							users,
						});
						continue;
					}
				}
				options[1].children.push({
					id: lang,
					text: label,
				});
			} else {
				options.push({
					id: lang,
					text: label,
				});
			}
		}
		// Remove childless lists. Otherwise, sort them by label
		if (game.user.isGM) {
			if (!options[1].children.length) {
				options.pop();
			} else {
				options[1].children.sort((a, b) => a.text.localeCompare(b.text));
			}
			if (!options[0].children.length) {
				options.shift();
			} else {
				options[0].children.sort((a, b) => a.text.localeCompare(b.text));
			}
		} else {
			options.sort((a, b) => a.text.localeCompare(b.text));
		}

		const select = this.chatElement.find(".polyglot-lang-select select");
		const prevOption = select.val();

		select.empty();

		const formatState = (state) => {
			const { id, text, users } = state;
			let $state = text;
			if (id && users) {
				let userList = [];
				for (let user of users) {
					const { bgColor, userName, ownedActors } = user;
					const tooltip = `${userName} (${ownedActors})`;
					userList.push(
						`<div style="background-color: ${bgColor};" data-tooltip="${tooltip}" data-tooltip-direction="UP"></div>`,
					);
				}
				$state = $(
					`<div class="flexrow">
						<div>${text}</div>
						<div class="polyglot polyglot-user-list">${userList.join("")}</div>
					</div>`.trim(),
				);
			}
			return $state;
		};

		// This is needed in case a system or another module already defined select2 under version 4.1, which doesn't accept dropdownCssClass
		try {
			select.select2({
				data: options,
				dropdownCssClass: "polyglot-language",
				templateResult: formatState,
				templateSelection: formatState,
			});
		} catch(error) {
			if (error.message.includes("No select2/compat/dropdownCss")) {
				select.select2({
					data: options,
					templateResult: formatState,
					templateSelection: formatState,
				});
			} else {
				console.error(error);
			}
		} finally {
			$(document).on("mouseenter", ".select2-selection__rendered", function () {
				$(this).removeAttr("title");
			});

			let selectedLanguage = this.lastSelection || prevOption || defaultLanguage;
			if (!this.isLanguageKnown(selectedLanguage)) {
				if (this.isLanguageKnown(defaultLanguage)) selectedLanguage = defaultLanguage;
				else selectedLanguage = [...this.knownLanguages][0];
			}
			select.val(selectedLanguage).trigger("change.select2");
		}
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
		let language = this.languageProvider.languages[lang];
		const rng = language?.rng ?? "default";
		if (rng === "none") return string;
		if (rng === "default") salt = lang;
		// const font = this._getFontStyle(lang).replace(/\d+%\s/g, "");
		const font = this.languageProvider.getLanguageFont(lang);
		const selectedFont = this.languageProvider.fonts[font];
		if (!selectedFont) {
			console.error(`Invalid font style '${font}'`);
			return string;
		}

		const salted_string = string + salt;
		const seed = new foundry.dice.MersenneTwister(this._hashCode(salted_string));
		const regex = game.settings.get("polyglot", "RuneRegex") ? /[a-zA-Z\d]/g : /\S/gu;
		const characters = selectedFont.alphabeticOnly
			? "abcdefghijklmnopqrstuvwxyz"
			: "abcdefghijklmnopqrstuvwxyz0123456789";

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
	 * Registers settings, adjusts the bubble dimensions so the message is displayed correctly,
	 * and loads the current languages set for Comprehend Languages Spells and Tongues Spell settings.
	 */
	ready() {
		function checkChanges() {
			const alphabetsSetting = game.settings.get("polyglot", "Alphabets");
			const languagesSetting = game.settings.get("polyglot", "Languages");
			const { fonts, languages } = game.polyglot.languageProvider;
			if (
				!foundry.utils.isEmpty(foundry.utils.diffObject(alphabetsSetting, fonts))
				|| !foundry.utils.isEmpty(foundry.utils.diffObject(fonts, alphabetsSetting))
			) {
				game.settings.set("polyglot", "Alphabets", fonts);
			}
			if (
				!foundry.utils.isEmpty(foundry.utils.diffObject(languagesSetting, languages))
				|| !foundry.utils.isEmpty(foundry.utils.diffObject(languages, languagesSetting))
			) {
				game.settings.set("polyglot", "Languages", languages);
			}
		}
		if (this.languageProvider.requiresReady) {
			Hooks.once("polyglot.languageProvider.ready", () => {
				this.updateUserLanguages();
				checkChanges();
			});
		} else checkChanges();
	}

	/* -------------------------------------------- */
	/*  Helpers				                        */
	/* -------------------------------------------- */

	/**
	 *
	 * @param {Document} document
	 * @param {HTMLElement} html
	 */
	insertHeaderButton(document, html) {
		const toggleButton = this.createHeaderButton(document);
		html.closest(".app").find(".polyglot-button").remove();
		const titleElement = html.closest(".app").find(".window-title");
		toggleButton.insertAfter(titleElement);
	}

	/**
	 * Creates the Header button for Documents.
	 * @param {Document} document 	A JournalSheet or JournalTextPageSheet
	 * @returns {} toggleButton
	 */
	createHeaderButton(document) {
		let runes = false;
		let texts = [];
		let styles = [];
		const toggleString = `<a class='polyglot-button'
			data-tooltip='Polyglot: ${game.i18n.localize("POLYGLOT.ToggleRunes")}' data-tooltip-direction="UP">
			<i class='fas fa-unlink'></i>
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
					let spanStyle = {
						fontFamily: span.style.fontFamily,
						fontSize: span.style.fontSize,
						font: span.style.font,
					};
					if (span.children.length && span.children[0].nodeName === "SPAN") {
						spanStyle = {
							fontFamily: span.children[0].style.fontFamily,
							fontSize: span.children[0].style.fontSize,
							font: span.children[0].style.font,
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
	 *
	 * @param {Document} document
	 * @param {HTMLElement} html
	 */
	scrambleSpans(document, html) {
		// eslint-disable-next-line no-unused-vars
		const [header, text, section] = html;
		const spans = section ? section.querySelectorAll("span.polyglot-journal") : header.querySelectorAll("span.polyglot-journal");
		spans.forEach((e) => {
			const lang = e.dataset.language;
			if (!lang) return;
			const conditions = !game.polyglot._isTruespeech(lang)
				&& !game.polyglot.isLanguageKnown(game.polyglot.comprehendLanguages)
				&& !game.polyglot.languageProvider.conditions(lang);
			if (conditions) {
				e.title = "????";
				e.textContent = game.polyglot.scrambleString(e.textContent, document.id, lang);
				e.style.font = game.polyglot._getFontStyle(lang);
			}
		});
	}

	isLanguageKnown(lang) {
		return this.knownLanguages.has(lang);
	}

	isLanguageUnderstood(lang) {
		return (
			this.knownLanguages.has(this.omniglot)
			|| this.knownLanguages.has(this.comprehendLanguages)
			|| this.knownLanguages.has(this.truespeech)
			|| this._isOmniglot(lang)
			|| this._isTruespeech(lang)
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
		return /@|https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/gi.test(
			messageContent,
		);
	}

	_isOmniglot(lang) {
		return lang === this.omniglot;
	}

	/**
	 * Returns if the language is the target of the Tongues Spell setting.
	 *
	 * @param {string} lang
	 * @returns {Boolean}
	 */
	_isTruespeech(lang) {
		return lang === this.truespeech;
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
	/*  Journal Editor		                        */
	/* -------------------------------------------- */

	static handleTinyMCE() {
		// Add Polyglot to TinyMCE's menu
		CONFIG.TinyMCE.style_formats.push({
			title: "Polyglot",
			items: {},
		});
		// Add custom config to remove spans from polyglot when needed
		const removeFormat = [
			{
				selector: "span",
				classes: "polyglot-journal",
				attributes: ["title", "class", "data-language"],
				remove: "all",
				split: true,
				expand: false,
				deep: true,
			},
		];
		if (!CONFIG.TinyMCE.formats) {
			CONFIG.TinyMCE.formats = {
				removeformat: removeFormat,
			};
		} else if (!CONFIG.TinyMCE.formats.removeformat) CONFIG.TinyMCE.formats.removeformat = [...removeFormat];
		else CONFIG.TinyMCE.formats.removeformat.push(...removeFormat);
	}

	getLanguagesForEditor() {
		let langs = this.languageProvider.languages;
		if (!game.user.isGM) {
			langs = {};
			for (let lang of this.knownLanguages) {
				const data = this.languageProvider.languages[lang];
				if (data) {
					langs[lang] = this.languageProvider.languages[lang];
				}
			}
			for (let lang of this.literateLanguages) {
				const data = this.languageProvider.languages[lang];
				if (data) {
					langs[lang] = this.languageProvider.languages[lang];
				}
			}
		}
		const languages = Object.entries(langs)
			.filter(([key]) => typeof langs[key] !== "undefined")
			.map(([key, lang]) => {
				return {
					title: lang.label || "",
					inline: "span",
					classes: "polyglot-journal",
					attributes: {
						"data-tooltip": lang.label || "",
						"data-tooltip-direction": "UP",
						"data-language": key || "",
					},
				};
			});
		if (this.truespeech) {
			const truespeechIndex = languages.findIndex(
				(element) => element.attributes["data-language"] === this.truespeech,
			);
			if (truespeechIndex !== -1) languages.splice(truespeechIndex, 1);
		}
		if (this.comprehendLanguages && !this._isTruespeech(this.comprehendLanguages)) {
			const comprehendLanguagesIndex = languages.findIndex(
				(element) => element.attributes["data-language"] === this.comprehendLanguages,
			);
			if (comprehendLanguagesIndex !== -1) languages.splice(comprehendLanguagesIndex, 1);
		}
		return languages;
	}

	/* -------------------------------------------- */
	/*  Legacy Support	                            */
	/* -------------------------------------------- */

	activeEditorLogic() {}

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
