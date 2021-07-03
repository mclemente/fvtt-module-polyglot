import { registerSettings } from "./settings.js";

/**
 * Returns the name of the .json file to be read with the alphabets and tongues of the system.
 * 
 * @returns {String}
 */
export function getSystem() {
	let system = "generic";

	if (["aria", "dark-heresy", "dcc", "D35E", "dnd5e", "demonlord", "dsa5", "kryx_rpg", "ose", "sfrpg", "sw5e", "tormenta20", "wfrp4e"].includes(game.system.id)) {
		system = game.system.id;
	}
	else if (["pf1", "pf2e"].includes(game.system.id)) {
		system = "golarion";
	}
	return system;
}

/**
 * Returns the alphabets and tongues of a system.
 * 
 * @returns {Promise<any>}
 */
export async function getSystemResponse() {
	const system = getSystem();
	const response = await fetch(`./modules/polyglot/module/systems/${system}.json`);
	if (response.ok) {
		return response.json();
	}
	throw Error(`Polyglot | Failed to fetch ${system}.json: ${response.status}`);
}

export class Polyglot {
	constructor() {
		this.known_languages = new Set();
		this.literate_languages = new Set();
		this.refresh_timeout = null;
		this.alphabets = { common: '120% Dethek' };
		this.tongues = { _default: 'common' };
	}

	/**
	 * Gets the game system's languages.
	 * 
	 * @returns {object|array}
	 */
	static async getLanguages() {
		const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
		const langs = {};
		switch (game.system.id) {
			case "ose":
				return replaceLanguages ? [] : Object.fromEntries(CONFIG.OSE.languages.map(l => [l, l]));
			case "dark-heresy":
				const specialities = {
					"chapterRunes": "Chapter Runes",
					"chaosMarks": "Chaos Marks",
					"eldar": "Eldar",
					"highGothic": "High Gothic",
					"imperialCodes": "Imperial Codes",
					"lowGothic": "Low Gothic",
					"mercenary": "Mercenary",
					"necrontyr": "Necrontyr",
					"ork": "Ork",
					"tau": "Tau",
					"technaLingua": "Techna-Lingua",
					"underworld": "Underworld",
					"xenosMarkings": "Xenos Markings"
				};
				for (let item in specialities) {
					langs[item] = specialities[item];
				}
				return replaceLanguages ? {} : langs;
			case "dcc":
				for (let item in CONFIG.DCC.languages) {
					langs[item] = game.i18n.localize(CONFIG.DCC.languages[item]);
				}
				return replaceLanguages ? {} : langs;
			case "demonlord":
				const demonlordPack = game.packs.get("demonlord.languages");
				const demonlordItemList = await demonlordPack.getIndex();
				for (let item of demonlordItemList) {
					langs[item.name] = game.i18n.localize(item.name);
				}
				return replaceLanguages ? {} : langs;
			case "dsa5":
				if (game.modules.get("dsa5-core")) {
					const dsa5Pack = game.packs.get("dsa5-core.corespecialabilites");
					const dsa5ItemList = await dsa5Pack.getIndex();
					for (let item of dsa5ItemList) {
						let myRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + '\\s*\\((.+)\\)', 'i');
						let match = item.name.match(myRegex);
						if (match) {
							let key = match[1].trim();
							langs[key] = key;
						}
						else {
							myRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + '\\s*\\((.+)\\)', 'i');
							match = item.name.match(myRegex);
							if (match) {
								let key = match[1].trim();
								langs[key] = key;
							}
						}
					}
				}
				return replaceLanguages ? {} : langs;
			case "pf2e":
				if (replaceLanguages) {
					CONFIG.PF2E.languages = {};
				}
				else {
					for (let lang in CONFIG.PF2E.languages) {
						langs[lang] = game.i18n.localize(CONFIG.PF2E.languages[lang]);
					}
				}
				return langs;
			case "wfrp4e":
				const wfrp4ePack = game.packs.get("wfrp4e-core.skills") || game.packs.get("wfrp4e.basic");
				const wfrp4eItemList = await wfrp4ePack.getIndex();
				for (let item of wfrp4eItemList) {
					let myRegex = new RegExp(game.i18n.localize("POLYGLOT.WFRP4E.LanguageSkills") + '\\s*\\((.+)\\)', 'i');
					const match = item.name.match(myRegex);
					if (match) {
						let key = match[1].trim().toLowerCase();
						langs[key] = key;
					}
				}
				return replaceLanguages ? {} : langs;
			case "tormenta20":
				if (replaceLanguages) {
					CONFIG.T20.idiomas = {};
				}
				return CONFIG.T20.idiomas;
			default:
				if (CONFIG[game.system.id.toUpperCase()]?.languages) {
					if (replaceLanguages)
						CONFIG[game.system.id.toUpperCase()].languages = {};
					return CONFIG[game.system.id.toUpperCase()].languages;
				}
				return [];
		}
	}

	/**
	 * Returns an object or array, based on the game system's own data structure.
	 * 
	 * @returns {object|array}
	 */
	static get languages() {
		return this._languages || {};
	}
	static set languages(val) {
		this._languages = val || {};
	}
	/**
	 * Returns the default language for a character.
	 * If none is set, returns the system's default language, if any.
	 * Otherwise, returns the first language in this.languages (it takes into account if it's an array or a set) or an empty string.
	 */
	static get defaultLanguage() {
		const defaultLang = game.settings.get("polyglot", "defaultLanguage");
		if (defaultLang) {
			if (this.languages[defaultLang.toLowerCase()]) return defaultLang.toLowerCase();
			const inverted = invertObject(this.languages);
			if (inverted[defaultLang]) return inverted[defaultLang];
		}
		if (!game.settings.get("polyglot", "replaceLanguages")) {
			switch (game.system.id) {
				case "dark-heresy":
					return "lowGothic";
				case "dsa5":
					return "Garethi";
				case "sw5e":
					return "basic"
				case "tormenta20":
					return "comum";
				case "wfrp4e":
					return "reikspiel";
			}
			const keys = Object.keys(this.languages);
			if (keys.includes("common")) return "common";
		}
		return this.languages[0] || Object.keys(this.languages)[0] || "";
	}

	/* -------------------------------------------- */
	/*  Hooks	                                    */
	/* -------------------------------------------- */

	/**
	 * Adds the Languages selector to the chatlog.
	 */
	async renderChatLog(chatlog, html, data) {
		await this.setCustomLanguages(game.settings.get("polyglot", "customLanguages"));
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
			try {
				switch (game.system.id) {
					case "aria":
						known_languages.add(game.i18n.localize("ARIA.languages.Common"));
						for (let lang of actor.data.items) {
							if (lang.data.data.language)
								known_languages.add(lang.name.toLowerCase());
						}
						break;
					case "CoC7":
						for (let item of actor.data.items) {
							const match =
								item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOwn") + '\\s*\\((.+)\\)', 'i')
								|| item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageAny") + '\\s*\\((.+)\\)', 'i')
								|| item.name.match(game.i18n.localize("POLYGLOT.COC7.LanguageOther") + '\\s*\\((.+)\\)', 'i');
							// adding only the descriptive language name, not "Language (XYZ)"
							if (match)
								known_languages.add(match[1].trim().toLowerCase());
							else if ([game.i18n.localize("POLYGLOT.COC7.LanguageSpec"), game.i18n.localize("POLYGLOT.COC7.LanguageOwn"), game.i18n.localize("POLYGLOT.COC7.LanguageAny"), game.i18n.localize("POLYGLOT.COC7.LanguageOther"), game.i18n.localize("CoC7.language"), "Language", "Language (Own)", "Language (Other)"].includes(item.data.specialization))
								known_languages.add(item.name.trim().toLowerCase());
						}
						break;
					case "wfrp4e":
						for (let item of actor.data.items) {
							let myRegex = new RegExp(game.i18n.localize("POLYGLOT.WFRP4E.LanguageSkills") + '\\s*\\((.+)\\)', 'i');
							const match = item.name.match(myRegex);
							// adding only the descriptive language name, not "Language (XYZ)"
							if (match)
								known_languages.add(match[1].trim().toLowerCase());
						}
						break;
					case "swade":
						for (let item of actor.data.items) {
							const name = item?.flags?.babele?.originalName || item.name;
							const match = item.name.match(/Language \((.+)\)/i);
							// adding only the descriptive language name, not "Language (XYZ)"
							if (match)
								known_languages.add(match[1].trim().toLowerCase());
						}
						break;
					case "dark-heresy":
						for (let lang in actor.data.data.skills.linguistics.specialities) {
							if (actor.data.data.skills.linguistics.specialities[lang]["advance"] >= 0)
								known_languages.add(lang);
						}
						break;
					case "dcc":
						for (let lang of actor.data.data.details.languages.split(/[,;]/))
							known_languages.add(lang.trim().toLowerCase());
						break;
					case "demonlord":
						for (let item of actor.data.items) {
							if (item.type === "language") {
								if (item.data.speak)
									known_languages.add(item.name);
								if (item.data.read)
									literate_languages.add(item.name);
							}
						}
						break;
					case "dsa5":
						for (let item of actor.data.items) {
							if (item.data.data.category?.value === "language") {
								let myRegex = new RegExp(game.i18n.localize("LocalizedIDs.language") + '\\s*\\((.+)\\)', 'i');
								let match = item.name.match(myRegex);
								if (match) {
									known_languages.add(match[1].trim());
								}
								else {
									myRegex = new RegExp(game.i18n.localize("LocalizedIDs.literacy") + '\\s*\\((.+)\\)', 'i');
									match = item.name.match(myRegex);
									if (match) {
										literate_languages.add(match[1].trim());
									}
								}
							}
						}
						break;
					case "ose":
						for (let lang of actor.data.data.languages.value)
							known_languages.add(lang)
						break;
					case "tormenta20":
						for (let lang of actor.data.data.detalhes.idiomas.value)
							known_languages.add(lang)
						break;
					default:
						// Don't duplicate the value in case it's a not an array
						for (let lang of actor.data.data.traits.languages.value)
							known_languages.add(lang)
						// This condition is needed so an empty language is not loaded
						if (actor.data.data.traits.languages.custom != "") {
							for (let lang of actor.data.data.traits.languages.custom.split(/[,;]/))
								known_languages.add(lang.trim().toLowerCase());
						}
						break;
				}
			} catch (err) {
				// Maybe not dnd5e, pf1 or pf2e or corrupted actor data?
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
		const userLanguages = this.getUserLanguages();
		this.known_languages = userLanguages[0];
		this.literate_languages = userLanguages[1];
		if (this.known_languages.size == 0) {
			if (game.user.isGM)
				this.known_languages = new Set(Object.keys(Polyglot.languages))
			else
				this.known_languages.add(Polyglot.defaultLanguage);
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
			let label = Polyglot.languages[lang] || lang;
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

		let defaultLanguage = Polyglot.defaultLanguage;
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
		const lang = message.getFlag("polyglot", "language") || "";
		if (!lang) return;
		let metadata = html.find(".message-metadata")
		if (!Object.keys(Polyglot.languages).length) await this.setCustomLanguages(game.settings.get("polyglot", "customLanguages"));
		let language = Polyglot.languages[lang] || lang
		const known = this.known_languages.has(lang);
		const runifyGM = game.settings.get("polyglot", "runifyGM");
		const displayTranslated = game.settings.get('polyglot', 'display-translated');
		const hideTranslation = game.settings.get('polyglot', 'hideTranslation');
		if (game.user.isGM && !runifyGM)
			message.polyglot_unknown = false;
		else
			message.polyglot_unknown = !this._isTruespeech(lang) && !known && (game.user.character ? !this.known_languages.has(this.truespeech) && !this.known_languages.has(this.comprehendLanguages) : true);

		let new_content = this.scrambleString(message.data.content, game.settings.get('polyglot', 'useUniqueSalt') ? message.data._id : lang)
		if (displayTranslated && (lang != Polyglot.defaultLanguage || message.polyglot_unknown)) {
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
			const color = known ? "green" : "red";
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
			let lang = ui.chat.element.find("select[name=polyglot-language]").val()
			if (lang != "")
				document.data.update({ "flags.polyglot.language": lang });
		}
	}

	/**
	 * Loads the game system's alphabets and tongues that are set on the polyglot/module/systems folder.
	 */
	async loadLanguages() {
		const settingInfo = await getSystemResponse();
		this.alphabets = settingInfo.alphabets;
		let langSettings = game.settings.get("polyglot", "Languages");
		this.tongues = Object.keys(langSettings).length ? langSettings : settingInfo.tongues;
		if (!game.settings.get("polyglot", "replaceLanguages")) {
			for (let tongue in settingInfo.tongues) {
				if (!(tongue in langSettings)) {
					langSettings[tongue] = settingInfo.tongues[tongue];
				}
			}
			this.tongues = langSettings;
		}
	}

	/**
	 * Registers settings, adjusts the bubble dimensions so the message is displayed correctly,
	 * and loads the current languages set for Comprehend Languages Spells and Tongues Spell settings.
	 */
	setup() {
		this.loadLanguages();
		registerSettings(this);
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
	 * Sets the settings for the Language Settings menu, updates the fonts and set the Custom Languages.
	 */
	ready() {
		if (game.user.isGM) {
			game.settings.set("polyglot", "Languages", this.tongues);
			game.settings.set("polyglot", "Alphabets", this.alphabets);
			this.updateConfigFonts();
			this.setCustomLanguages(game.settings.get("polyglot", "customLanguages"));
		}
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

	async setCustomLanguages(languages) {
		Polyglot.languages = await Polyglot.getLanguages();
		if (languages != "") {
			let langSettings = game.settings.get("polyglot", "Languages");
			for (let lang of languages.split(",")) {
				lang = lang.trim();
				const key = lang.toLowerCase().replace(/ \'/g, "_");
				if (game.system.id === "pf2e") {
					CONFIG.PF2E.languages[key] = lang;
				}
				Polyglot.languages[key] = lang;
				if (!(key in langSettings)) {
					langSettings[key] = this.tongues["_default"];
				}
				if (game.ready && game.user.isGM) game.settings.set("polyglot", "Languages", langSettings);
			}
		}
		this.updateUserLanguages(ui.chat.element);
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
			let conditions = !this._isTruespeech(lang) && !this.known_languages.has(this.comprehendLanguages);
			switch (game.system.id) {
				case "demonlord":
				case "dsa5":
					conditions = conditions && !this.literate_languages.has(lang);
					break;
				default:
					conditions = conditions && !this.known_languages.has(lang);
					break;
			}
			if (conditions) {
				span.title = "????"
				span.textContent = this.scrambleString(span.textContent, game.settings.get('polyglot', 'useUniqueSalt') ? journalSheet._id : lang)
				span.style.font = this._getFontStyle(lang)
			}
		}
	}

	/**
	 * Renders a chat bubble, scrambling its text.
	 * 
	 * @param {Token} token 
	 * @param {*} html 
	 * @param {*} messageContent 
	 * @param {*} emote 
	 */
	chatBubble(token, html, messageContent, { emote }) {
		const message = game.messages.contents.slice(-10).reverse().find(m => m.data.content === messageContent);
		this._bubble = { font: '', message: '' };
		if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
			let lang = message.getFlag("polyglot", "language") || ""
			if (lang != "") {
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
		let langs = Polyglot.languages;
		if (!game.user.isGM) {
			langs = {};
			for (let lang of this.known_languages) {
				langs[lang] = Polyglot.languages[lang];
			}
			for (let lang of this.literate_languages) {
				langs[lang] = Polyglot.languages[lang];
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
		return this.alphabets[this.tongues[lang]] || this.alphabets[this.tongues._default]
	}
}
