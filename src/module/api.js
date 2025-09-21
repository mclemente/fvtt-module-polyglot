import * as providers from "./providers/_module.js";
import { providerKeys } from "./providers/_shared.js";
import { addSetting } from "./settings.js";

export class PolyglotAPI {
	constructor() {
		this.providers = {};
		this.polyglot = null;
	}

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
	}

	get languageProvider() {
		return this.polyglot.languageProvider;
	}

	/**
	 * @param {String} provider
	 */
	set languageProvider(provider) {
		this.polyglot.languageProvider = this.providers[provider];
	}

	attach() {
		game.polyglot.api = this;
		this.polyglot = game.polyglot;
	}

	defaultProvider() {
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
	}

	updateProvider() {
		// If the configured provider is registered use that one. If not use the default provider
		const configuredProvider = game.settings.get("polyglot", "languageProvider");
		const fallbackProvider = game.settings.settings.get("polyglot.languageProvider").default;
		this.polyglot.languageProvider = this.providers[configuredProvider] || this.providers[fallbackProvider];
		this.polyglot.omniglot = game.settings.get("polyglot", "omniglot");
		this.polyglot.comprehendLanguages = game.settings.get("polyglot", "comprehendLanguages");
		this.polyglot.truespeech = game.settings.get("polyglot", "truespeech");
	}

	/**
	 * @param {String} moduleId
	 * @param {providers.LanguageProvider} languageProvider
	 */
	registerModule(moduleId, languageProvider) {
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
	registerSystem(languageProvider) {
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
}
