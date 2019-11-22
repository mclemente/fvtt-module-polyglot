class PolyGlot {

	constructor() {
		this.known_languages = [];
		this.refresh_timeout = null;
	}

	renderChatLog(chatlog, html, data) {
		let lang_html = $(`
		<div class="polyglot-lang-select flexrow">
			<label>Language : </label>
			<select name="polyglot-language">
			</select>
		</div>
		`);
		html.find("#chat-controls").after(lang_html)
		this.updateUserLanguages(html)
	}

	updateUser(user, data) {
		if (user.id == game.user.id && data.character !== undefined) {
			this.updateUserLanguages(ui.chat.element)
			this.updateChatMessages()
		}
	}
	controlToken() {
		this.updateUserLanguages(ui.chat.element)
		this.updateChatMessages()
	}
	updateChatMessages() {
		// Delay refresh because switching tokens could cause a controlToken(false) then controlToken(true) very fast
		if (this.refresh_timeout)
			clearTimeout(this.refresh_timeout)
		this.refresh_timeout = setTimeout(this.updateChatMessagesDelayed.bind(this), 500)
	}
	updateChatMessagesDelayed() {
		this.refresh_timeout = null;
		let prev_day_timestamp = new Date() - (24 * 60 * 60 * 1000)
	  
		// Loop in reverse so most recent messages get refreshed first.
		for (let i = game.messages.entities.length - 1; i >= 0; i--) {
			let message = game.messages.entities[i]
			// Only refresh messages from the last 24 hours for performance and for preventing seeing old decrypted messages.
			if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC && message.data.timestamp > prev_day_timestamp) {
				let lang = message.getFlag("polyglot", "language") || ""
				let unknown = !this.known_languages.includes(lang);
				if (unknown != message.polyglot_unknown)
					ui.chat.updateMessage(message)
			}
		}
	}
	updateUserLanguages(html) {
		let actors = [];
		this.known_languages = [];
		for (let token of canvas.tokens.controlledTokens) {
			if (token.actor)
				actors.push(token.actor)
		}
		if (actors.length == 0 && game.user.character)
			actors.push(game.user.character);
		for (let actor of actors) {
			try {
				// Don't duplicate the value in case it's a not an array
				for (let lang of actor.data.data.traits.languages.value)
				this.known_languages.push(lang)
			} catch (err) { 
				// Maybe not dnd5e or corrupted actor data?
			}
		}
		if (this.known_languages.length == 0) {
			if (game.user.isGM)
				this.known_languages = Object.keys(CONFIG.DND5E.languages)
			else
				this.known_languages.push("common");
		}
		let options = ""
		for (let lang of this.known_languages) {
			let label = CONFIG.DND5E.languages[lang] || lang
			options += `<option value="${lang}">${label}</option>`
		}
		html.find(".polyglot-lang-select select").html($(options))
	}
	randomRune() {
		return String.fromCharCode(Math.floor(Math.random() * 0x51) + 0x16A0)
	}
	renderChatMessage(message, html, data) {
		// html and data are swapped on 0.3.x in relation to other render<Application> hooks
		if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
			let lang = message.getFlag("polyglot", "language") || ""
			if (lang != "") {
				let metadata = html.find(".message-metadata")
				let language = CONFIG.DND5E.languages[lang] || lang
				message.polyglot_unknown = !this.known_languages.includes(lang);
				if (!message.polyglot_force && message.polyglot_unknown) {
					let content = html.find(".message-content")
					let new_content = content.text().replace(/\w/g, this.randomRune)
					content.text(new_content)
					message.polyglot_unknown = true;
				}
				let color = message.polyglot_unknown ? "red" : "green";
				metadata.find(".polyglot-message-language").remove()
				let button = $(`<a class="button polyglot-message-language" title="${language}">
									<i class="fas fa-globe" style="color:${color}"></i>
			  					</a>`)
				metadata.append(button)
				if (game.user.isGM) {
					button.click(this._onGlobeClick.bind(this))
				}
			}
		}

	}
	_onGlobeClick(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents('.message');
		const message = Messages.instance.get(li.data("messageId"));
		message.polyglot_force = true;
		ui.chat.updateMessage(message)
	}
	preCreateChatMessage(messages, data, options) {
		if (data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
			let lang = ui.chat.element.find("select[name=polyglot-language]").val()
			if (lang != "")
				mergeObject(data, { "flags.polyglot.language": lang });
		}
	}
}
PolyGlotSingleton = new PolyGlot()

Hooks.on('renderChatLog', PolyGlotSingleton.renderChatLog.bind(PolyGlotSingleton))
Hooks.on('updateUser', PolyGlotSingleton.updateUser.bind(PolyGlotSingleton))
Hooks.on('controlToken', PolyGlotSingleton.controlToken.bind(PolyGlotSingleton))
Hooks.on('preCreateChatMessage', PolyGlotSingleton.preCreateChatMessage.bind(PolyGlotSingleton))
Hooks.on('renderChatMessage', PolyGlotSingleton.renderChatMessage.bind(PolyGlotSingleton))
