# Development

## Building

### Prerequisites

In order to build this module, recent versions of `node` and `npm` are
required. Most likely, using `yarn` also works, but only `npm` is officially
supported. We recommend using the latest lts version of `node`. If you use `nvm`
to manage your `node` versions, you can simply run

```
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```
npm install
```

### Building

You can build the project by running

```
npm run build
```

Alternatively, you can run

```
npm run build:watch
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link
the built module to your local Foundry VTT installation's data folder. In
order to do so, first add a file called `foundryconfig.json` to the project root
with the following content:

```
{
  "dataPath": ["/absolute/path/to/your/FoundryVTT"]
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of
`/`)

Then run

```
npm run link-project
```

On Windows, creating symlinks requires administrator privileges, so
unfortunately you need to run the above command in an administrator terminal for
it to work.

You can also link to multiple data folders by specifying multiple paths in the
`dataPath` array.

## System Support

If you want to add support for a system, be sure to check the [API page](../../wiki/API).

The guide assumes you're contributing the code to another module or system. If you want to contribute to this project, you will still need to create a subclass, but you should add it to [LanguageProvider.js](/module/LanguageProvider.js) and its name to the import list on [api.js](src/module/api.js).

# Translations

<a href="https://weblate.foundryvtt-hub.com/engage/polyglot/">
<img src="https://weblate.foundryvtt-hub.com/widgets/polyglot/-/multi-auto.svg" alt="Translation status" />
</a>

Polyglot is available in the following languages:

-   Czech, thanks to [KarelZavicak](https://github.com/KarelZavicak)
-   English
-   Finnish, thanks to [Demian Wright](https://github.com/DemianWright)
-   French, thanks to [sladecraven](https://github.com/sladecraven)
-   German, thanks to [Nyhles](https://github.com/Nyhles)
-   Italian, thanks to [EldritchTranslator](https://github.com/EldritchTranslator)
-   Japanese, thanks to [BrotherSharper](https://github.com/BrotherSharper)
-   Korean, thanks to [drdwing](https://github.com/drdwing)
-   Polish, thanks to [MichalGolaszewski](https://github.com/MichalGolaszewski)
-   Portuguese (Brazil)
-   Spanish, thanks to [juanfrank](https://github.com/juanfrank), [lozalojo](https://github.com/lozalojo), [GoR](github.com/Git-GoR)
-   Swedish, thanks to [Jonas Karlsson](https://github.com/xdy)

## Contributing

If you want to contribute with any translation, check out [Polyglot's Weblate page](https://weblate.foundryvtt-hub.com/engage/polyglot/).

### System Specific Translations

Some translations are specific to a system (e.g. `COC7`, `SWADE`, and `WFRP4E`. When in doubt about its translation, check up with other translators of the system or the Babele module's translation.
