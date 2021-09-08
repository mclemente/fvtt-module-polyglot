import { currentLanguageProvider, initApi, registerModule, registerSystem } from "./module/api.js";
import { LanguageProvider } from "./module/LanguageProvider.js";
import { Polyglot } from "./module/logic.js";
import { registerSettings } from "./module/settings.js";

Polyglot.FONTS = [
	"ArCiela",
	"Aztec",
	"Barazhad",
	"Celestial",
	"Daedra",
	"DarkEldar",
	"Dethek",
	"DragonAlphabet",
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
	"KremlinPremier",
	"MarasEye",
	"MageScript",
	"MeroiticDemotic",
	"MiroslavNormal",
	"NyStormning",
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
	"ScrapbookChinese",
	"Semphari",
	"Skaven",
	"Tengwar",
	"Thassilonian",
	"Thorass",
	"Tuzluca",
	"Valmaric",
];
Polyglot.CustomFonts = [];

window.polyglot = { polyglot: new Polyglot(), fonts: Polyglot.FONTS, registerModule, registerSystem };

export async function getSounds() {
	var source = game.settings.get("polyglot", "source");
	var directory = game.settings.get("polyglot", "polyglotDirectory");
	if (directory === "") return;
	try {
		var FONTS = {};
		if (source === "s3") {
			const bucketContainer = await FilePicker.browse(source, directory);
			var bucket = bucketContainer.dirs[0];
		}
		var soundboardDirArray = await FilePicker.browse(source, directory, {
			...(bucket && {
				bucket,
			}),
		});
		if (soundboardDirArray.target != directory) {
			throw "Filepicker target did not match input. Parent directory may be correct. Soft failure.";
		}

		for (const dir of soundboardDirArray.dirs) {
			const dirShortName = formatName(dir.split(/[/]+/).pop(), false);
			FONTS[dirShortName] = [];
			let innerDirArray = await FilePicker.browse(source, dir, {
				...(bucket && {
					bucket,
				}),
			});
			for (const wildcardDir of innerDirArray.dirs) {
				let wildcardFileArray = await FilePicker.browse(source, wildcardDir, {
					...(bucket && {
						bucket,
					}),
				});
				wildcardFileArray = wildcardFileArray.files;
				wildcardFileArray = wildcardFileArray.filter(function (file) {
					switch (file.substring(file.length - 4)) {
						case ".ttf":
						case ".otf":
							return true;
						default:
							SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
							return false;
					}
				});
				FONTS[dirShortName].push({
					name: formatName(wildcardDir.split(/[/]+/).pop(), false),
					src: wildcardFileArray,
					identifyingPath: wildcardDir,
				});
			}
			for (const file of innerDirArray.files) {
				switch (file.substring(file.length - 4)) {
					case ".ttf":
					case ".otf":
						FONTS[dirShortName].push({
							name: formatName(file.split(/[/]+/).pop()),
							src: [file],
							identifyingPath: file,
						});
						break;

					default:
						SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
						break;
				}
			}
		}
		FONTS["root"] = [];
		for (const file of soundboardDirArray.files) {
			switch (file.substring(file.length - 4)) {
				case ".ttf":
				case ".otf":
					FONTS["root"].push({
						name: formatName(file.split(/[/]+/).pop()),
						src: [file],
						identifyingPath: file,
					});
					break;

				default:
					SoundBoard.log(`${file} ${game.i18n.localize("SOUNDBOARD.log.invalidSound")}`, SoundBoard.LOGTYPE.WARN);
					break;
			}
		}
	} catch (error) {
		console.error(error);
		// SoundBoard.log(error, SoundBoard.LOGTYPE.ERR);
	} finally {
		var sheet = window.document.styleSheets;
		var fontNames = [];
		for (let s of sheet) {
			if (s.href.includes("polyglot") && s.href.includes("fonts")) {
				sheet = s;
				break;
			}
		}
		for (const dir in FONTS) {
			for (const font of FONTS[dir]) {
				fontNames.push(font.name);
				sheet.insertRule(`@font-face {font-family: "${font.name}"; src:url(../../../${font.identifyingPath});}`, sheet.cssRules.length);
			}
		}
		Polyglot.FONTS = Polyglot.FONTS.concat(fontNames);
		Polyglot.CustomFonts = Polyglot.CustomFonts.concat(fontNames);
		window.polyglot.fonts = Polyglot.FONTS;
	}
}

function formatName(name, shouldStripFileName = true) {
	if (shouldStripFileName) {
		if (name.indexOf(".") > -1 && name.indexOf(".") < name.length) {
			name = name.substr(0, name.lastIndexOf("."));
		}
	}
	name = decodeURIComponent(name);

	// Turn _ and - into spaces. Allow multiple characters to display
	name = name.replace(/_(?! )|-(?! )/g, " ");

	// Handle camelCase
	name = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
	// Add a space before numbers after letters
	name = name.replace(/([a-zA-Z])([0-9])/g, "$1 $2");

	// Uppercase letters after a space
	name = name
		.split(" ")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(" ");
	return name;
}

Hooks.once("init", () => {
	registerSettings();
	initApi();
});

Hooks.on("renderChatLog", window.polyglot.polyglot.renderChatLog.bind(window.polyglot.polyglot));
Hooks.on("updateUser", window.polyglot.polyglot.updateUser.bind(window.polyglot.polyglot));
Hooks.on("controlToken", window.polyglot.polyglot.controlToken.bind(window.polyglot.polyglot));
Hooks.on("preCreateChatMessage", window.polyglot.polyglot.preCreateChatMessage.bind(window.polyglot.polyglot));
Hooks.on("createChatMessage", window.polyglot.polyglot.createChatMessage.bind(window.polyglot.polyglot));
Hooks.on("renderChatMessage", window.polyglot.polyglot.renderChatMessage.bind(window.polyglot.polyglot));
Hooks.on("renderJournalSheet", window.polyglot.polyglot.renderJournalSheet.bind(window.polyglot.polyglot));
Hooks.on("setup", async () => {
	await getSounds();
	await currentLanguageProvider.setup();
});
Hooks.on("ready", () => {
	window.polyglot.polyglot.ready();
	if (!Object.keys(game.settings.get("polyglot", "Languages")).length) game.settings.set("polyglot", "Languages", currentLanguageProvider.tongues);
	Hooks.callAll("polyglot.ready", LanguageProvider);
});
Hooks.on("chatBubble", window.polyglot.polyglot.chatBubble.bind(window.polyglot.polyglot)); //token, html, message, {emote}
Hooks.on("vinoPrepareChatDisplayData", window.polyglot.polyglot.vinoChatRender.bind(window.polyglot.polyglot));
