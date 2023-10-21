import LanguageProvider from "./templates/Base.js";

export default class darkHeresyLanguageProvider extends LanguageProvider {
	languages = {
		lowGothic: {
			font: "Infernal",
		},
		chapterRunes: {
			font: "",
		},
		chaosMarks: {
			font: "",
		},
		eldar: {
			font: "",
		},
		highGothic: {
			font: "Infernal",
		},
		imperialCodes: {
			font: "",
		},
		mercenary: {
			font: "",
		},
		necrontyr: {
			font: "",
		},
		ork: {
			font: "Ork Glyphs",
		},
		technaLingua: {
			font: "",
		},
		tau: {
			font: "",
		},
		underworld: {
			font: "",
		},
		xenosMarkings: {
			font: "",
		},
	};

	getSystemDefaultLanguage() {
		return "lowGothic";
	}

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
		} else {
			const originalLanguages = {
				chapterRunes: "Chapter Runes",
				chaosMarks: "Chaos Marks",
				eldar: "Eldar",
				highGothic: "High Gothic",
				imperialCodes: "Imperial Codes",
				lowGothic: "Low Gothic",
				mercenary: "Mercenary",
				necrontyr: "Necrontyr",
				ork: "Ork",
				tau: "Tau",
				technaLingua: "Techna-Lingua",
				underworld: "Underworld",
				xenosMarkings: "Xenos Markings",
			};
			const langs = {};
			const languagesSetting = game.settings.get("polyglot", "Languages");
			for (let lang in originalLanguages) {
				langs[lang] = {
					label: originalLanguages[lang],
					font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
					rng: languagesSetting[lang]?.rng ?? "default",
				};
			}
			this.languages = langs;
		}
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		for (let lang in actor.system.skills.linguistics.specialities) {
			if (actor.system.skills.linguistics.specialities[lang].advance >= 0) knownLanguages.add(lang);
		}
		return [knownLanguages, literateLanguages];
	}
}
