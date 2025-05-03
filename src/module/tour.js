
class PolyglotTour extends foundry.nue.Tour {
	async _preStep() {
		await super._preStep();

		if (this.currentStep.actions) await this.performActions(this.currentStep.actions);

		// If there's tab info, switch to that tab
		if (this.currentStep.tab) await this.switchTab(this.currentStep.tab);
	}

	async performActions(actions) {
		for (const action of actions) {
			switch (action) {
				case "chat-message": {
					await ChatMessage.create({ content: "Polyglot Test Message", flags: { polyglot: { language: "test" } } });
					break;
				}
				case "user-config": {
					await game.user.sheet.render(true);
					break;
				}
				case "end": {
					this.configurator?.close();
					game.user.sheet.close();
					break;
				}
			}
		}
	}

	async switchTab(tab) {
		switch (tab.parent) {
			case "sidebar":
				ui.sidebar.activateTab(tab.id);
				break;
			case "settings": {
				const app = game.settings.sheet;
				await app._render(true);
				app.activateTab(tab.id);
				break;
			}
			case "general": {
				if (!this.configurator) {
					const configurator = game.settings.menus.get("polyglot.GeneralSettings");
					this.configurator = new configurator.type();
				}
				await this.configurator._render(true);
				this.configurator.activateTab(tab.id);
				break;
			}
		}
	}
}

export function registerTours() {
	game.tours.register("polyglot", "test", new PolyglotTour(
		{
			title: "POLYGLOT.TOURS.Main.title",
			description: "POLYGLOT.TOURS.Main.desc",
			restricted: true,
			display: game.settings.get("polyglot", "enableChatFeatures"),
			canBeResumed: true,
			steps: [
				{
					id: "canvas",
					title: "POLYGLOT.TOURS.Main.Canvas.Title",
					content: "POLYGLOT.TOURS.Main.Canvas.Content",
					tab: { parent: "sidebar", id: "chat" }
				},
				{
					id: "language-selector",
					selector: ".polyglot-lang-select",
					title: "POLYGLOT.TOURS.Main.LanguageSelector.Title",
					content: "POLYGLOT.TOURS.Main.LanguageSelector.Content"
				},
				{
					id: "language-selector-dropdown",
					selector: ".polyglot-lang-select .ts-wrapper",
					title: "POLYGLOT.TOURS.Main.LanguageSelectorSelect.Title",
					content: "POLYGLOT.TOURS.Main.LanguageSelectorSelect.Content"
				},
				{
					id: "language-selector-dropdown",
					selector: ".polyglot-lang-select .ts-wrapper",
					title: "POLYGLOT.TOURS.Main.LanguageSelectorSelect2.Title",
					content: "POLYGLOT.TOURS.Main.LanguageSelectorSelect2.Content"
				},
				{
					id: "language-selector-pips",
					selector: ".polyglot-lang-select .ts-wrapper",
					title: "POLYGLOT.TOURS.Main.LanguageSelectorPips.Title",
					content: "POLYGLOT.TOURS.Main.LanguageSelectorPips.Content",
					actions: ["chat-message"]
				},
				{
					id: "chat-message",
					selector: ".chat-log .chat-message:last-of-type",
					title: "POLYGLOT.TOURS.Main.ChatMessage.Title",
					content: "POLYGLOT.TOURS.Main.ChatMessage.Content",
				},
				{
					id: "chat-message-scrambled",
					selector: ".chat-log .chat-message:last-of-type .polyglot-original-text",
					title: "POLYGLOT.TOURS.Main.ChatMessageScrambled.Title",
					content: "POLYGLOT.TOURS.Main.ChatMessageScrambled.Content",
				},
				{
					id: "chat-message-translation",
					selector: ".chat-log .chat-message:last-of-type .polyglot-translation-text",
					title: "POLYGLOT.TOURS.Main.ChatMessageTranslation.Title",
					content: "POLYGLOT.TOURS.Main.ChatMessageTranslation.Content",
				},
				{
					id: "chat-message-globe",
					selector: ".chat-log .chat-message:last-of-type .polyglot-message-language",
					title: "POLYGLOT.TOURS.Main.ChatMessageGlobe.Title",
					content: "POLYGLOT.TOURS.Main.ChatMessageGlobe.Content",
				},
				{
					id: "chat-message-ending",
					selector: ".chat-log .chat-message:last-of-type",
					title: "POLYGLOT.TOURS.Main.ChatMessageEnding.Title",
					content: "POLYGLOT.TOURS.Main.ChatMessageEnding.Content",
				},
				{
					id: "players-list",
					selector: "#ui-left aside#players #players-active",
					title: "POLYGLOT.TOURS.Main.PlayersList.Title",
					content: "POLYGLOT.TOURS.Main.PlayersList.Content"
				},
				{
					id: "user-config",
					selector: ".application.user-config",
					title: "POLYGLOT.TOURS.Main.UserConfig.Title",
					content: "POLYGLOT.TOURS.Main.UserConfig.Content",
					actions: ["user-config"]
				},
				{
					id: "user-config-select-character",
					selector: ".application.user-config fieldset:has(.form-group.character)",
					title: "POLYGLOT.TOURS.Main.UserConfigSelectCharacter.Title",
					content: "POLYGLOT.TOURS.Main.UserConfigSelectCharacter.Content",
					actions: ["user-config"]
				},
				{
					id: "actor-ownership",
					selector: "#sidebar #actors",
					title: "POLYGLOT.TOURS.Main.ActorOwnership.Title",
					content: "POLYGLOT.TOURS.Main.ActorOwnership.Content",
					tab: { parent: "sidebar", id: "actors" }
				},
				{
					id: "end",
					title: "POLYGLOT.TOURS.Main.End.Title",
					content: "POLYGLOT.TOURS.Main.End.Content",
					actions: ["end"]
				}
			]
		}
	));
}
