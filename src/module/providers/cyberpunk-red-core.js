import LanguageProvider from "./templates/Base.js";

export default class cyberpunkRedLanguageProvider extends LanguageProvider {
	defaultFont = "Olde English";

	languages = {
		streetslang: {
			font: "Olde English",
		},
		arabic: {
			font: "Ar Ciela",
		},
		bengali: {
			font: "Olde English",
		},
		berber: {
			font: "Olde English",
		},
		burmese: {
			font: "Ar Ciela",
		},
		cantonese: {
			font: "Oriental",
		},
		chinese: {
			font: "Oriental",
		},
		cree: {
			font: "Olde English",
		},
		creole: {
			font: "Olde English",
		},
		dari: {
			font: "Olde English",
		},
		dutch: {
			font: "Olde English",
		},
		english: {
			font: "Olde English",
		},
		farsi: {
			font: "Ar Ciela",
		},
		filipino: {
			font: "Ar Ciela",
		},
		finnish: {
			font: "Kremlin Premier",
		},
		french: {
			font: "Olde English",
		},
		german: {
			font: "Miroslav Normal",
		},
		guarani: {
			font: "Olde English",
		},
		hausa: {
			font: "Olde English",
		},
		hawaiian: {
			font: "Olde English",
		},
		hebrew: {
			font: "Olde English",
		},
		hindi: {
			font: "Ar Ciela",
		},
		indonesian: {
			font: "Ar Ciela",
		},
		italian: {
			font: "Olde English",
		},
		japanese: {
			font: "Oriental",
		},
		khmer: {
			font: "Ar Ciela",
		},
		korean: {
			font: "Oriental",
		},
		lingala: {
			font: "Olde English",
		},
		malayan: {
			font: "Ar Ciela",
		},
		mandarin: {
			font: "Oriental",
		},
		maori: {
			font: "Olde English",
		},
		mayan: {
			font: "Olde English",
		},
		mongolian: {
			font: "Ar Ciela",
		},
		navajo: {
			font: "Olde English",
		},
		nepali: {
			font: "Ar Ciela",
		},
		norwegian: {
			font: "Miroslav Normal",
		},
		oromo: {
			font: "Olde English",
		},
		pamanyungan: {
			font: "Olde English",
		},
		polish: {
			font: "Kremlin Premier",
		},
		portuguese: {
			font: "Olde English",
		},
		quechua: {
			font: "Olde English",
		},
		romanian: {
			font: "Kremlin Premier",
		},
		russian: {
			font: "Kremlin Premier",
		},
		sinhalese: {
			font: "Olde English",
		},
		spanish: {
			font: "Olde English",
		},
		swahili: {
			font: "Olde English",
		},
		tahitian: {
			font: "Olde English",
		},
		tamil: {
			font: "Olde English",
		},
		turkish: {
			font: "Ar Ciela",
		},
		twi: {
			font: "Olde English",
		},
		ukrainian: {
			font: "Kremlin Premier",
		},
		urdu: {
			font: "Ar Ciela",
		},
		vietnamese: {
			font: "Ar Ciela",
		},
		yoruba: {
			font: "Olde English",
		},
	};

	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	async getLanguages() {
		const originalLanguages = {
			streetslang: "Streetslang",
			arabic: "Arabic",
			bengali: "Bengali",
			berber: "Berber",
			burmese: "Burmese",
			cantonese: "Cantonese",
			chinese: "Scrapbook Chinese",
			cree: "Cree",
			creole: "Creole",
			dari: "Dari",
			dutch: "Dutch",
			english: "English",
			farsi: "Farsi",
			filipino: "Filipino",
			finnish: "Finnish",
			french: "French",
			german: "German",
			guarani: "Guarani",
			hausa: "Hausa",
			hawaiian: "Hawaiian",
			hebrew: "Hebrew",
			hindi: "Hindi",
			indonesian: "Indonesian",
			italian: "Italian",
			japanese: "Japanese",
			khmer: "Khmer",
			korean: "Korean",
			lingala: "Lingala",
			malayan: "Malayan",
			mandarin: "Mandarin",
			maori: "Maori",
			mayan: "Mayan",
			mongolian: "Mongolian",
			navajo: "Navajo",
			nepali: "Nepali",
			norwegian: "Norwegian",
			oromo: "Oromo",
			pamanyungan: "Pama-nyungan",
			polish: "Polish",
			portuguese: "Portuguese",
			quechua: "Quechua",
			romanian: "Romanian",
			russian: "Russian",
			sinhalese: "Sinhalese",
			spanish: "Spanish",
			swahili: "Swahili",
			tahitian: "Tahitian",
			tamil: "Tamil",
			turkish: "Turkish",
			twi: "Twi",
			ukrainian: "Ukrainian",
			urdu: "Urdu",
			vietnamese: "Vietnamese",
			yoruba: "Yoruba",
		};
		const langs = {};
		const languagesSetting = game.settings.get("polyglot", "Languages");
		for (let lang in originalLanguages) {
			const label = originalLanguages[lang];
			if (!label) continue;
			langs[lang] = {
				label,
				font: languagesSetting[lang]?.font || this.languages[lang]?.font || this.defaultFont,
				rng: languagesSetting[lang]?.rng ?? "default",
			};
		}
		this.languages = this.replaceLanguages ? {} : langs;
	}

	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		const languageRegex = game.settings.get("polyglot", "LanguageRegex");
		let myRegex = new RegExp(`${languageRegex}\\s*\\((.+)\\)`, "i");
		for (let item of actor.items) {
			if (item.type === "skill") {
				if (myRegex.test(item.name)) {
					knownLanguages.add(item.name.match(myRegex)[1].trim().toLowerCase());
				}
			}
		}
		return [knownLanguages, literateLanguages];
	}
}
