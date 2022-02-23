// prettier-ignore
import {
	LanguageProvider, a5eLanguageProvider, ariaLanguageProvider, coc7LanguageProvider, cyberpunkRedLanguageProvider, d35eLanguageProvider, darkHeresyLanguageProvider,
	dccLanguageProvider, demonlordLanguageProvider, dnd4eLanguageProvider, dnd5eLanguageProvider, dsa5LanguageProvider, fggLanguageProvider, gurpsLanguageProvider,
	kryxrpgLanguageProvider, oseLanguageProvider,
	pf1LanguageProvider, pf2eLanguageProvider, sfrpgLanguageProvider, shadowrun5eLanguageProvider, splittermondLanguageProvider, swadeLanguageProvider, 
	sw5eLanguageProvider, tormenta20LanguageProvider, uesrpgLanguageProvider, warhammerLanguageProvider,
} from "./LanguageProvider.js";
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
	currentLanguageProvider = availableLanguageProviders[configuredProvider] ?? availableLanguageProviders[game.settings.settings.get("polyglot.languageProvider").default];
}

export function initApi() {
	addSetting("languageProvider", {
		//Has no name or hint
		config: false,
		type: String,
		default: getDefaultLanguageProvider(),
		onChange: updateLanguageProvider,
	});
	const languageProviders = [];
	switch (game.system.id) {
		case "a5e":
			languageProviders.push(new a5eLanguageProvider("native.a5e"));
			break;
		case "aria":
			languageProviders.push(new ariaLanguageProvider("native.aria"));
			break;
		case "CoC7":
			languageProviders.push(new coc7LanguageProvider("native.CoC7"));
			break;
		case "D35E":
			languageProviders.push(new d35eLanguageProvider("native.D35E"));
			break;
		case "dark-heresy":
			languageProviders.push(new darkHeresyLanguageProvider("native.dark-heresy"));
			break;
		case "dcc":
			languageProviders.push(new dccLanguageProvider("native.dcc"));
			break;
		case "demonlord":
			languageProviders.push(new demonlordLanguageProvider("native.demonlord"));
			break;
		case "dsa5":
			languageProviders.push(new dsa5LanguageProvider("native.dsa5"));
			break;
		case "dnd4e":
			languageProviders.push(new dnd4eLanguageProvider("native.dnd4e"));
			break;
		case "dnd5e":
			languageProviders.push(new dnd5eLanguageProvider("native.dnd5e"));
			break;
		case "fgg":
			languageProviders.push(new fggLanguageProvider("native.fgg"));
			break;
		case "gurps":
			languageProviders.push(new gurpsLanguageProvider("native.gurps"));
			break;
		case "kryx_rpg":
			languageProviders.push(new kryxrpgLanguageProvider("native.kryx_rpg"));
			break;
		case "ose":
			languageProviders.push(new oseLanguageProvider("native.ose"));
			break;
		case "pf1":
			languageProviders.push(new pf1LanguageProvider("native.pf1"));
			break;
		case "pf2e":
			languageProviders.push(new pf2eLanguageProvider("native.pf2e"));
			break;
		case "sfrpg":
			languageProviders.push(new sfrpgLanguageProvider("native.sfrpg"));
			break;
		case "shadowrun5e":
			languageProviders.push(new shadowrun5eLanguageProvider("native.shadowrun5e"));
			break;
		case "splittermond":
			languageProviders.push(new splittermondLanguageProvider("native.splittermond"));
			break;
		case "swade":
			languageProviders.push(new swadeLanguageProvider("native.swade"));
			break;
		case "sw5e":
			languageProviders.push(new sw5eLanguageProvider("native.sw5e"));
			break;
		case "tormenta20":
			languageProviders.push(new tormenta20LanguageProvider("native.tormenta20"));
			break;
		case "uesrpg-d100":
			languageProviders.push(new uesrpgLanguageProvider("native.uesrpg-d100"));
			break;
		case "wfrp4e":
			languageProviders.push(new warhammerLanguageProvider("native.wfrp4e"));
			break;
		case "cyberpunk-red-core":
			languageProviders.push(new cyberpunkRedLanguageProvider("native.cyberpunk-red-core"));
			break;
		default:
			languageProviders.push(new LanguageProvider("native"));
			break;
	}
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
