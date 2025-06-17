const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PolyglotFontSettings extends HandlebarsApplicationMixin(ApplicationV2) {
	static get classes() {
		const classes = ["sheet", "polyglot", "polyglot-font-settings"];
		if (game.system?.id === "wfrp4e") {
			classes.push(game.system.id);
		}
		return classes;
	}

	static DEFAULT_OPTIONS = {
		id: "polyglot-font-form",
		classes: this.classes,
		actions: {
			reset: PolyglotFontSettings.reset
		},
		form: {
			handler: PolyglotFontSettings.#onSubmit,
			closeOnSubmit: true,
		},
		position: {
			width: 780,
			height: 680,
		},
		tag: "form",
		window: {
			icon: "fas fa-font",
			title: "Font Settings",
			contentClasses: ["standard-form"],
			resizable: true,
		}
	};

	get title() {
		return `Polyglot: ${game.i18n.localize(this.options.window.title)}`;
	}

	static PARTS = {
		form: {
			template: "./modules/polyglot/templates/FontSettings.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	_prepareContext() {
		const fonts = game.settings.get("polyglot", "Alphabets");
		this.fonts = {};

		for (let key in fonts) {
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
			fields: game.settings.settings.get("polyglot.Alphabets").type.element.fields,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
				{ type: "reset", action: "reset", icon: "fa-solid fa-undo", label: "SETTINGS.Reset" },
			]
		};
	}

	_onRender(context, options) {
		super._onRender(context, options);

		const changeFontSize = async (event) => {
			event.preventDefault();
			if (!event.target.hasFocus) return;
			let size = event.target.value;
			if (event.type !== "change") {
				const multiplier = event.deltaY / Math.abs(event.deltaY); // 1 or -1
				const step = Number(event.target.step) || 10;
				size = Math.floor(size - (multiplier * step));
			}
			if (size < 50) return;
			event.target.value = size;
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

		this.element.querySelectorAll(".alphabeticOnly").forEach((el) => el.addEventListener("change", changeFontAlphabetic));
		this.element.querySelectorAll(".logographical").forEach((el) => el.addEventListener("change", changeFontLogographical));

		this.element.querySelectorAll(".selectatr").forEach((el) => el.addEventListener("focus", (event) => {
			event.target.hasFocus = true;
		}));
		this.element.querySelectorAll(".selectatr").forEach((el) => el.addEventListener("blur", (event) => {
			event.target.hasFocus = false;
		}));
		this.element.querySelectorAll(".selectatr").forEach((el) => el.addEventListener("change", changeFontSize));
		this.element.querySelectorAll(".selectatr").forEach((el) => el.addEventListener("wheel", changeFontSize));
	}

	static async reset() {
		const defaultAlphabets = new game.polyglot.languageProvider.constructor().fonts;
		game.polyglot.languageProvider.fonts = defaultAlphabets;
		await game.settings.set("polyglot", "Alphabets", game.polyglot.languageProvider.fonts);
		const defaultCustomFontSizes = game.settings.settings.get("polyglot.CustomFontSizes").default;
		await game.settings.set("polyglot", "CustomFontSizes", defaultCustomFontSizes);
		this.close();
		SettingsConfig.reloadConfirm({ world: true });
	}

	static async #onSubmit() {
		const customFontSizes = {};
		for (const [key, font] of Object.entries(this.fonts)) {
			customFontSizes[key] = font.size;
			game.polyglot.languageProvider.fonts[key].alphabeticOnly = font.alphabeticOnly;
			game.polyglot.languageProvider.fonts[key].logographical = font.logographical;
		}
		let current = game.settings.get("polyglot", "Alphabets");
		await game.settings.set("polyglot", "Alphabets", game.polyglot.languageProvider.fonts);
		current = game.settings.get("polyglot", "CustomFontSizes");
		game.polyglot.CustomFontSizes = customFontSizes;
		await game.settings.set("polyglot", "CustomFontSizes", game.polyglot.CustomFontSizes);
		const changes = !foundry.utils.isEmpty(foundry.utils.diffObject(current, game.polyglot.languageProvider.fonts))
			|| !foundry.utils.isEmpty(foundry.utils.diffObject(current, customFontSizes));
		if (changes) SettingsConfig.reloadConfirm({ world: true });
	}
}
