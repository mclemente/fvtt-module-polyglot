export class PolyglotFontSettings extends FormApplication {
	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions() {
		const classes = ["sheet", "polyglot", "polyglot-font-settings"];
		if (game.system.id === "wfrp4e") {
			classes.push(game.system.id);
		}
		return mergeObject(super.defaultOptions, {
			id: "polyglot-font-form",
			title: "Polyglot Font Settings",
			template: "./modules/polyglot/templates/FontSettings.hbs",
			classes,
			width: 780,
			height: 680,
			closeOnSubmit: true,
			resizable: true,
		});
	}

	getData(options) {
		const fonts = Object.keys(game.polyglot.languageProvider.fonts);
		this.fonts = {};

		for (let key of fonts) {
			this.fonts[key] = {
				label: key,
				family: game.polyglot.languageProvider.fonts[key].fontFamily,
				size: game.polyglot.CustomFontSizes[key] || "100",
				alphabeticOnly: game.polyglot.languageProvider.fonts[key]?.alphabeticOnly || false,
				logographical: game.polyglot.languageProvider.fonts[key]?.logographical || false,
			};
		}

		return {
			fonts: this.fonts,
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);

		const changeFontSize = async (event) => {
			const fontSize = event.type == "change" ? event.target.value : event.target.value - event.originalEvent.deltaY / 10;
			if (fontSize < 100) return;
			const font = event.target.parentElement.previousElementSibling.textContent;
			event.target.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.fontSize = `${fontSize}%`;
			this.fonts[font].fontSize = fontSize;
		};
		const changeFontAlphabetic = async (event) => {
			const font = event.target.parentElement.previousElementSibling.previousElementSibling.textContent;
			this.fonts[font].alphabeticOnly = event.target.checked;
		};
		const changeFontLogographical = async (event) => {
			const font = event.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
			this.fonts[font].logographical = event.target.checked;
		};

		html.find(".alphabeticOnly").on("change", changeFontAlphabetic);
		html.find(".logographical").on("change", changeFontLogographical);

		html.find(".selectatr").on("change", changeFontSize);
		html.find(".selectatr").on("wheel", changeFontSize);
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				const defaults = game.settings.settings.get("polyglot.CustomFontSizes").default;
				for (const key in this.fonts) {
					this.fonts[key].fontSize = defaults[key] ?? "100";
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
		const customFontSizes = {};
		for (const [key, font] of Object.entries(this.fonts)) {
			customFontSizes[key] = font.size;
			game.polyglot.languageProvider.fonts[key].alphabeticOnly = font.alphabeticOnly;
			game.polyglot.languageProvider.fonts[key].logographical = font.logographical;
		}
		game.polyglot.CustomFontSizes = customFontSizes;
		game.settings.set("polyglot", "CustomFontSizes", game.polyglot.CustomFontSizes);
		game.polyglot.languageProvider.loadFonts();
	}
}
