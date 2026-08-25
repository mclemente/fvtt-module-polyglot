export default class PolyglotChatBubbles extends CONFIG.Canvas.chatBubblesClass {
	async say(token, message, options={}) {
		if (game.user.isGM && !game.polyglot.runifyGM) {
			return super.say(token, message, options);
		}
		const { language = "" } = options;
		let lang = "";
		let randomId = "";
		if (language) {
			randomId = foundry.utils.randomID(16);
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
		} else {
			// Find the message out of the last 10 chat messages, last to first
			const msg = game.messages.contents
				.slice(-10)
				.reverse()
				.find(
					(m) => m.content === message && m.style === CONST.CHAT_MESSAGE_STYLES.IC
				);
			// Message was sent in-character (no /ooc or /emote)
			if (msg) {
				lang = msg.getFlag("polyglot", "language") || "";
				randomId = msg.id;
			}
		}
		if (lang && !game.polyglot.isLanguageknownOrUnderstood(lang)) {
			message = game.polyglot.scrambleString(message, randomId, lang);
			document.documentElement.style.setProperty(
				"--polyglot-chat-bubble-font",
				game.polyglot._getFontStyle(lang).replace(/\d+%\s/g, ""),
			);
			if (options.cssClasses === undefined) options.cssClasses = [];
			options.cssClasses.push("polyglot", "polyglot-chat-bubble");
		}
		return super.say(token, message, options);
	}
}
