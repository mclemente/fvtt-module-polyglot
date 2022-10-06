import * as providers from "./LanguageProvider.js";
import { addSetting } from "./settings.js";

export const availableLanguageProviders = {};
export let currentLanguageProvider = undefined;

function register(module, type, languageProvider) {
	const id = `${type}.${module.id}`;
	let providerInstance = new languageProvider(id);
	setupProvider(providerInstance);
}

function setupProvider(languageProvider) {
	availableLanguageProviders[languageProvider.id] = languageProvider;
	game.settings.settings.get("polyglot.languageProvider").default = getDefaultLanguageProvider();
	updateLanguageProvider();
}

export function getDefaultLanguageProvider() {
	const providerIds = Object.keys(availableLanguageProviders);
	if (!providerIds.length) return;
	// Game systems take the highest precedence for the being the default
	const gameSystem = providerIds.find((key) => key.startsWith("system.") || key.includes(game.system.id));
	if (gameSystem) return gameSystem;

	// If no game system is registered modules are next up.
	// For lack of a method to select the best module we're just falling back to taking the next best module
	// settingKeys should always be sorted the same way so this should achive a stable default
	const module = providerIds.find((key) => key.startsWith("module."));
	if (module) return module;

	// If neither a game system or a module is found fall back to the native implementation
	return providerIds[0];
}

export function updateLanguageProvider() {
	// If the configured provider is registered use that one. If not use the default provider
	const configuredProvider = game.settings.get("polyglot", "languageProvider");
	currentLanguageProvider = availableLanguageProviders[configuredProvider || game.settings.settings.get("polyglot.languageProvider").default];
}

export function initApi() {
	addSetting("languageProvider", {
		//Has no name or hint
		config: false,
		type: String,
		default: "", // Will be replaced by the end of this function
		onChange: updateLanguageProvider,
	});
	const providerKeys = {
		"cyberpunk-red-core": "cyberpunkRed",
		"dark-heresy": "darkHeresy",
		"uesrpg-d100": "uesrpg",
		wfrp4e: "warhammer",
	};
	const supportedSystems = /a5e|aria|coc7|earthdawn4e|d35e|dcc|demonlord|dnd4e|dnd5e|dsa5|fgg|gurps|ose|pf1|pf2e|sfrpg|shadowrun5e|splittermond|swade|sw5e|tormenta20/;
	const languageProviders = [];
	if (supportedSystems.exec(game.system.id)) var providerString = game.system.id;
	else providerString = providerKeys[game.system.id] || "";

	languageProviders.push(eval(`new providers.${providerString}LanguageProvider("native${providerString.length ? "." + providerString : ""}")`));
	for (let languageProvider of languageProviders) availableLanguageProviders[languageProvider.id] = languageProvider;
	game.settings.settings.get("polyglot.languageProvider").default = getDefaultLanguageProvider();
	updateLanguageProvider();
}

export function registerModule(moduleId, languageProvider) {
	// Check if a module with the given id exists and is currently enabled
	const module = game.modules.get(moduleId);
	// If it doesn't the calling module did something wrong. Log a warning and ignore this module
	if (!module) {
		console.warn(
			`Polyglot | A module tried to register with the id "${moduleId}". However no active module with this id was found. This api registration call was ignored. If you are the author of that module please check that the id passed to "registerModule" matches the id in your manifest exactly. If this call was made form a game system instead of a module please use "registerSystem" instead.`
		);
		return;
	}
	// Using Polyglot's id is not allowed
	if (moduleId === "polyglot") {
		console.warn(
			`Polyglot | A module tried to register with the id "${moduleId}", which is not allowed. This api registration call was ignored. If you're the author of the module please use the id of your own module as it's specified in your manifest to register to this api. If this call was made form a game system instead of a module please use "registerSystem" instead.`
		);
		return;
	}

	register(module, "module", languageProvider);
}

export function registerSystem(systemId, languageProvider) {
	const system = game.system;
	// If the current system id doesn't match the provided id something went wrong. Log a warning and ignore this module
	if (system.id != systemId) {
		console.warn(
			`Polyglot | A system tried to register with the id "${systemId}". However the active system has a different id. This api registration call was ignored. If you are the author of that system please check that the id passed to "registerSystem" matches the id in your manifest exactly. If this call was made form a module instead of a game system please use "registerModule" instead.`
		);
		return;
	}

	register(system, "system", languageProvider);
}
