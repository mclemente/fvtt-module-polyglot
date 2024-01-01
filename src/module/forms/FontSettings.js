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

	getData() {
		const fonts = game.settings.get("polyglot", "Alphabets");
		this.fonts = {};

		for (let key of Object.keys(fonts)) {
			this.fonts[key] = {
				label: key,
				family: fonts[key].fontFamily,
				size: game.polyglot.CustomFontSizes[key] || "100",
				alphabeticOnly: fonts[key]?.alphabeticOnly || false,
				logographical: fonts[key]?.logographical || false,
			};
		}

		return {
			fonts: this.fonts,
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);

		const changeFontSize = async (event) => {
			if (!event.target.hasFocus) return;
			let size = event.target.value;
			if (event.type !== "change") {
				size -= event.originalEvent.deltaY / 10;
			}
			if (size < 50) return;
			const parent = event.target.parentElement;
			const font = parent.previousElementSibling.textContent;
			parent.nextElementSibling.nextElementSibling.nextElementSibling.style.fontSize = `${size}%`;
			this.fonts[font].size = size;
		};
		const changeFontAlphabetic = async (event) => {
			const parent = event.target.parentElement;
			const font = parent.previousElementSibling.previousElementSibling.textContent;
			this.fonts[font].alphabeticOnly = event.target.checked;
		};
		const changeFontLogographical = async (event) => {
			const parent = event.target.parentElement;
			const font = parent.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
			this.fonts[font].logographical = event.target.checked;
		};

		html.find(".alphabeticOnly").on("change", changeFontAlphabetic);
		html.find(".logographical").on("change", changeFontLogographical);

		html.find(".selectatr").on("focus", (event) => {
			event.target.hasFocus = true;
		});
		html.find(".selectatr").on("blur", (event) => {
			event.target.hasFocus = false;
		});
		html.find(".selectatr").on("change", changeFontSize);
		html.find(".selectatr").on("wheel", changeFontSize);
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				const defaultAlphabets = new game.polyglot.languageProvider.constructor().fonts;
				game.polyglot.languageProvider.fonts = defaultAlphabets;
				await game.settings.set("polyglot", "Alphabets", game.polyglot.languageProvider.fonts);
				const defaultCustomFontSizes = game.settings.settings.get("polyglot.CustomFontSizes").default;
				await game.settings.set("polyglot", "CustomFontSizes", defaultCustomFontSizes);
				this.close();
				SettingsConfig.reloadConfirm({ world: true });
			}
		});
	}

	async _updateObject() {
		const customFontSizes = {};
		let changes = false;
		for (const [key, font] of Object.entries(this.fonts)) {
			customFontSizes[key] = font.size;
			game.polyglot.languageProvider.fonts[key].alphabeticOnly = font.alphabeticOnly;
			game.polyglot.languageProvider.fonts[key].logographical = font.logographical;
		}
		let current = game.settings.get("polyglot", "Alphabets");
		if (!foundry.utils.isEmpty(foundry.utils.diffObject(current, game.polyglot.languageProvider.fonts))) {
			await game.settings.set("polyglot", "Alphabets", game.polyglot.languageProvider.fonts);
			changes = true;
		}
		current = game.settings.get("polyglot", "CustomFontSizes");
		if (!foundry.utils.isEmpty(foundry.utils.diffObject(current, customFontSizes))) {
			game.polyglot.CustomFontSizes = customFontSizes;
			await game.settings.set("polyglot", "CustomFontSizes", game.polyglot.CustomFontSizes);
			changes = true;
		}
		if (changes) {
			SettingsConfig.reloadConfirm({ world: true });
		}
	}
}
