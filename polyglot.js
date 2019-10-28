class PolyGlot {

	constructor() {
		this.known_languages = [];
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
		if (user.id == game.user.id && data.character !== undefined)
			this.updateUserLanguages(ui.chat.element)
	}
	updateUserLanguages(html) {
		let actor = game.user.character;
		this.known_languages = [];
		if (actor) {
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
				this.known_languages = Object.keys(CONFIG.languages)
			else
				this.known_languages.push("common");
		}
		let options = ""
		for (let lang of this.known_languages) {
			let label = CONFIG.languages[lang] || lang
			options += `<option value="${lang}">${label}</option>`
		}
		html.find(".polyglot-lang-select select").html($(options))
	}
	randomRune() {
		return String.fromCharCode(Math.floor(Math.random() * 0x51) + 0x16A0)
	}
	renderChatMessage(message, data, html) {
		// html and data are swapped on 0.3.x in relation to other render<Application> hooks
		if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
			let lang = message.getFlag("polyglot", "language") || ""
			if (lang != "") {
				let metadata = html.find(".message-metadata")
				let language = CONFIG.languages[lang] || lang
				let unknown = false;
				if (!this.known_languages.includes(lang)) {
					let content = html.find(".message-content")
					let new_content = content.text().replace(/\w/g, this.randomRune)
					content.text(new_content)
					unknown = true;
				}
				let color = unknown ? "red" : "green";
				metadata.find(".polyglot-message-language").remove()
				metadata.append($(`<a class="button polyglot-message-language" title="${language}">
									 <i class="fas fa-globe" style="color:${color}"></i>
								   </a>`))
			}
		}

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
Hooks.on('preCreateChatMessage', PolyGlotSingleton.preCreateChatMessage.bind(PolyGlotSingleton))
Hooks.on('renderChatMessage', PolyGlotSingleton.renderChatMessage.bind(PolyGlotSingleton))
