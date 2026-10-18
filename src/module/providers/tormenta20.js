import LanguageProvider from "./templates/Base.js";

export default class tormenta20LanguageProvider extends LanguageProvider {
	languages = {
		comum: {
			font: "Thorass",
		},
		abissal: {
			font: "Barazhad",
		},
		anao: {
			font: "Dethek",
		},
		aquan: {
			font: "Olde Thorass",
		},
		auran: {
			font: "Olde Thorass",
		},
		celestial: {
			font: "Celestial",
		},
		draconico: {
			font: "Iokharic",
		},
		elfico: {
			font: "Espruar",
		},
		gigante: {
			font: "Meroitic Demotic",
		},
		gnoll: {
			font: "Kargi",
		},
		goblin: {
			font: "Kargi",
		},
		ignan: {
			font: "Olde Thorass",
		},
		infernal: {
			font: "Infernal",
		},
		orc: {
			font: "Dethek",
		},
		silvestre: {
			font: "Olde Espruar",
		},
		terran: {
			font: "Olde Thorass",
		},
	};

	getSystemDefaultLanguage() {
		return "comum";
	}

	async getLanguages() {
		const settings = game.settings.get("polyglot", "Languages");
		const languages = {};

		if (!this.replaceLanguages) {
			for (const [id, systemLabel] of Object.entries(CONFIG.T20.idiomas ?? {})) {
				if (!systemLabel) continue;

				// Prefer a label configured through Polyglot.
				const label = settings[id]?.label?.trim() || systemLabel;

				languages[id] = {label, font: settings[id]?.font || this.languages[id]?.font || this.defaultFont, rng: settings[id]?.rng ?? "default"};

				// Make the label available to the T20 sheet.
				CONFIG.T20.idiomas[id] = label;
			}
		}

		this.languages = languages;
	}

	addToConfig(key, label) {
		CONFIG.T20.idiomas ??= {};
		CONFIG.T20.idiomas[key] = label;
	}

	removeFromConfig(key) {
		if (CONFIG.T20.idiomas) {
			delete CONFIG.T20.idiomas[key];
		}
	}

	getUserLanguages(actor) {
		const traits = actor?.system?.tracos?.idiomas;

		const knownLanguages = new Set(traits?.value ?? []);
		const literateLanguages = new Set();

		const custom = traits?.custom ?? "";

		for (const language of custom.split(/[,;]/)) {
			const name = language.trim();
			if (!name) continue;

			const id = name.slugify({replacement: "_"});

			knownLanguages.add(id);
		}

		return [knownLanguages, literateLanguages];
	}
}
