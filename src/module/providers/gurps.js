import LanguageProvider from "./templates/Base.js";

export default class gurpsLanguageProvider extends LanguageProvider {
	get settings() {
		return {
			LanguageRegex: {
				type: String,
				default: game.i18n.localize("POLYGLOT.Generic.Language"),
			},
		};
	}

	/**
	 * Search through all of the advantages (including recursing into containers) looking for "Language" or translation.
	 * Depending on the source, it can be two different patterns, Language: NAME (optionals) or Language (NAME) (optionals)
	 * and the advantage names may or may not be translated, so we must search for both
	 */
	getUserLanguages(actor) {
		let knownLanguages = new Set();
		let literateLanguages = new Set();
		if (GURPS) {
			const languageRegex = game.settings.get("polyglot", "LanguageRegex");
			// window.GURPS set when the GURPS game system is loaded
			let npat1 = ": +(?<name>[^\\(]+)";
			let npat2 = " +\\((?<name>[^\\)]+)\\)";
			GURPS.recurselist(actor.system.ads, (advantage) => {
				if (!this.updateForPattern(
					advantage,
					new RegExp(languageRegex + npat1, "i"),
					knownLanguages,
					literateLanguages
				)) if (!this.updateForPattern(
					advantage,
					new RegExp(languageRegex + npat2, "i"),
					knownLanguages,
					literateLanguages
				)) if (!this.updateForPattern(
					advantage,
					new RegExp(game.i18n.localize("GURPS.language") + npat1, "i"),
					knownLanguages,
					literateLanguages,
					true
				)) this.updateForPattern(
					advantage,
					new RegExp(game.i18n.localize("GURPS.language") + npat2, "i"),
					knownLanguages,
					literateLanguages,
					true
				);
			});
		}
		return [knownLanguages, literateLanguages];
	}

	/**
	If we match on the Language name, search the name (or the notes)
	for indicators of spoken or written levels of comprehension in English, or translated
  */
	updateForPattern(advantage, regex, knownLanguages, literateLanguages, langDetected = false) {
		let match = advantage.name.match(regex);
		if (match) {
			const lang = match.groups.name.trim().toLowerCase();
			const wpat = new RegExp(game.i18n.localize("GURPS.written"), "i");
			const spat = new RegExp(game.i18n.localize("GURPS.spoken"), "i");
			let written = advantage.name.match(/written/i) || advantage.notes?.match(/written/i);
			if (!written) written = advantage.name.match(wpat) || advantage.notes?.match(wpat);
			let spoken = advantage.name.match(/spoken/i) || advantage.notes?.match(/spoken/i);
			if (!spoken) spoken = advantage.name.match(spat) || advantage.notes?.match(spat);
			if (written && spoken) {
				knownLanguages.add(lang);
				literateLanguages.add(lang);
				return true;
			} else if (written) {
				literateLanguages.add(lang);
				return true;
			} else if (spoken) {
				knownLanguages.add(lang);
				return true;
			} else if (langDetected) { // neither is specificaly identified, assume both if "Language" detected
				knownLanguages.add(lang);
				literateLanguages.add(lang);
				return true;
			}
		}
		return false;
	}
}
