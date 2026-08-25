import PolyglotChatBubbles from "./ChatBubbles.js";
import { getFonts } from "./Fonts.js";
import PolyglotHooks from "./hooks.js";
import * as providers from "./providers/_module.js";
import { LanguageProvider } from "./providers/_module.js";
import { providerKeys } from "./providers/_shared.js";
import { addSetting } from "./settings.js";

export class Polyglot {
	constructor() {
		this.knownLanguages = new Set();
		this.literateLanguages = new Set();
		this.refreshTimeout = null;
		this.FONTS = getFonts();
		// TODO consider removing this variable and let LanguageProvider handle it instead
		this.CustomFontSizes = game.settings.get("polyglot", "CustomFontSizes");
		CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, this.FONTS);
		this.runifyGM = game.settings.get("polyglot", "runifyGM");
	}

	api = {
		registerModule: this.#registerModule,
		registerSystem: this.#registerSystem
	};

	provider;

	providers = {};

	tomSelect;

	init() {
		// Assumes the first class in the file is the actual LanguageProvider class. This is better than adding an if-clause in the loop
		const supportedSystems = Object.keys(providers)
			.filter((provider) => provider !== "LanguageProvider")
			.map((provider) => provider.replace("LanguageProvider", ""))
			.join("|");
		const systemsRegex = new RegExp(`^(${supportedSystems})$`);
		let providerString = game.system.id;
		if (!systemsRegex.test(game.system.id)) {
			providerString = providerKeys[game.system.id] || "Generic";
		}

		const providerId = `native${providerString !== "Generic" ? `.${providerString}` : ""}`;
		this.providers[providerId] = new providers[`${providerString}LanguageProvider`](providerId);

		this._enableChatFeatures = game.settings.get("polyglot", "enableChatFeatures");
		if (this._enableChatFeatures) {
			Hooks.on("renderChatInput", PolyglotHooks.renderChatInput);
			Hooks.on("closeChatLog", PolyglotHooks.closeChatLog);
			Hooks.on("preCreateChatMessage", PolyglotHooks.preCreateChatMessage);
			Hooks.on("renderChatMessageHTML", PolyglotHooks.renderChatMessageHTML);
			Hooks.on("createChatMessage", PolyglotHooks.createChatMessage);
			Hooks.on("renderActorDirectoryPF2e", PolyglotHooks.renderActorDirectoryPF2e);
			Hooks.on("vinoPrepareChatDisplayData", PolyglotHooks.vinoPrepareChatDisplayData);
		}
		Hooks.on("updateActor", PolyglotHooks.updateActor);
		Hooks.on("controlToken", PolyglotHooks.controlToken);
		Hooks.on("updateUser", PolyglotHooks.updateUser);
		Hooks.on("updateActiveEffect", PolyglotHooks.updateActiveEffect);
		Hooks.on("getHeaderControlsApplicationV2", PolyglotHooks.getHeaderControlsApplicationV2);
		Hooks.on("renderDocumentSheetV2", PolyglotHooks.renderDocumentSheet);
		Hooks.on("getProseMirrorMenuDropDowns", PolyglotHooks.getProseMirrorMenuDropDowns);

		CONFIG.Canvas.chatBubblesClass = PolyglotChatBubbles;

		Hooks.callAll("polyglot.init", LanguageProvider);

		/** providerIds should always be sorted the same way so this should achieve a stable default. */
		const providerIds = Object.keys(this.providers);
		let defaultValue = providerIds[0];

		const module = providerIds.find((key) => key.startsWith("module."));
		if (module) defaultValue = module;

		const gameSystem = providerIds.find((key) => key.startsWith("system.") || key.includes(game.system.id));
		if (gameSystem) defaultValue = gameSystem;

		addSetting("languageProvider", {
			// Has no name or hint
			config: false,
			type: String,
			default: defaultValue,
			onChange: (s) => {
				this.languageProvider = this.providers[s];
			},
		});

		this.updateProvider();
		this.omniglot = game.settings.get("polyglot", "omniglot");
		this.comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages");
		this.truespeech = game.settings.get("polyglot", "truespeech");
	}

	get chatElement() {
		return ui.sidebar.popouts.chat?.element || ui.chat.element;
	}

	/**
	 * @returns {String}
	 */
	get defaultLanguage() {
		return this.provider.defaultLanguage;
	}

	get omniglot() {
		return this._omniglot.slugify({ replacement: "_" });
	}

	set omniglot(lang) {
		if (lang === this._omniglot) return;
		this.provider.removeLanguage(this._omniglot);
		this.provider.addLanguage(lang);
		this._omniglot = lang;
	}

	get comprehendLanguages() {
		return this._comprehendLanguages.slugify({ replacement: "_" });
	}

	set comprehendLanguages(lang) {
		if (lang === this._comprehendLanguages) return;
		this.provider.removeLanguage(this._comprehendLanguages);
		this.provider.addLanguage(lang);
		this._comprehendLanguages = lang;
	}

	get truespeech() {
		return this._truespeech.slugify({ replacement: "_" });
	}

	set truespeech(lang) {
		if (lang === this._truespeech) return;
		this.provider.removeLanguage(this._truespeech);
		this.provider.addLanguage(lang);
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
			.filter((m) => m.visible)
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
		let spokenLanguages = new Set();
		let writtenLanguages = new Set();

		if (!actors.length) {
			for (const token of canvas?.tokens?.controlled ?? []) {
				if (token.actor) actors.push(token.actor);
			}
			if (game.user.character) actors.push(game.user.character);
		}

		for (let actor of actors) {
			try {
				const [spoken, written] = this.provider.getUserLanguages(actor);
				spokenLanguages = spokenLanguages.union(spoken);
				writtenLanguages = writtenLanguages.union(written);
			} catch(err) {
				console.error(`Polyglot | Failed to get languages from actor "${actor.name}".`, err);
			}
		}

		return [spokenLanguages, writtenLanguages];
	}

	updateUserLanguages() {
		if (game.polyglot.provider.requiresReady && !game.ready) return;
		[this.knownLanguages, this.literateLanguages] = this.getUserLanguages();
		const defaultLanguage = this.defaultLanguage;
		if (this.knownLanguages.size === 0) {
			if (game.user.isGM) this.knownLanguages = new Set(Object.keys(this.provider.languages).sort());
			else this.knownLanguages.add(defaultLanguage);
		} else if (this.knownLanguages.has(this.omniglot)) {
			this.knownLanguages = new Set(Object.keys(this.provider.languages).sort());
		}

		if (!game.polyglot.renderChatLog) return;
		const options = [];
		const optgroups = [
			{ $order: 1, id: "known", name: game.i18n.localize("POLYGLOT.KnownLanguages") },
			{ $order: 2, id: "unknown", name: game.i18n.localize("POLYGLOT.UnknownLanguages") }];
		let ownedActors = [];
		if (game.user.isGM) {
			ownedActors = game.actors.filter((actor) => actor.hasPlayerOwner);
			for (const actor of ownedActors) {
				actor.knownLanguages = this.getUserLanguages([actor])[0];
				if (
					actor.knownLanguages.has(this.omniglot)
					|| actor.knownLanguages.has(this.truespeech)
					|| actor.knownLanguages.has(this.comprehendLanguages)
				) {
					actor.knownLanguages = new Set(Object.keys(this.provider.languages).sort());
				} else if (this.truespeech) {
					actor.knownLanguages.add(this.truespeech);
				}
			}
		}
		const filteredUsers = this.provider.filterUsers(ownedActors);
		for (let lang of this.knownLanguages) {
			if (!this._isTruespeech(lang) && (lang === this.omniglot || lang === this.comprehendLanguages)) {
				continue;
			}
			const option = {
				id: lang,
				group: "known",
				label: this.provider.languages[lang]?.label || lang.capitalize(),
				$order: lang === defaultLanguage ? 1 : 1000 // Sorting Order
			};
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
						option.users = users;
					} else option.group = "unknown";
				} else option.group = "unknown";
			}
			options.push(option);
		}

		const select = this.chatElement.querySelector(".polyglot-lang-select select");
		let selectedLanguage = this.lastSelection || select.value || defaultLanguage;

		if (!this.tomSelect) {
			this.tomSelect = new TomSelect("#polyglot-language", {
				options,
				optgroups,
				labelField: "label",
				valueField: "id",
				optgroupField: "group",
				optgroupLabelField: "name",
				optgroupValueField: "id",
				lockOptgroupOrder: true,
				searchField: ["label"],
				sortField: [{ field: "$order" }, { field: "label" }],
				maxOptions: null,
				plugins: ["optgroup_columns"],

				create: false,
				controlInput: null,
				render: {
					option: (data, escape) => {
						if (data.users) {
							const userList = [];
							for (const user of data.users) {
								const { bgColor, userName, ownedActors } = user;
								const tooltip = `${userName} (${ownedActors})`;
								userList.push(
									`<div style="background-color: ${bgColor};" data-tooltip="${tooltip}" data-tooltip-direction="UP"></div>`,
								);
							}
							return `<div class="flexrow">
								<div>${escape(data.label)}</div>
								<div class="polyglot polyglot-user-list">${userList.join("")}</div>
							</div>`.trim();
						}
						return `<div>${escape(data.label)}</div>`;
					},
					item: (data, escape) => {
						return `<div>${game.i18n.format("POLYGLOT.SpeakingIn", { language: escape(data.label)})}</div>`;
					}
				}
			});
			this.toggleSelector();
		} else {
			this.tomSelect.close();
			this.tomSelect.clearOptions();
			this.tomSelect.addOptions(options);
		}
		if (!this.knows(selectedLanguage)) {
			selectedLanguage = this.knows(defaultLanguage) ? defaultLanguage : [...this.knownLanguages][0];
		}
		this.tomSelect.addItem(selectedLanguage);
	}

	toggleSelector() {
		const select = this.chatElement.querySelector(".polyglot-lang-select");
		if (!game.settings.get("polyglot", "checkbox")) {
			this.tomSelect.disable();
			select.dataset.tooltip = "POLYGLOT.RightClickToEnable";
			select.dataset.tooltipDirection = "LEFT";
		} else {
			this.tomSelect.enable();
			select.dataset.tooltip = "";
			if (game.tooltip.element === select) game.tooltip.deactivate();
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
		const { rng = "default" } = this.provider.languages[lang] ?? {};
		if (rng === "none") return string;
		if (rng === "default") salt = lang;
		// const font = this._getFontStyle(lang).replace(/\d+%\s/g, "");
		const font = this.provider.getLanguageFont(lang);
		const selectedFont = this.provider.fonts[font];
		if (!selectedFont) {
			console.error(`Invalid font style '${font}'`);
			return string;
		}

		const salted_string = string + salt;
		const seed = new foundry.dice.MersenneTwister(this._hashCode(salted_string));
		const regex = game.settings.get("polyglot", "RuneRegex") ? /<[^>]*>|([a-zA-Z\d])/g : /<[^>]*>|(\S)/gu;
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
		return string.replace(regex, (match) => {
			if (match.length > 1) return match;
			const c = characters.charAt(Math.floor(seed.random() * characters.length));
			const upper = Boolean(Math.round(seed.random()));
			return upper ? c.toUpperCase() : c;
		});
	}

	/**
	 * Registers settings, adjusts the bubble dimensions so the message is displayed correctly,
	 * and loads the current languages set for Comprehend Languages Spells and Tongues Spell settings.
	 */
	async ready() {
		async function checkChanges() {
			const alphabetsSetting = game.settings.get("polyglot", "Alphabets");
			const languagesSetting = game.settings.get("polyglot", "Languages");
			const { fonts, languages } = game.polyglot.provider;
			if (
				!foundry.utils.isEmpty(foundry.utils.diffObject(alphabetsSetting, fonts))
				|| !foundry.utils.isEmpty(foundry.utils.diffObject(fonts, alphabetsSetting))
			) {
				await game.settings.set("polyglot", "Alphabets", fonts);
			}
			if (
				!foundry.utils.isEmpty(foundry.utils.diffObject(languagesSetting, languages))
				|| !foundry.utils.isEmpty(foundry.utils.diffObject(languages, languagesSetting))
			) {
				await game.settings.set("polyglot", "Languages", languages);
			}
		}
		if (this.provider.requiresReady) {
			Hooks.once("polyglot.languageProvider.ready", async () => {
				this.updateUserLanguages();
				await checkChanges();
			});
		} else {
			this.updateUserLanguages();
			await checkChanges();
		}
		Hooks.callAll("polyglot.ready", LanguageProvider);
	}

	/* -------------------------------------------- */
	/*  Helpers				                        */
	/* -------------------------------------------- */

	/**
	 * Creates the Header button for Documents.
	 * @param {Document} document
	 * @param {ApplicationHeaderControlsEntry} controls
	 */
	insertHeaderButton(document, controls) {
		document.polyglot ??= {
			runes: false,
			texts: [],
			styles: []
		};
		const { runes, texts, styles } = document.polyglot;
		const IgnoreJournalFontSize = game.settings.get("polyglot", "IgnoreJournalFontSize");
		document.options.actions.polyglotToggleRunes = (ev, target) => {
			ev.preventDefault();
			document.polyglot.runes = !document.polyglot.runes;
			const spans = document.element.querySelectorAll("span.polyglot-journal");
			if (document.polyglot.runes) {
				for (let span of spans) {
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
				for (let span of spans) {
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
				document.polyglot.texts = [];
				document.polyglot.styles = [];
			}
		};
		controls.push({
			action: "polyglotToggleRunes",
			icon: runes ? "fas fa-link" : "fas fa-unlink",
			label: "POLYGLOT.ToggleRunes",
			visible: true
		});
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
				&& !game.polyglot.provider.conditions(lang);
			if (conditions) {
				e.dataset.tooltip = "????";
				e.textContent = game.polyglot.scrambleString(e.textContent, document.id, lang);
				e.style.font = game.polyglot._getFontStyle(lang);
			}
		});
	}

	scrambleSpansV2(document, html) {
		html.querySelectorAll("span.polyglot-journal").forEach((e) => {
			const lang = e.dataset.language;
			if (!lang) return;
			const conditions = !game.polyglot._isTruespeech(lang)
				&& !game.polyglot.isLanguageKnown(game.polyglot.comprehendLanguages)
				&& !game.polyglot.provider.conditions(lang);
			if (conditions) {
				e.dataset.tooltip = "????";
				e.textContent = game.polyglot.scrambleString(e.textContent, document.id, lang);
				e.style.font = game.polyglot._getFontStyle(lang);
			}
		});
	}

	knows(lang) {
		return this.knownLanguages.has(lang);
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
		return this.knows(lang) || this.isLanguageUnderstood(lang);
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
		const langFont = this.provider.getLanguageFont(lang);
		const defaultFont = this.provider.defaultFont;
		const font = this.provider.fonts[langFont] || this.provider.fonts[defaultFont];
		return `${font.fontSize}% ${font.fontFamily}`;
	}

	/* -------------------------------------------- */
	/*  Journal Editor		                        */
	/* -------------------------------------------- */

	getLanguagesForEditor() {
		let langs = this.provider.languages;
		if (!game.user.isGM) {
			langs = {};
			for (let lang of this.knownLanguages) {
				const data = this.provider.languages[lang];
				if (data) {
					langs[lang] = this.provider.languages[lang];
				}
			}
			for (let lang of this.literateLanguages) {
				const data = this.provider.languages[lang];
				if (data) {
					langs[lang] = this.provider.languages[lang];
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
	/*  API				                            */
	/* -------------------------------------------- */

	updateProvider() {
		// If the configured provider is registered use that one. If not use the default provider
		const configuredProvider = game.settings.get("polyglot", "languageProvider");
		const fallbackProvider = game.settings.settings.get("polyglot.languageProvider").default;
		this.provider = this.providers[configuredProvider] || this.providers[fallbackProvider];
	}

	/**
	 * @param {String} moduleId
	 * @param {providers.LanguageProvider} languageProvider
	 */
	#registerModule(moduleId, languageProvider) {
		const module = game.modules.get(moduleId);
		if (!module) {
			console.warn(
				`Polyglot | A module tried to register with the id "${moduleId}". However no active module with this id was found. This api registration call was ignored. If you are the author of that module please check that the id passed to "registerModule" matches the id in your manifest exactly.`,
			);
			return;
		}
		if (moduleId === "polyglot") {
			console.warn(
				`Polyglot | A module tried to register with the id "${moduleId}", which is not allowed. This api registration call was ignored. If you're the author of the module please use the id of your own module as it's specified in your manifest to register to this api.`,
			);
			return;
		}

		this.#register(`module.${module.id}`, languageProvider);
	}

	/**
	 * @param {providers.LanguageProvider} languageProvider
	 */
	#registerSystem(languageProvider) {
		this.#register(`system.${game.system.id}`, languageProvider);
	}

	/**
	 * @param {String} id
	 * @param {providers.LanguageProvider} languageProvider
	 */
	#register(id, languageProvider) {
		const providerInstance = new languageProvider(id);
		this.providers[providerInstance.id] = providerInstance;
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
		return this.provider;
	}

	get languageProvider() {
		return this.provider;
	}
}
