/* eslint-disable no-unused-vars */
export default class PolyglotHooks {
	/**
	 * Adds the Languages selector to the chatlog.
	 */
	static renderChatLog(chatlog, html, data) {
		game.polyglot.renderChatLog = true;
		const input = game.settings.get("polyglot", "displayCheckbox")
			? `<input name="polyglot-checkbox" type="checkbox" ${game.settings.get("polyglot", "checkbox") ? "checked" : ""}>`
			: "";
		html.find("#chat-controls").after(
			`<div id='polyglot' class='polyglot polyglot-lang-select flexrow'>
				${input}
				<label>${game.i18n.localize("POLYGLOT.LanguageLabel")}</label>
				<select name='polyglot-language'></select>
			</div>`,
		);
		html.find(".polyglot-lang-select select").change((ev) => {
			const lang = ev.target.value;
			game.polyglot.lastSelection = lang;
		});
		html.find("input[name='polyglot-checkbox']").change((ev) => {
			game.settings.set("polyglot", "checkbox", ev.target.checked);
		});
		game.polyglot.updateUserLanguages(html);
	}

	static updateActor(actor, data, options, userId) {
		if (actor.hasPlayerOwner && actor.testUserPermission(game.user, "OWNER")) {
			game.polyglot.updateUserLanguages(game.polyglot.chatElement);
			game.polyglot.updateChatMessages();
		}
	}

	static controlToken() {
		game.polyglot.updateUserLanguages(game.polyglot.chatElement);
		game.polyglot.updateChatMessages();
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
		const isCheckboxEnabled = !game.settings.get("polyglot", "displayCheckbox")
			|| game.polyglot.chatElement.find("input[name=polyglot-checkbox]").prop("checked");
		const isMessageLink = game.polyglot._isMessageLink(data.content);
		const isMessageInlineRoll = /\[\[(.*?)\]\]/g.test(data.content);
		// Message preprended by /desc from either Cautious GM Tools or Narrator Tools modules
		const isDescMessage =
			message.flags?.cgmp?.subType === 1
			|| ["description", "narration", "notification"].includes(message.flags?.["narrator-tools"]?.type);
		if (!isCheckboxEnabled || isMessageLink || isMessageInlineRoll || isDescMessage) return true;
		if (
			data.type === CONST.CHAT_MESSAGE_TYPES.IC
			|| (game.polyglot._allowOOC() && game.polyglot._isMessageTypeOOC(data.type))
		) {
			let lang = game.polyglot.chatElement.find("select[name=polyglot-language]").val();
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
	 * @param {JQuery} html 			The pending HTML as a jQuery object
	 * @param {Object} data 					The input data provided for template rendering
	 *
	 * @var {Boolean} known				Determines if the actor actually knows the language, rather than being affected by Comprehend Languages or Tongues
	 */
	static async renderChatMessage(message, html, data) {
		const lang = message.getFlag("polyglot", "language");
		if (!lang) return;

		if (game.polyglot.languageProvider.requiresReady && !game.ready) {
			Hooks.once("polyglot.languageProvider.ready", async () => {
				await PolyglotHooks.renderChatMessage(message, html, data);
			});
			return;
		}
		// Skip for inline rolls
		if (!game.polyglot.knownLanguages.size) game.polyglot.updateUserLanguages(game.polyglot.chatElement);
		const metadata = html.find(".message-metadata");
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
		const messageContent = html.find(".message-content");
		const innerText = messageContent.text().trim();

		const content = $("<div>")
			.addClass("polyglot-original-text")
			.css({ font: game.polyglot._getFontStyle(lang) })
			.html(game.polyglot.scrambleString(innerText, message.id, lang));
		const translation = $("<div>")
			.addClass("polyglot-translation-text")
			.attr("data-tooltip", language)
			.attr("data-tooltip-direction", "UP")
			.html(message.content);

		if (
			displayTranslated
			&& (lang !== game.polyglot.languageProvider.defaultLanguage || message.polyglot_unknown)
		) {
			messageContent.empty().append(content);

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
			const title =
				isGM || known || game.polyglot._isTruespeech(lang)
					? `data-tooltip="${language}" data-tooltip-direction="LEFT"`
					: "";
			const clickable = isGM && (runifyGM || !displayTranslated);
			const button = $(`<a class="polyglot-message-language ${clickable ? "" : "unclickable"}" ${title}>
				<i class="fas fa-globe" style="color:${color}"></i>
			</a>`);
			metadata.find(".polyglot-message-language").remove();
			metadata.append(button);
			if (clickable) {
				button.on("click", game.polyglot._onGlobeClick.bind(this));
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
		if (
			game.polyglot._isMessageLink(message.content)
			|| (message.type === CONST.CHAT_MESSAGE_TYPES.OOC && !game.polyglot._allowOOC())
		) return false;
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

		if (isTextSheet && !(sheet.object.parent.isOwner || isOwnerOrGM || isEditable)) {
			if (sheet.document.isOwner) game.polyglot.insertHeaderButton(sheet.object.parent.sheet, html);
			else game.polyglot.scrambleSpans(sheet, html);
		} else if (html.find(".polyglot-journal").length) {
			if (isOwnerOrGM && html.find('[data-engine="prosemirror"]').length) game.polyglot.insertHeaderButton(sheet, html);
			else if (!(isOwnerOrGM || isEditable)) game.polyglot.scrambleSpans(sheet, html);
		}
	}

	/** @see renderDocumentSheet */
	static renderActorSheet(sheet, html, data) {
		PolyglotHooks.renderDocumentSheet(sheet, html, data);
	}

	/** @see renderDocumentSheet */
	static renderItemSheet(sheet, html, data) {
		PolyglotHooks.renderDocumentSheet(sheet, html, data);
	}

	/** @see renderDocumentSheet */
	static renderJournalTextPageSheet(journalTextPageSheet, html, data) {
		PolyglotHooks.renderDocumentSheet(journalTextPageSheet, html, data);
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

	/** @see renderJournalSheet */
	static renderStorySheet(sheet, html) {
		PolyglotHooks.renderJournalSheet(sheet, html);
	}

	static getProseMirrorMenuDropDowns(menu, items) {
		if ("format" in items) {
			if ("format" in items) {
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
		}
	}

	// Re-checks the user languages for the GM when activating another party on the Actors sidebar.
	static renderActorDirectoryPF2e(actors, html, data) {
		game.polyglot.updateUserLanguages(game.polyglot.chatElement);
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
