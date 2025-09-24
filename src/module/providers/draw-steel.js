import LanguageProvider from "./templates/Base.js";

export default class drawSteelLanguageProvider extends LanguageProvider {
	languages = {
		// ancestry languages
		caelian: { // common
			font: "Meroitic Demotic",
		},
		anjali: {
			font: "High Drowic",
		},
		axiomatic: {
			font: "Miroslav Normal",
		},
		filliaric: {
			font: "Kargi",
		},
		highKuric: {
			font: "Maras Eye",
		},
		hyrallic: {
			font: "Ar Ciela",
		},
		illyvric: {
			font: "Ar Ciela",
		},
		kalliak: {
			font: "Kargi",
		},
		kethaic: {
			font: "Semphari",
		},
		khelt: {
			font: "Barazhad",
		},
		khoursirian: {
			font: "Meroitic Demotic",
		},
		lowKuric: {
			font: "Ork Glyphs",
		},
		mindspeech: {
			font: "Saurian",
		},
		protoCtholl: {
			font: "Tengwar",
		},
		szetch: {
			font: "Kargi",
		},
		theFirstLanguage: {
			font: "Mage Script",
		},
		tholl: {
			font: "Tengwar",
		},
		urollialic: {
			font: "Skaven",
		},
		variac: {
			font: "Skaven",
		},
		vastariax: {
			font: "Rellanic",
		},
		vhoric: {
			font: "Maras Eye",
		},
		voll: {
			font: "Celestial",
		},
		yllyric: {
			font: "Ar Ciela",
		},
		zahariax: {
			font: "Dark Eldar",
		},
		zaliac: {
			font: "Floki",
		},
		// Human languages. Khoursirian already covered
		higaran: {
			font: "Meroitic Demotic",
		},
		khemharic: {
			font: "Meroitic Demotic",
		},
		oaxuatl: {
			font: "Meroitic Demotic",
		},
		phaedran: {
			font: "Meroitic Demotic",
		},
		riojan: {
			font: "Meroitic Demotic",
		},
		uvalic: {
			font: "Meroitic Demotic",
		},
		vaniric: {
			font: "Meroitic Demotic",
		},
		vasloria: {
			font: "Meroitic Demotic",
		},
		// Dead languages
		highRhyvian: {
			font: "Ar Ciela",
		},
		khamish: {
			font: "Jungle Slang",
		},
		kheltivari: {
			font: "Barazhad",
		},
		lowRhivian: {
			font: "Ar Ciela",
		},
		oldVariac: {
			font: "Skaven",
		},
		phorialtic: {
			font: "Ork Glyphs",
		},
		rallarian: {
			font: "Floki",
		},
		ullorvic: {
			font: "Ar Ciela",
		},
	};

	async getLanguages() {
		if (this.replaceLanguages) {
			this.languages = {};
			return;
		}
		const languagesSetting = game.settings.get("polyglot", "Languages");
		this.languages = Object.keys(CONFIG.DRAW_STEEL.languages).reduce((outputLangs, lang) => {
			outputLangs[lang] = {
				label: CONFIG.DRAW_STEEL.languages[lang].label,
				font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
			return outputLangs;
		}, {});
	}

	getUserLanguages(actor) {
		let known_languages = new Set();
		let literate_languages = new Set();

		const actorLangs = Array.from(actor.system.biography?.languages);

		if (actorLangs) {
			known_languages = new Set(actorLangs);
		}

		return [known_languages, literate_languages];
	}

	getSystemDefaultLanguage() {
		return "caelian";
	}

	addToConfig(key, lang) {
		if (CONFIG.DRAW_STEEL.languages) {
			CONFIG.DRAW_STEEL.languages[key] = { label: lang };
		}
	}

	removeFromConfig(key) {
		if (CONFIG.DRAW_STEEL.languages) delete CONFIG.DRAW_STEEL.languages[key];
	}
}
