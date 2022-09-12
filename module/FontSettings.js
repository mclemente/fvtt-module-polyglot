import { currentLanguageProvider } from "./api.js";

export class PolyglotFontSettings extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
	}

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
			height: "fit-content",
			closeOnSubmit: true,
		});
	}

	getData(options) {
		const fonts = Object.keys(game.settings.get("core", "fonts"));
		const fontSizes = game.polyglot.CustomFontsSize;
		for (let key of fonts) {
			game.polyglot.CustomFontsSize[key] = game.polyglot.CustomFontsSize[key] ?? "100";
		}
		for (let key in fontSizes) {
			if (!fonts.includes(key)) delete fontSizes[key];
		}

		return {
			fontSize: fontSizes,
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find(".polyglot-alphabet").each(function () {
			const font = this.previousSibling.previousSibling.previousSibling.previousSibling.innerText; //selectatr's value
			this.style.font = currentLanguageProvider.alphabets[font];
		});
		html.find(".selectatr").on("change", async (event) => {
			const size = event.target.value;
			let split = event.target.parentElement.nextSibling.nextSibling.style.font.split("%");
			split.shift();
			let font = split.join();
			event.target.parentElement.nextSibling.nextSibling.style.font = `${size}%${font}`;
			font = font.trim();
			font = font.replace(/['"]+/g, "");
			game.polyglot.CustomFontsSize[font] = size;
		});
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				for (let key in game.polyglot.CustomFontsSize) {
					game.polyglot.CustomFontsSize[key] = 100;
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
		game.settings.set("polyglot", "CustomFontSizes", game.polyglot.CustomFontsSize);
		currentLanguageProvider.loadAlphabet();
	}
}
