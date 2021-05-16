# v1.6.1
- Added Font selection for languages (default and custom). Known issue: To remove default languages from the list Replace Languages is enabled, you'll have to Reset Defaults (and it will remove any alphabet settings you already had).

# v1.6.0
- FoundryVTT 0.8.x compatibility.

# v1.5.18
- Reordered settings.
- Replace Languages setting now removes original languages from menus (like D&D 5e and PF2e).
- PF2e: Custom Languages are added to the Languages menu..

# v1.5.17
- PF2E: Fixed custom languages being show as as "PF2E.Language" followed by a unintelligible string of characters.
- Merged D&D 3.5e and D&D 5e's fonts into a single file.
- Increased Sylvan (OldeEspruar) font size from 150% to 200% on all font files for better readability.

# v1.5.16
- Das Schwarze Auge: Added Garethi as the default language.
- Das Schwarze Auge: Fixed Isdira not having a proper font.
- Updated Spanish translation.

# v1.5.15
- Removed the Toggle Runes Text on Journals setting.
- Fixed journal owners being able to write in languages they didn't know.
- Das Schwarze Auge: Fixed languages not being loaded properly.
- Das Schwarze Auge: Fixed literacy languages being shown in the dropdown menu.
- Shadow of the Demon Lord: Fixed characters being able to speak languages they could only read.

# v1.5.14
- Fixed PF2E's languages.

# v1.5.13
- Added full support to Das Schwarze Auge. If you have the [DSA5 Core Rules](https://foundryvtt.com/packages/dsa5-core), the languages are now shown in the language selector.
- Changed how Shadow of the Demon Lord languages are selected:
- - Before: Languages were loaded from your Items Directory.
- - Now: Languages are loaded from the Languages Compendium, any additional languages should be input into the Custom Languages setting.

# v1.5.12
- Support for literacy for Das Schwarze Auge and Shadow of the Demon Lord. Characters will need the Literacy skill (DSA) or the Read value on the language (SOTDL) to read text on journal entries.

# v1.5.11
- Added more Das Schwarze Auge fonts.
- Fixed Shadow of the Demon Lord languages.

# v1.5.10
- When the `Display translations` setting is on and the `Scramble for GM` setting is off, it'll show "Translated from *language*" instead of just "Translation".
- Fixed Das Schwarze Auge fonts for the Premium Content.

# v1.5.9
- Added support to Shadow of the Demon Lord (thanks to [@Patrick Porto](https://github.com/patrickporto)).

# v1.5.8
- Fixed Das Schwarze Auge fonts not being shown.

# v1.5.7.3
- Replaced the translation box with a horizontal line.
- Added language fonts for Das Schwarze Auge.

# v1.5.7.2
- Added support to Aria (thanks to [@Dilomos](https://github.com/Dilomos)).
- Added German translation (thanks to [@Nyhles](https://github.com/Nyhles)).

# v1.5.7.1
- Added support to DCC.
- Added partial support to Das Schwarze Auge.
- Added Japanese translation (thanks to [Touge](https://github.com/BrotherSharper)).
- Updated Spanish translation.

# v1.5.7.0
- Settings were reordered. Settings related to Languages or Chat are separated into their own menu to save space and keep things ordered.
- Added a Replace System's Languages setting, which removes every default language from the dropdown menu.

# v1.5.6.13
- Fixed an issue in Pathfinder 2e where the damage message outputted by NPCs would be translated if the Scramble on OOC chat messages setting was enabled. 

# v1.5.6.12
- Any system with languages set up as `CONFIG.SYSTEMNAME.languages` (e.g. dnd5e's is CONFIG.DND5E.languages) should show the languages without needing to make changes to the module. Adding a font to each language still requires changing the module, though.

# v1.5.6.11
- Added support to CoC7.
- Updated Spanish translation (thanks to [@lozalojo](https://github.com/lozalojo)).
- Added Czech translation (thanks to [@KarelZavicak](https://github.com/KarelZavicak)).

# v1.5.6.10
- SW5e: "Updated fonts to more closely match the languages found on Wookieepedia that have visual references." (thanks to [@whtwlf](https://github.com/whtwlf)).

# v1.5.6.9
- Added support to SW5e (thanks to [@mxzf](https://github.com/mxzf)).

# v1.5.6.8
- Fixed an issue with Tongues feature which couldn't translate languages, only be translated.
- Fixed an issue with OSE system where the default language wasn't being set properly.

# v1.5.6.7
- Text inside the Translation Box is now selectable.

# v1.5.6.6
- Added a "Hide Globe and "Translated From" text from players" so you can hide the language you're speaking on from your players.

# v1.5.6.5
- Fixed an issue with setting the Common language on WFRP4 (and possibly SWADE).

# v1.5.6.4
- Fixed an issue with the Common language not being set properly.
- Fixed an edge case where the module would throw errors when a message would be deleted faster than it would translate it.

# v1.5.6.3
- Fixed an issue with the Common language being scrambled in D&D 5e games that were using Babele.
- Improved Babele support to WFRP4 (thanks to [@sladecraven](https://github.com/sladecraven)).
- Added French translation (thanks to [@sladecraven](https://github.com/sladecraven)).

# v1.5.6.2
- Fixed an issue with the Common language not being properly shown as the default language when selecting a token.

# v1.5.6.1
- Added Babele support to WFRP4.
- Added a Toggle Runes Text on Journals. It toggles the visibility of the `Runes` text on Journals, so you have some extra space on the header.

# v1.5.6
- Added the Comprehend Languages setting. Input a Custom Language you've already set and it becomes a language that can't be spoken but can understand all languages, written or spoken.
- Added the Tongues setting. Input a Custom Language you've already set and it becomes a language that can understand all spoken languages and be understood by all actors, but can't be written.
- Added partial support to SWADE. You have to add a skill like this `Language (Name)` and it'll show up on the menu.
- Fixed the module not working with 3.5e.

![image](https://user-images.githubusercontent.com/5288872/109089668-61cd3880-76f0-11eb-88ee-57f3e2c00658.png)

# v1.5.5.1
- Added Korean translation (thanks to [https://github.com/drdwing](@drdwing)).

# v1.5.5
- Fixed Translation Box translating Common.
- Fixed Spanish translation not showing.

# v1.5.4
- Added Translation Box setting (thanks to [https://github.com/ironmonk88](@ironmonk88)). Players can now choose between showing the language's script along with a translation box or the original functionality.

# v1.5.3
- Fixed a bug that caused the addon to not load on D&D 5e.
- Added Spanish translation (thanks to [https://github.com/juanfrank](@juanfrank)).

# v1.5.2
- Added D&D 3.5e support.
- D&D 5e: Added fonts to Aarakocra, Halfling and Thieves' Cant.
- Fixed the module not downloading with the fonts and settings folders.

# v1.5
- Added localization support.
- Added support to the Tormenta20 system.
- Reduced the Journal's Rune Highlight from 0.75 to 0.25.
- Added Starfinder support. I don't play the system, so I wasn't sure which fonts would suit each language, I'm open for suggestions.