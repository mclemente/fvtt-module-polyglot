export class PolyglotFontSettings extends FormApplication {
	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "polyglot-font-form",
			title: "Polyglot Font Settings",
			template: "./modules/polyglot/templates/FontSettings.hbs",
			classes: ["sheet polyglot-font-settings"],
			width: 600,
			height: 680,
			closeOnSubmit: true,
			resizable: true,
		});
	}

	getData(options) {
		const fonts = Object.keys(game.settings.get("core", "fonts"));
		this.fontSizes = {};

		for (let key of fonts) {
			this.fontSizes[key] = game.polyglot.CustomFontSizes[key] || "100";
		}

		return {
			fontSize: this.fontSizes,
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);

		const fontChange = async (event) => {
			const size = event.type == "change" ? event.target.value : event.target.value - event.originalEvent.deltaY / 10;
			if (size < 100) return;
			const font = event.target.parentElement.nextSibling.nextSibling.style.fontFamily;
			event.target.parentElement.nextSibling.nextSibling.style.fontSize = `${size}%`;
			this.fontSizes[font] = size;
		};

		html.find(".selectatr").on("change", fontChange);
		html.find(".selectatr").on("wheel", fontChange);
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				const defaults = game.settings.settings.get("polyglot.CustomFontSizes").default;
				for (let key in this.fontSizes) {
					const normalizedKey = key.replace(" ", "").toLowerCase();
					this.fontSizes[key] = defaults[normalizedKey] ?? 100;
				}
				this.close();
			}
		});
	}

	/**
	 * Executes on form submission
	 * @param {Event} ev - the form submission event
	 * @param {Object} formData - the form data
	 */
	async _updateObject(ev, formData) {
		game.polyglot.CustomFontSizes = deepClone(this.fontSizes);
		game.settings.set("polyglot", "CustomFontSizes", game.polyglot.CustomFontSizes);
		game.polyglot.languageProvider.loadAlphabet();
	}
}
