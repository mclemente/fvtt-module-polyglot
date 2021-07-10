import {Polyglot} from "./module/logic.js";

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

let PolyglotSingleton = new Polyglot()

Hooks.on('renderChatLog', PolyglotSingleton.renderChatLog.bind(PolyglotSingleton))
Hooks.on('updateUser', PolyglotSingleton.updateUser.bind(PolyglotSingleton))
Hooks.on('controlToken', PolyglotSingleton.controlToken.bind(PolyglotSingleton))
Hooks.on('controlToken5e', PolyglotSingleton.controlToken.bind(PolyglotSingleton))
Hooks.on('preCreateChatMessage', PolyglotSingleton.preCreateChatMessage.bind(PolyglotSingleton))
Hooks.on('renderChatMessage', PolyglotSingleton.renderChatMessage.bind(PolyglotSingleton))
Hooks.on('renderJournalSheet', PolyglotSingleton.renderJournalSheet.bind(PolyglotSingleton))
Hooks.on('setup', PolyglotSingleton.setup.bind(PolyglotSingleton))
Hooks.on('ready', PolyglotSingleton.ready.bind(PolyglotSingleton))
Hooks.on("chatBubble", PolyglotSingleton.chatBubble.bind(PolyglotSingleton)) //token, html, message, {emote}
Hooks.on("vinoPrepareChatDisplayData", PolyglotSingleton.vinoChatRender.bind(PolyglotSingleton))
Hooks.on("renderSettingsConfig", (app, html, data) => {
    $('<div>').addClass('form-group polyglot-group-header').html(game.i18n.localize("POLYGLOT.FontSettings")).insertBefore($('[name="polyglot.useUniqueSalt"]').parents('div.form-group:first'));
    $('<div>').addClass('form-group polyglot-group-header').html(game.i18n.localize("POLYGLOT.LanguageSettings")).insertBefore($('[name="polyglot.replaceLanguages"]').parents('div.form-group:first'));
    $('<div>').addClass('form-group polyglot-group-header').html(game.i18n.localize("POLYGLOT.ChatSettings")).insertBefore($('[name="polyglot.display-translated"]').parents('div.form-group:first'));
});