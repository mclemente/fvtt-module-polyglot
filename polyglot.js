class PolyGlot {

    constructor() {
        this.known_languages = new Set();
        this.refresh_timeout = null;
        try {
            this.regexp_letters = new RegExp(/[\p{Letter}\p{Number}]/, 'gu')
        } catch (err) {
            this.regexp_letters = new RegExp(/[0-9A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/, 'g')
        }
    }

    static async getLanguages() {
        switch (game.system.id) {
            case "dnd5e":
            case "dnd5eJP":
            case "pf1":
            case "pf2e":
                return CONFIG[game.system.id.toUpperCase()].languages;
                break;
            case "wfrp4e":
                const pack = game.packs.get("wfrp4e.skills");
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

    renderChatLog(chatlog, html, data) {
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
        // Get the last 100 messages
        const messages = ui.chat.element.find('.message').slice(-100).toArray().map(m => game.messages.get(m.dataset.messageId))
        // Loop in reverse so most recent messages get refreshed first.
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i]
            if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
                let lang = message.getFlag("polyglot", "language") || ""
                let unknown = !this.known_languages.has(lang);
                if (unknown != message.polyglot_unknown)
                    ui.chat.updateMessage(message)
            }
        }
    }

    updateUserLanguages(html) {
        let actors = [];
        this.known_languages = new Set();
        for (let token of canvas.tokens.controlled) {
            if (token.actor)
                actors.push(token.actor)
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
                    default:
                        // Don't duplicate the value in case it's a not an array
                        for (let lang of actor.data.data.traits.languages.value)
                            this.known_languages.add(lang)
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

    randomRune() {
        return String.fromCharCode(Math.floor(Math.random() * 0x51) + 0x16A0)
    }

    renderChatMessage(message, html, data) {
        // html and data are swapped on 0.3.x in relation to other render<Application> hooks
        if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
            let lang = message.getFlag("polyglot", "language") || ""
            if (lang != "") {
                let metadata = html.find(".message-metadata")
                let language = PolyGlot.languages[lang] || lang
                message.polyglot_unknown = !this.known_languages.has(lang);
                if (!message.polyglot_force && message.polyglot_unknown) {
                    let content = html.find(".message-content")
                    let new_content = content.text().replace(this.regexp_letters, this.randomRune)
                    content.text(new_content)
                    message.polyglot_unknown = true;
                }
                let color = message.polyglot_unknown ? "red" : "green";
                metadata.find(".polyglot-message-language").remove()
                const title = game.user.isGM ? `title="${language}"` : ""
                let button = $(`<a class="button polyglot-message-language" ${title}>
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
        message.polyglot_force = !message.polyglot_force;
        ui.chat.updateMessage(message)
    }

    preCreateChatMessage(data, options, userId) {
        if (data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
            let lang = ui.chat.element.find("select[name=polyglot-language]").val()
            if (lang != "")
                mergeObject(data, { "flags.polyglot.language": lang });
        }
    }

    setup() {
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
        const orig = Messages.prototype.sayBubble;
        // TODO: Switch to chatBubble hook once we get the original ChatMessage as part of hook arguments
        Messages.prototype.sayBubble = (message) => {
            if (message.data.type == CONST.CHAT_MESSAGE_TYPES.IC) {
                const lang = message.getFlag("polyglot", "language") || ""
                if (lang != "" && !this.known_languages.has(lang)) {
                    try {
                        // Create a new message so we don't modify the original, since we can't change the html itself
                        message = new ChatMessage(duplicate(message.data));
                        message.data.content = message.data.content.replace(this.regexp_letters, this.randomRune);
                    } catch (err) {
                        // In case we can't replace it for some reason, just prevent it from appearing
                        return;
                    }
                }
            }
            return orig(message);
        }
    }

    ready() {
        this.setCustomLanguages(game.settings.get("polyglot", "customLanguages"));
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
}

PolyGlotSingleton = new PolyGlot()

Hooks.on('renderChatLog', PolyGlotSingleton.renderChatLog.bind(PolyGlotSingleton))
Hooks.on('updateUser', PolyGlotSingleton.updateUser.bind(PolyGlotSingleton))
Hooks.on('controlToken', PolyGlotSingleton.controlToken.bind(PolyGlotSingleton))
Hooks.on('preCreateChatMessage', PolyGlotSingleton.preCreateChatMessage.bind(PolyGlotSingleton))
Hooks.on('renderChatMessage', PolyGlotSingleton.renderChatMessage.bind(PolyGlotSingleton))
Hooks.on('setup', PolyGlotSingleton.setup.bind(PolyGlotSingleton))
Hooks.on('ready', PolyGlotSingleton.ready.bind(PolyGlotSingleton))
