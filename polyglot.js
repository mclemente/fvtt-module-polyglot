import { initApi, registerModule, registerSystem } from "./module/api.js"
import { LanguageProvider } from "./module/LanguageProvider.js";
import { Polyglot } from "./module/logic.js";
import { registerSettings } from "./module/settings.js"

Polyglot.FONTS = [
	"ArCiela",
	"Barazhad",
	"Celestial",
	"DarkEldar",
	"Daedra",
	"Dethek",
	"Dovahkiin",
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
	"MageScript",
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
	"NyStormning",
	"Saurian",
	"Semphari",
	"Skaven",
	"Tengwar",
	"Thassilonian",
	"Thorass",
	"Tuzluca",
	"Valmaric"
];

window.polyglot = { polyglot: new Polyglot(), registerModule, registerSystem };

Hooks.once("init", () => {
	registerSettings();
	initApi();
});

Hooks.on('renderChatLog', window.polyglot.polyglot.renderChatLog.bind(window.polyglot.polyglot))
Hooks.on('updateUser', window.polyglot.polyglot.updateUser.bind(window.polyglot.polyglot))
Hooks.on('controlToken', window.polyglot.polyglot.controlToken.bind(window.polyglot.polyglot))
Hooks.on('controlToken5e', window.polyglot.polyglot.controlToken.bind(window.polyglot.polyglot))
Hooks.on('preCreateChatMessage', window.polyglot.polyglot.preCreateChatMessage.bind(window.polyglot.polyglot))
Hooks.on('renderChatMessage', window.polyglot.polyglot.renderChatMessage.bind(window.polyglot.polyglot))
Hooks.on('renderJournalSheet', window.polyglot.polyglot.renderJournalSheet.bind(window.polyglot.polyglot))
Hooks.on('setup', window.polyglot.polyglot.setup.bind(window.polyglot.polyglot))
Hooks.on('ready', () => {
	// window.polyglot.polyglot.ready.bind(window.polyglot.polyglot)
	window.polyglot.polyglot.ready()
	Hooks.callAll("polyglot.ready", LanguageProvider)
});
Hooks.on("chatBubble", window.polyglot.polyglot.chatBubble.bind(window.polyglot.polyglot)) //token, html, message, {emote}
Hooks.on("vinoPrepareChatDisplayData", window.polyglot.polyglot.vinoChatRender.bind(window.polyglot.polyglot))
Hooks.on("renderSettingsConfig", (app, html, data) => {
    $('<div>').addClass('form-group polyglot-group-header').html(game.i18n.localize("POLYGLOT.FontSettings")).insertBefore($('[name="polyglot.useUniqueSalt"]').parents('div.form-group:first'));
    $('<div>').addClass('form-group polyglot-group-header').html(game.i18n.localize("POLYGLOT.LanguageSettings")).insertBefore($('[name="polyglot.replaceLanguages"]').parents('div.form-group:first'));
    $('<div>').addClass('form-group polyglot-group-header').html(game.i18n.localize("POLYGLOT.ChatSettings")).insertBefore($('[name="polyglot.display-translated"]').parents('div.form-group:first'));
});