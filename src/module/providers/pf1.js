import LanguageProvider from "./templates/Base.js";

export default class pf1LanguageProvider extends LanguageProvider {
	languages = {
		common: {
			font: "Thorass",
		},
		aboleth: {
			font: "Ar Ciela",
		},
		abyssal: {
			font: "Barazhad",
		},
		aklo: {
			font: "Ophidian",
		},
		algollthu: {
			font: "Ar Ciela",
		},
		anadi: {
			font: "Jungle Slang",
		},
		aquan: {
			font: "Olde Thorass",
		},
		arboreal: {
			font: "Olde Espruar",
		},
		auran: {
			font: "Olde Thorass",
		},
		azlanti: {
			font: "Tengwar",
		},
		boggard: {
			font: "Semphari",
		},
		caligni: {
			font: "High Drowic",
		},
		celestial: {
			font: "Celestial",
		},
		cyclops: {
			font: "Meroitic Demotic",
		},
		daemonic: {
			font: "Infernal",
		},
		dark: {
			font: "High Drowic",
		},
		destrachan: {
			font: "Ar Ciela",
		},
		draconic: {
			font: "Iokharic",
		},
		drowsign: {
			font: "Finger Alphabet",
		},
		druidic: {
			font: "Jungle Slang",
		},
		dwarven: {
			font: "Dethek",
		},
		dziriak: {
			font: "Pulsian",
		},
		elven: {
			font: "Espruar",
		},
		erutaki: {
			font: "Tuzluca",
		},
		garundi: {
			font: "Qijomi",
		},
		giant: {
			font: "Meroitic Demotic",
		},
		gnoll: {
			font: "Kargi",
		},
		gnome: {
			font: "Dethek",
		},
		gnomish: {
			font: "Dethek",
		},
		goblin: {
			font: "Kargi",
		},
		grippli: {
			font: "Semphari",
		},
		hallit: {
			font: "Tengwar",
		},
		ignan: {
			font: "Dethek",
		},
		iruxi: {
			font: "Semphari",
		},
		jistkan: {
			font: "Valmaric",
		},
		jotun: {
			font: "Meroitic Demotic",
		},
		jyoti: {
			font: "Celestial",
		},
		infernal: {
			font: "Infernal",
		},
		kelish: {
			font: "Highschool Runes",
		},
		mwangi: {
			font: "Tengwar",
		},
		necril: {
			font: "High Drowic",
		},
		orc: {
			font: "Dethek",
		},
		orcish: {
			font: "Dethek",
		},
		polyglot: {
			font: "Tengwar",
		},
		protean: {
			font: "Barazhad",
		},
		requian: {
			font: "Reanaarian",
		},
		shoanti: {
			font: "Tengwar",
		},
		skald: {
			font: "Valmaric",
		},
		sphinx: {
			font: "Reanaarian",
		},
		strix: {
			font: "Infernal",
		},
		sylvan: {
			font: "Olde Espruar",
		},
		shoony: {
			font: "Dethek",
		},
		taldane: {
			font: "Tengwar",
		},
		tengu: {
			font: "Oriental",
		},
		terran: {
			font: "Dethek",
		},
		thassilonian: {
			font: "Thassilonian",
		},
		tien: {
			font: "Oriental",
		},
		treant: {
			font: "Olde Espruar",
		},
		undercommon: {
			font: "High Drowic",
		},
		utopian: {
			font: "Maras Eye",
		},
		varisian: {
			font: "Tengwar",
		},
		vegepygmy: {
			font: "Kargi",
		},
		vudrani: {
			font: "Qijomi",
		},
	};

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (actor.system?.traits?.languages) {
			for (let lang of actor.system.traits.languages.total) {
				knownLanguages.add(lang);
			}
			if (actor.system.traits.languages.customTotal) {
				for (let lang of actor.system.traits.languages.customTotal) {
					const key = lang.trim().toLowerCase();
					knownLanguages.add(key);
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
