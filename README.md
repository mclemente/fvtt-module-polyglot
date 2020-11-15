# Polyglot

Talk to others using a language you can speak and scrambles text you can't understand, into several fantasy scripts.

Currently supports Forgotten Realms DnD 5e setting, Golarion's Pathfinder, Old-School Essentials and Warhammer.
Partial support to Starfinder.

## Installation

In the setup screen, use the URL `https://raw.githubusercontent.com/kakaroto/fvtt-module-polyglot/master/module.json` to install the module.

## Usage

### Chat

A language selection dropbox is available above the chat text box so you can select which language you want your character to speak in. Text will be posted in that language only if it's an in-character message.

The list of languages you can speak in is the list of languages that the charactes of the selected tokens comprehend (excluding custom languages). If no tokens are selected, then the character that the user represents will be used.

If no languages are available (no tokens, no character selection), then `Common` will be available by default, unless you are the GM, in which case, all the languages are available.

Changing your selected token or character representation will scramble/unscramble text from messages posted within the last 24 hours.

As GM, you can also click on the language button (colored globe) to unscramble a specific message.

![img](https://media.discordapp.net/attachments/542495303929036824/737807675290550324/chat.gif)

#### In-Character vs Out-of-Character

In Foundry, when you don't have a token selected, you are speaking "out of character" and when a token is selected, you are speaking "in character". Polyglot only activates on in-character chats.

Speaking "out of character" is reserved for actual out of character speech (i.e: alanguage from this world, in English for example or whichever language you speak), and in-world languages are for in-character speech.

You don't have to hijack a token to speak in character though, what most people though is to create a single Actor called "Narrator" or "GM" and assign it to their GM player (in the "Player Configuration" dialog by right clicking your name in the bottom left corner).
You can then speak in-character as the GM by simply prefixing your message with the `/ic` command.

Since 1.4.0, GMs have the option to enable Polyglot for out of character speech, by going to the module's configuration settings.

### Journals

You can write text in a specific script and only players who speak that language will understand it. By hovering the text they can see what language the text is written.

The owner of a journal and the DM can scramble/unscramble the text in their screen to see how it looks.

![img](https://media.discordapp.net/attachments/542495303929036824/737807609234456596/journal.gif)

## Credit

The original idea for this module was proposed by `@Talwin Greenwood` on the FVTT discord.
The original PolyGlot module is written by KaKaRoTo. The 'fantasy languages' adaptation is written by elizeuangelo.

## License

This module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
