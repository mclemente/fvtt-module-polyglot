class PolyGlot {

    constructor() {
        this.known_languages = new Set();
        this.refresh_timeout = null;
        this.alphabets = {common: '120% Dethek'}
        this.tongues = {_default: 'common'}
        this.allowOOC = false;     
    }

    static async getLanguages() {
        switch (game.system.id) {
            case "dnd5e":
            case "dnd5eJP":
            case "pf1":
            case "pf2e":
            case "sfrpg":
                return CONFIG[game.system.id.toUpperCase()].languages;
                break;
            case "ose":
                return Object.fromEntries(CONFIG.OSE.languages.map(l => [l, l]));
                break;
            case "wfrp4e":
                const pack = game.packs.get("wfrp4e.skills") || game.packs.get("wfrp4e.basic");
                const itemList = await pack.getIndex();
                const langs = {};
                for (let item of itemList) {
                    const match = item.name.match(/Language \((.+)\)/i);
                    if (match)
                        langs[match[1]] = match[1];
                }
                return langs;
                break;
            default:
                return [];
                break;
        }
    }
    static get languages() {
        return this._languages || {};
    }
    static set languages(val) {
        this._languages = val || {};
    }
    static get defaultLanguage() {
        const defaultLang = game.settings.get("polyglot", "defaultLanguage");
        if (defaultLang) {
            if (this.languages[defaultLang]) return defaultLang;
            const inverted = invertObject(this.languages);
            if (inverted[defaultLang]) return inverted[defaultLang];
        }
        if (game.system.id === "wfrp4e") return "Reikspiel";
        if (Object.keys(this.languages).includes("common")) return "common";
        return this.languages[0] || "";
    }

   async renderChatLog(chatlog, html, data) {
        await this.setCustomLanguages(game.settings.get("polyglot", "customLanguages"))
        const lang_html = $(`
        <div id="polyglot"  class="polyglot-lang-select flexrow">
                <label>Language : </label>
                <select name="polyglot-language">
                </select>
        </div>
        `);
        html.find("#chat-controls").after(lang_html);
        const select = html.find(".polyglot-lang-select select");
        select.change(e => {
            this.lastSelection = select.val();
        })
        this.updateUserLanguages(html);
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

    _isMessageTypeOOC(type){
        return [CONST.CHAT_MESSAGE_TYPES.OOC, CONST.CHAT_MESSAGE_TYPES.EMOTE, CONST.CHAT_MESSAGE_TYPES.WHISPER].includes(type);
    }

    updateChatMessagesDelayed() {
        this.refresh_timeout = null;
        // Get the last 100 messages
        const messages = ui.chat.element.find('.message').slice(-100).toArray().map(m => game.messages.get(m.dataset.messageId))
        // Loop in reverse so most recent messages get refreshed first.
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i]
            if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC || this._isMessageTypeOOC(message.data.type)) {
                let lang = message.getFlag("polyglot", "language") || ""
                let unknown = !this.known_languages.has(lang);
                if (game.user.isGM && !game.settings.get("polyglot", "runifyGM")) {
                    // Update globe color
                    const globe = ui.chat.element.find(`.message[data-message-id="${message.id}"] .message-metadata .polyglot-message-language i`)
                    const color = unknown ? "red" : "green";
                    globe.css({color});
                    unknown = false;
                }
                if (unknown != message.polyglot_unknown)
                    ui.chat.updateMessage(message)
            }
        }
    }

    updateUserLanguages(html) {
        let actors = [];
        this.known_languages = new Set();
        if (canvas && canvas.tokens) {
            for (let token of canvas.tokens.controlled) {
                if (token.actor)
                    actors.push(token.actor);
            }
        }
        if (actors.length == 0 && game.user.character)
            actors.push(game.user.character);
        for (let actor of actors) {
            try {
                switch (game.system.id) {
                    case "wfrp4e":
                        for (let item of actor.data.items) {
                            const match = item.name.match(/Language \((.+)\)/i);
                            // adding only the descriptive language name, not "Language (XYZ)"
                            if (match)
                                this.known_languages.add(match[1]);
                        }
                        break;
                    case "ose":
                        for (let lang of actor.data.data.languages.value)
                            this.known_languages.add(lang)
                        break;
                    default:
                        // Don't duplicate the value in case it's a not an array
                        for (let lang of actor.data.data.traits.languages.value)
                            this.known_languages.add(lang)
                        // This condition is needed so an empty language is not loaded
                        if (actor.data.data.traits.languages.custom != "") {
                            for (let lang of actor.data.data.traits.languages.custom.split(/[,;]/))
                                this.known_languages.add(lang.trim().toLowerCase());
                        }
                        break;
                }
            } catch (err) {
                // Maybe not dnd5e, pf1 or pf2e or corrupted actor data?
            }
        }
        if (this.known_languages.size == 0) {
            if (game.user.isGM)
                this.known_languages = new Set(Object.keys(PolyGlot.languages))
            else
                this.known_languages.add(PolyGlot.defaultLanguage);
        }
        let options = ""
        for (let lang of this.known_languages) {
            let label = PolyGlot.languages[lang] || lang
            options += `<option value="${lang}">${label}</option>`
        }
        const select = html.find(".polyglot-lang-select select");
        const prevOption = select.val();
        select.html($(options));
        let selectedLanguage = this.lastSelection || prevOption || PolyGlot.defaultLanguage;
        // known_languages is a Set, so it's weird to access its values
        if (!this.known_languages.has(selectedLanguage))
            selectedLanguage = PolyGlot.defaultLanguage;
        if (!this.known_languages.has(selectedLanguage))
            selectedLanguage = [...this.known_languages][0];
        select.val(selectedLanguage);
    }

    // Original code from https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    hashCode(string) {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    scrambleString(string, salt) {
        const salted_string = string + salt;
        // Use a seeded PRNG to get consistent scrambled results
        const rng = new MersenneTwister(this.hashCode(salted_string));
        return string.replace(/\S/gu, () => {
            // Generate 0-9a-z
            const c = Math.floor(rng.random()*36).toString(36)
            const upper = Boolean(Math.round(rng.random()));
            return upper ? c.toUpperCase() : c;
          });
    }

    renderChatMessage(message, html, data) {
        // html and data are swapped on 0.3.x in relation to other render<Application> hooks
        const lang = message.getFlag("polyglot", "language") || ""
        if (!lang) return;
        let metadata = html.find(".message-metadata")
        let language = PolyGlot.languages[lang] || lang
        const unknown = !this.known_languages.has(lang);
        message.polyglot_unknown = unknown;
        if (game.user.isGM && !game.settings.get("polyglot", "runifyGM"))
            message.polyglot_unknown = false;
        if (!message.polyglot_force && message.polyglot_unknown) {
            let content = html.find(".message-content")
            let new_content = this.scrambleString(message.data.content, game.settings.get('polyglot','useUniqueSalt') ? message.data._id : lang)
            content.text(new_content)
            content[0].style.font = this._getFontStyle(lang)
            message.polyglot_unknown = true;
        }
        const color = unknown ? "red" : "green";
        metadata.find(".polyglot-message-language").remove()
        const title = game.user.isGM || !unknown ? `title="${language}"` : ""
        let button = $(`<a class="button polyglot-message-language" ${title}>
            <i class="fas fa-globe" style="color:${color}"></i>
        </a>`)
        metadata.append(button)
        if (game.user.isGM) {
            button.click(this._onGlobeClick.bind(this))
        }
    }

    _onGlobeClick(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents('.message');
        const message = Messages.instance.get(li.data("messageId"));
        message.polyglot_force = !message.polyglot_force;
        ui.chat.updateMessage(message)
    }

    preCreateChatMessage(data, options, userId) {
        if (data.type == CONST.CHAT_MESSAGE_TYPES.IC || (this.allowOOC && this._isMessageTypeOOC(data.type) && game.user.isGM)) {
            let lang = ui.chat.element.find("select[name=polyglot-language]").val()
            if (lang != "")
                mergeObject(data, { "flags.polyglot.language": lang });
        }
    }

    _getFontStyle(lang) {
        return this.alphabets[this.tongues[lang]] || this.alphabets[this.tongues._default]
    }

    async loadLanguages(setting) {
        const response = await fetch(`modules/polyglot/settings/${setting}.json`);
        if (response.ok) {
            const settingInfo = await response.json();
            this.alphabets = settingInfo.alphabets;
            this.tongues = settingInfo.tongues;
            console.log(`Polyglot | Loaded ${setting}.json`);
        } else {
            console.error(`Polyglot | Failed to fetch ${setting}.json: ${response.status}`);
            return;
        }
    }

    setup() {
        switch (game.system.id) {
            case "dnd5e":
                this.loadLanguages("forgottenrealms");
                break;
            case "pf1":
            case "pf2e":
                this.loadLanguages("golarion");
                break;
            case "ose":
                this.loadLanguages("ose");
                break;
            case "wfrp4e":
                this.loadLanguages("wfrp");
                break;
            case "sfrpg":
            default:
                break;
            }
        // custom languages
        game.settings.register("polyglot", "customLanguages", {
            name: "Custom Languages",
            hint: "Define a list of custom, comma separated, languages to add to the system.",
            scope: "world",
            config: true,
            default: "",
            type: String,
            onChange: (value) => this.setCustomLanguages(value)
        });
        game.settings.register("polyglot", "defaultLanguage", {
            name: "Default Language",
            hint: "Name of the default language to select. Keep empty to use system default.",
            scope: "client",
            config: true,
            default: "",
            type: String
        });
        game.settings.register("polyglot", "runifyGM", {
            name: "Scramble for GM",
            hint: "Disable this option to always show the text for the GM (refer to the globe's color for the token's understanding).",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => this.updateChatMessages()
        });
        game.settings.register("polyglot", "useUniqueSalt", {
            name: "Randomize Runes",
            hint: "Enabling this option will cause the scrambled text to appear different every time, even if the same message is repeated.",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register("polyglot", "exportFonts", {
            name: "Make fonts available",
            hint: "Make the Polyglot fonts available for use in Foundry (in Drawings for example).",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => this.updateConfigFonts()
        });
        // Adjust the bubble dimensions so the message is displayed correctly
        ChatBubbles.prototype._getMessageDimensions = (message) => {
            let div = $(`<div class="chat-bubble" style="visibility:hidden;font:${this._bubble.font}">${this._bubble.message || message}</div>`);
            $('body').append(div);
            let dims = {
                width: div[0].clientWidth + 8,
                height: div[0].clientHeight
            };
            div.css({maxHeight: "none"});
            dims.unconstrained = div[0].clientHeight;
            div.remove();
            return dims;
        }
         // allow OOC talking
        game.settings.register("polyglot", "allowOOC", {
            name: "Scramble on OOC chat messages",
            hint: "Allows the GM to scramble text when sending Out Of Character messages",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            onChange: (value) => this.allowOOC = value
        });
        this.allowOOC = game.settings.get("polyglot","allowOOC");
    }
    ready() {
        this.updateConfigFonts();
    }
    updateConfigFonts() {
        // Register fonts so they are available to other elements (such as Drawings)
        
        // First, remove all our fonts, then add them again if needed.
        CONFIG.fontFamilies = CONFIG.fontFamilies.filter(f => !PolyGlot.FONTS.includes(f));
        if (game.settings.get("polyglot", "exportFonts")) {
            CONFIG.fontFamilies.push(...PolyGlot.FONTS);
        }
    }

    async setCustomLanguages(languages) {
        PolyGlot.languages = await PolyGlot.getLanguages();
        for (let lang of languages.split(",")) {
            lang = lang.trim();
            const key = lang.toLowerCase().replace(/ \'/g, "_");
            PolyGlot.languages[key] = lang;
        }
        this.updateUserLanguages(ui.chat.element);
    }

    _addPolyglotEditor(sheet) {
        if (sheet._polyglotEditor) return;
        const methodName = sheet.activateEditor ? "activateEditor" : "_createEditor"
        sheet._polyglot_original_activateEditor = sheet[methodName];
        const languages = Object.entries(PolyGlot.languages).map(([lang, name]) => {
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
        sheet[methodName] = function(target, editorOptions, initialContent) {
            editorOptions.style_formats = [
              {
                title: "Custom",
                items: [
                  {
                    title: "Secret",
                    block: 'section',
                    classes: 'secret',
                    wrapper: true
                  }
                ]
              },
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

    renderJournalSheet(journalSheet, html) {
        this._addPolyglotEditor(journalSheet);
        if (journalSheet.entity.owner || game.user.isGM) {
            let runes = false;
            const texts = [];
            const styles = [];
            const toggleButton = $(`<a class="polyglot-button" title="Toggle Runes"><i class="fas fa-unlink"></i> Runes</a>`);
            toggleButton.click(ev => {
                ev.preventDefault();
                let button = ev.currentTarget.firstChild
                runes = !runes
                button.className = runes ? 'fas fa-link' : 'fas fa-unlink';
                if (runes) {
                    const spans = journalSheet.element.find("span.polyglot-journal");
                    for (let span of spans.toArray()) {
                        const lang = span.dataset.language;
                        if (!lang) continue;
                        texts.push(span.textContent)
                        styles.push(span.style.font)
                        span.textContent = this.scrambleString(span.textContent, game.settings.get('polyglot','useUniqueSalt') ? journalSheet._id : lang)
                        span.style.font = this._getFontStyle(lang)
                    }
                } else {
                    const spans = journalSheet.element.find("span.polyglot-journal");
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
            if (!this.known_languages.has(lang)) {
                span.title = "????"
                span.textContent = this.scrambleString(span.textContent,game.settings.get('polyglot','useUniqueSalt') ? journalSheet._id : lang)
                span.style.font = this._getFontStyle(lang)
            }
        }
    }
    chatBubble (token, html, messageContent, {emote}) {
        const message = game.messages.entities.slice(-10).reverse().find(m => m.data.content === messageContent);
        this._bubble = { font: '', message: '' };
        if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
            let lang = message.getFlag("polyglot", "language") || ""
            if (lang != "") {
                const unknown = !this.known_languages.has(lang);
                message.polyglot_unknown = unknown;
                if (game.user.isGM && !game.settings.get("polyglot", "runifyGM"))
                    message.polyglot_unknown = false;
                if (!message.polyglot_force && message.polyglot_unknown) {
                    const content = html.find(".bubble-content")
                    const new_content = this.scrambleString(message.data.content, game.settings.get('polyglot','useUniqueSalt') ? message._id : lang)
                    content.text(new_content)
                    this._bubble.font = this._getFontStyle(lang)
                    this._bubble.message = new_content
                    content[0].style.font = this._bubble.font
                    message.polyglot_unknown = true;
                }
            }
        }
    }
    vinoChatRender (chatDisplayData) {
        const message = chatDisplayData.message;

        let lang = message.getFlag("polyglot", "language") || ""
        if (lang != "") {
            const unknown = !this.known_languages.has(lang);
            message.polyglot_unknown = unknown;
            if (game.user.isGM && !game.settings.get("polyglot", "runifyGM"))
                message.polyglot_unknown = false;
            if (!message.polyglot_force && message.polyglot_unknown) {
                const new_content = this.scrambleString(chatDisplayData.text, game.settings.get('polyglot','useUniqueSalt') ? message._id : lang)
                chatDisplayData.text = new_content;
                chatDisplayData.font = this._getFontStyle(lang)
                chatDisplayData.skipAutoQuote = true;
                message.polyglot_unknown = true;
            }
        }
    }
}

PolyGlot.FONTS = [
    "ArCiela",
    "Barazhad", 
    "Celestial",
    "DarkEldar", 
    "Dethek", 
    "ElderFuthark", 
    "Eltharin", 
    "Espruar", 
    "Floki", 
    "FingerAlphabet", 
    "HighDrowic", 
    "HighschoolRunes", 
    "Infernal", 
    "Iokharic", 
    "JungleSlang", 
    "Kargi", 
    "MarasEye", 
    "MeroiticDemotic", 
    "MiroslavNormal", 
    "OldeEspruar", 
    "OldeThorass", 
    "Ophidian", 
    "Pulsian", 
    "Oriental", 
    "OrkGlyphs", 
    "Qijomi", 
    "Reanaarian", 
    "Saurian", 
    "Semphari", 
    "Skaven", 
    "Tengwar", 
    "Thassilonian", 
    "Thorass", 
    "Tuzluca", 
    "Valmaric"
];

PolyGlotSingleton = new PolyGlot()

Hooks.on('renderChatLog', PolyGlotSingleton.renderChatLog.bind(PolyGlotSingleton))
Hooks.on('updateUser', PolyGlotSingleton.updateUser.bind(PolyGlotSingleton))
Hooks.on('controlToken', PolyGlotSingleton.controlToken.bind(PolyGlotSingleton))
Hooks.on('preCreateChatMessage', PolyGlotSingleton.preCreateChatMessage.bind(PolyGlotSingleton))
Hooks.on('renderChatMessage', PolyGlotSingleton.renderChatMessage.bind(PolyGlotSingleton))
Hooks.on('renderJournalSheet', PolyGlotSingleton.renderJournalSheet.bind(PolyGlotSingleton))
Hooks.on('setup', PolyGlotSingleton.setup.bind(PolyGlotSingleton))
Hooks.on('ready', PolyGlotSingleton.ready.bind(PolyGlotSingleton))
Hooks.on("chatBubble", PolyGlotSingleton.chatBubble.bind(PolyGlotSingleton)) //token, html, message, {emote}
Hooks.on("vinoPrepareChatDisplayData", PolyGlotSingleton.vinoChatRender.bind(PolyGlotSingleton))
