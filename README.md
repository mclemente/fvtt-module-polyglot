![GitHub release](https://img.shields.io/github/release-date/League-of-Foundry-Developers/fvtt-module-polyglot)
![all versions](https://img.shields.io/github/downloads/League-of-Foundry-Developers/fvtt-module-polyglot/total)
![the latest version](https://img.shields.io/github/downloads/League-of-Foundry-Developers/fvtt-module-polyglot/latest/total)
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpolyglot)

![Polyglot](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FLeague-of-Foundry-Developers%2Fleague-repo-status%2Fshields-endpoint%2Fpolyglot.json)
[![ko-fi](https://img.shields.io/badge/ko--fi-Support%20Me-red?style=flat-square&logo=ko-fi)](https://ko-fi.com/mclemente)

# Polyglot

Talk to others using a language you can speak and scrambles text you can't understand, into several fantasy scripts.

## How to Use

### Generic System

If your system isn't supported (your Language Provider will be named "Generic"), you can add languages by adding items with this pattern: `Language (Foo)` for the language `Foo`. The language will then show up on the selector on the chat box.  
Remember to add the languages to the Custom Languages setting to be able to change its alphabet (you'll notice it isn't there because the name on the selector will be lowercased).

### Chat

A language selection dropbox is available above the chat text box so you can select which language you want your character to speak in.  
When loading a world, only the last 100 messages are scrambled to avoid making load times insane on a big chat log.

### Macros

Check out the [Macros wiki](../../wiki/Macros).

### Polyglot and FVTT Behavior

-   **Actor Permissions:** If a player has Owner/Observer permission for a character, they will be able to read messages as that character ([example gif](https://media.discordapp.net/attachments/542495303929036824/737807675290550324/chat.gif)).
-   **Out of Character vs In Character:** By default, Polyglot only activates on in-character messages, which can be changed on a setting.

### Journal

You can write text in a specific script and only players who speak that language will understand it. By hovering the text they can see what language the text is written.  
The owner of a journal and the GM can scramble/unscramble the text in their screen to see how it looks.

### Item Descriptions

Item descriptions are not supported by Polyglot because they are implemented differently on each system. Also, on systems where it has a Journal editor, its owner would be able to remove the translation, which might have voided the entire point of putting text they can't read.

### API

If you want to implement Polyglot into your system, check out the [API wiki](../../wiki/API).

## Credit

The original idea for this module was proposed by `@Talwin Greenwood` on the FVTT discord.  
The original PolyGlot module is written by KaKaRoTo. The 'fantasy languages' adaptation is written by elizeuangelo.  
[@ironmonk88](https://github.com/ironmonk88) for the Translation Box.  
[@manuelVo](https://github.com/manuelVo) for the API code.  
This module uses code of [Soundboard](https://github.com/BlitzKraig/fvtt-SoundBoard), by Blitz, released under the MIT License.

## License

This module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).  
This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for Module Development v 0.1.6](https://foundryvtt.com/article/license/).
