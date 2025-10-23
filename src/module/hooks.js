/* eslint-disable no-unused-vars */
export default class PolyglotHooks {
	/**
	 * Adds the Languages selector to the chatlog.
	 * @returns {void}
	 */
	static renderChatInput(chatlog, elements) {
		const chatMessage = elements["#chat-message"];
		const polyglotSelect = document.querySelector(".polyglot-lang-select");
		if ((!ui.sidebar.expanded && !chatlog.isPopout) || !chatlog.active) {
			if (polyglotSelect) polyglotSelect.hidden = true;
			return game.polyglot.updateUserLanguages();
		} else if (polyglotSelect) {
			polyglotSelect.hidden = false;
			return chatMessage.insertAdjacentElement("beforebegin", polyglotSelect);
		}

		game.polyglot.renderChatLog = true;
		const polyglotDiv = document.createElement("div");
		polyglotDiv.setAttribute("id", "polyglot");
		polyglotDiv.classList.add("polyglot", "polyglot-lang-select", "flexrow");
		polyglotDiv.innerHTML = "<select id='polyglot-language' name='polyglot-language'></select>";
		polyglotDiv.addEventListener("contextmenu", async () => {
			const setting = !game.settings.get("polyglot", "checkbox");
			await game.settings.set("polyglot", "checkbox", setting);
			game.polyglot.toggleSelector();
		});
		chatMessage.insertAdjacentElement("beforebegin", polyglotDiv);
		polyglotDiv.querySelector("select").addEventListener("change", (ev) => {
			const lang = ev.target.value;
			game.polyglot.lastSelection = lang;
		});
		game.polyglot.updateUserLanguages();
	}

	static closeChatLog(chatlog) {
		const polyglotSelect = document.querySelector(".polyglot-lang-select");
		if (!ui.sidebar.expanded && polyglotSelect) polyglotSelect.hidden = true;
	}

	static updateActor(actor, data, options, userId) {
		if (actor.hasPlayerOwner && actor.testUserPermission(game.user, "OWNER")) {
			game.polyglot.updateUserLanguages();
			if (game.polyglot._enableChatFeatures) game.polyglot.updateChatMessages();
		}
	}

	static controlToken() {
		game.polyglot.updateUserLanguages();
		if (game.polyglot._enableChatFeatures) game.polyglot.updateChatMessages();
	}

	/**
	 * Updates the languages in the Languages selector and the messages that are readable by the character.
	 */
	static updateUser(user, data, options, userId) {
		if (user.id === userId && data.character !== undefined) {
			PolyglotHooks.controlToken();
		}
		if (data.flags?.polyglot) {
			game.polyglot.languageProvider.getDefaultLanguage();
		}
	}

	static updateActiveEffect() {
		PolyglotHooks.controlToken();
	}

	/**
	 * Adds the selected language to the message's flag.
	 * @param {ChatMessage} message
	 * @param {Object} data
	 * @param {Object} options
	 * @param {String} userId
	 * @returns {Boolean}
	 */
	static preCreateChatMessage(message, data, options, userId) {
		const isCheckboxDisabled = game.polyglot.tomSelect?.isDisabled ?? true;
		const isMessageLink = game.polyglot._isMessageLink(data.content);
		const isMessageInlineRoll = /\[\[(.*?)\]\]/g.test(data.content);
		// Message preprended by /desc from either Cautious GM Tools or Narrator Tools modules
		const isDescMessage =
			message.flags?.cgmp?.subType === 1
			|| ["description", "narration", "notification"].includes(message.flags?.["narrator-tools"]?.type);
		if (isCheckboxDisabled || isMessageLink || isMessageInlineRoll || isDescMessage) return true;
		if (
			message.style === CONST.CHAT_MESSAGE_STYLES.IC
			|| (message.style === CONST.CHAT_MESSAGE_STYLES.OOC && game.polyglot._allowOOC())
		) {
			let lang = game.polyglot.chatElement.querySelector("select#polyglot-language").value;
			const language = data.lang || data.language;
			if (language) {
				if (game.polyglot.languageProvider.languages[language]) {
					lang = language;
				} else {
					Object.values(game.polyglot.languageProvider.languages).every((l) => {
						if (language === l.label) {
							lang = language;
							return false;
						}
						return true;
					});
				}
			}
			if (lang) {
				message.updateSource({ "flags.polyglot.language": lang });
			}
		}
	}

	/**
	 * Renders the messages, scrambling the text if it is not known by the user (or currently selected character)
	 * and adding the indicators ("Translated From" text and the globe icon).
	 *
	 * @param {ChatMessage} message		The ChatMessage document being rendered
	 * @param {HTMLElement} html 			The pending HTML as a HTMLElement object
	 * @param {Object} data 					The input data provided for template rendering
	 *
	 * @var {Boolean} known				Determines if the actor actually knows the language, rather than being affected by Comprehend Languages or Tongues
	 */
	static async renderChatMessageHTML(message, html, data) {
		const lang = message.getFlag("polyglot", "language");
		if (!lang) return;

		if (game.polyglot.languageProvider.requiresReady && !game.ready) {
			Hooks.once("polyglot.languageProvider.ready", async () => {
				await PolyglotHooks.renderChatMessageHTML(message, html, data);
			});
			return;
		}
		// Skip for inline rolls
		if (!game.polyglot.knownLanguages.size) game.polyglot.updateUserLanguages();
		const metadata = html.querySelector(".message-metadata");
		const language = game.polyglot.languageProvider.languages?.[lang]?.label || lang;
		const known = game.polyglot.isLanguageKnown(lang);
		const understood = game.polyglot.isLanguageUnderstood(lang);
		const isGM = game.user.isGM;
		const runifyGM = game.settings.get("polyglot", "runifyGM");
		const displayTranslated = game.settings.get("polyglot", "display-translated");
		const hideTranslation = game.settings.get("polyglot", "hideTranslation");
		if (isGM && !runifyGM) message.polyglot_unknown = false;
		else {
			message.polyglot_unknown =
				!game.polyglot._isTruespeech(lang) && !known && (game.user.character || isGM ? !understood : true);
		}
		const forceTranslation = message.polyglot_force || !message.polyglot_unknown;
		const messageContent = html.querySelector(".message-content");
		const innerText = messageContent.innerText.trim();

		const content = document.createElement("div");
		content.classList.add("polyglot-original-text");
		content.style.font = game.polyglot._getFontStyle(lang);
		content.innerHTML = game.polyglot.scrambleString(innerText, message.id, lang);

		const translation = document.createElement("div");
		translation.classList.add("polyglot-translation-text");
		translation.setAttribute("data-tooltip", language);
		translation.setAttribute("data-tooltip-direction", "UP");
		translation.innerHTML = message.content;

		if (
			displayTranslated
			&& (lang !== game.polyglot.languageProvider.defaultLanguage || message.polyglot_unknown)
		) {
			messageContent.innerText = "";
			messageContent.append(content);

			if (
				forceTranslation
				|| (!game.polyglot._isTruespeech(lang) && !message.polyglot_unknown && (isGM || !hideTranslation))
			) {
				messageContent.append(translation);
			}
		} else if (!forceTranslation && message.polyglot_unknown) {
			messageContent.empty().append(content);
		}

		if (isGM || ((known || understood) && !hideTranslation)) {
			let color = "red";
			if ((isGM && !runifyGM) || known) color = "green";
			else if (understood) color = "blue";
			const clickable = isGM && (runifyGM || !displayTranslated);
			const button = document.createElement("a");
			button.className = `polyglot-message-language ${clickable ? "" : "unclickable"}`;
			button.innerHTML = `<i class="fas fa-globe" style="color:${color}"></i>`;
			if (isGM || known || game.polyglot._isTruespeech(lang)) {
				button.dataset.tooltip = language;
				button.dataset.tooltipDirection = "LEFT";
			}

			const existing = metadata.querySelector(".polyglot-message-language");
			if (existing) metadata.removeChild(existing);

			metadata.append(button);
			if (clickable) {
				button.addEventListener("click", game.polyglot._onGlobeClick.bind(this));
			}
		}
	}

	/**
	 * This is required for when Polyglot tries to update messages that have no language set.
	 * This is essential for compatibility with modules that create messages (see https://github.com/mclemente/fvtt-module-polyglot/pull/285).
	 * @param {ChatMessage} message
	 * @param {Object} options
	 * @param {String} userId
	 * @returns {Boolean}
	 */
	static createChatMessage(message, options, userId) {
		return !(game.polyglot._isMessageLink(message.content)
			|| (message.style === CONST.CHAT_MESSAGE_STYLES.OOC && !game.polyglot._allowOOC()));
	}

	/**
	 * Adds the scrambling button to the document's header in case user is the owner and scrambles text written in languages.
	 * Special case for Pages due to their ownership working a bit differently.
	 *
	 * @param {Document} journalTextPageSheet		A JournalTextPageSheet document.
	 * @param {*} param1
	 * @param {*} data
	 * @returns
	 */
	static renderDocumentSheet(sheet, html, data) {
		const isOwnerOrGM = sheet.document?.isOwner || game.user.isGM;
		const isEditable = data.editable;
		const isTextSheet = sheet instanceof JournalTextPageSheet;
		const isJQuery = html instanceof jQuery;

		if (isTextSheet && !(sheet.object.parent.isOwner || isOwnerOrGM || isEditable)) {
			if (sheet.document.isOwner) game.polyglot.insertHeaderButton(sheet.object.parent.sheet, html);
			else game.polyglot.scrambleSpans(sheet, html);
		} else if (isJQuery && html.find(".polyglot-journal").length) {
			if (isOwnerOrGM && html.find('[data-engine="prosemirror"]').length) game.polyglot.insertHeaderButton(sheet, html);
			else if (!(isOwnerOrGM || isEditable)) game.polyglot.scrambleSpans(sheet, html);
		} else if (!isJQuery && html.querySelectorAll(".polyglot-journal").length) {
			if (isOwnerOrGM && html.querySelectorAll('[data-engine="prosemirror"]').length) game.polyglot.insertHeaderButton(sheet, html);
			else if (!(isOwnerOrGM || isEditable)) game.polyglot.scrambleSpansV2(sheet, html);
		}
	}

	/**
	 * Renders a journal entry, adding the scrambling button to its header in case user is the document's owner or a GM.
	 *
	 * @param {Document} sheet		A JournalSheet document.
	 * @param {HTMLElement} html
	 */
	static renderJournalSheet(sheet, html) {
		CONFIG.TinyMCE.style_formats.find((f) => f.title === "Polyglot").items = game.polyglot.getLanguagesForEditor();
		if ((sheet.document?.isOwner || game.user.isGM) && sheet.document.pages.size) {
			game.polyglot.insertHeaderButton(sheet, html);
		}
	}

	static getProseMirrorMenuDropDowns(menu, items) {
		if (!items?.format) return;
		items.format.entries.push({
			action: "polyglot",
			title: "Polyglot",
			children: game.polyglot.getLanguagesForEditor()
				.map((l) => {
					return {
						action: l.attributes["data-language"],
						title: l.title,
						mark: menu.schema.marks.span,
						attrs: { class: "polyglot-journal", ...l.attributes },
						cmd: ProseMirror.commands.toggleMark(menu.schema.marks.span, {
							_preserve: {
								class: "polyglot-journal",
								...l.attributes
							}
						})
					};
				})
		});
	}

	// Re-checks the user languages for the GM when activating another party on the Actors sidebar.
	static renderActorDirectoryPF2e(actors, html, data) {
		game.polyglot.updateUserLanguages();
	}

	/**
	 * Scrambles the text of vino messages.
	 * @param {*} chatDisplayData
	 */
	static vinoPrepareChatDisplayData(chatDisplayData) {
		const message = chatDisplayData.message;
		const lang = message.getFlag("polyglot", "language");

		if (lang) {
			const isLanguageUnknown = !game.polyglot.isLanguageknownOrUnderstood(lang);
			message.polyglot_unknown = isLanguageUnknown;
			if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) message.polyglot_unknown = false;
			if (!message.polyglot_force && message.polyglot_unknown) {
				const newContent = game.polyglot.scrambleString(chatDisplayData.text, message.id, lang);
				chatDisplayData.text = newContent;
				chatDisplayData.font = game.polyglot._getFontStyle(lang);
				chatDisplayData.skipAutoQuote = true;
			}
		}
	}
}
