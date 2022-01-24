Hooks.on('polyglot.init', (LanguageProvider) => {
  // Native Check
  if (game.system.id !== 'a5e') return;

  console.log('Registered A5E PL');
  
  class A5ELanguageProvider extends LanguageProvider {
    get originalAlphabets() {
      return {
        common: "130% Thorass",
        abyssal: "150% Barazhad",
        auran: "200% OldeThorass",
        celestial: '180% Celestial',
        elvish: "150% Espruar",
        outwordly: "200% ArCiela",
        draconic: "170% Iokharic",
        drowic: "150% HighDrowic",
        druidic: "120% JungleSlang",
        dwarvish: "120% Dethek",
        giant: "200% ElderFuthark",
        gnoll: "150% Kargi",
        infernal: "230% Infernal",
        sylvan: "200% OldeEspruar",
        serpent: "120% Ophidian",
        tirsu: "250% Pulsian",
      };
    }

    get originalTongues() {
      return {
        _default: "common",
        abyssal: "infernal",
        aquan: "dwarvish",
        auran: "dwarvish",
        cant: "common",
        celestial: "celestial",
        deep: "outwordly",
        draconic: "draconic",
        druidic: "druidic",
        dwarvish: "dwarvish",
        elvish: "elvish",
        giant: "dwarvish",
        gnoll: "gnoll",
        gnomish: "dwarvish",
        goblin: "dwarvish",
        halfling: "common",
        ignan: "dwarvish",
        infernal: "infernal",
        orc: "dwarvish",
        primordial: "dwarvish",
        sylvan: "elvish",
        terran: "dwarvish",
        undercommon: "elvish",
      };
    }

    async getLanguages() {
      const replaceLanguages = game.settings.get("polyglot", "replaceLanguages");
      const langs = {};
      if (replaceLanguages) {
        CONFIG.A5E.languages = {};
      } else {
        for (let lang in CONFIG.A5E.languages) {
          langs[lang] = game.i18n.localize(CONFIG.A5E.languages[lang]);
        }
      }

      this.languages = langs;
    }

    /**
     * Get an actor's languages 
     * @param {Document} actor 
     * @returns [Set, Set]
     */
    getUserLanguages(actor) {
      const known_languages = new Set();
      const literate_languages = new Set();

      const langs = actor.data.data.proficiencies?.languages;
      if (!langs) return [known_languages, literate_languages];

      langs.forEach( lang =>  {
        if (this.languages[lang]) known_languages.add(lang);
      });
      
      return [known_languages, literate_languages];
    }
  }

  polyglot.registerSystem("a5e", A5ELanguageProvider)
});


