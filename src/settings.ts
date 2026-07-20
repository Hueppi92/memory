import '/src/scss/base/main.scss';
import '/src/scss/pages/settings.scss';
import { loadGameSettings, saveGameSettings, type GameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID, THEME_CATALOG } from './theme-catalog';

const gameBarPlaceholders = {
	theme: 'Game Theme',
	player: 'Player',
	boardSize: 'Board Size',
} as const;

const gameBarLabels = {
	theme: {
		codeVibes: 'Code vibes',
		gaming: 'Gaming',
		daProjects: 'DA projects',
		foods: 'Foods',
	},
	player: {
		blue: 'Blue',
		orange: 'Orange',
	},
	boardSize: {
		'16': '16 Cards',
		'24': '24 Cards',
		'36': '36 Cards',
	},
} as const;

type ThemePreviewContext = {
	previewImage: HTMLImageElement;
	defaultPreviewSource: string;
	themeInputs: NodeListOf<HTMLInputElement>;
};

type GameBarPreviewContext = {
	gameTheme: HTMLElement;
	player: HTMLElement;
	boardSize: HTMLElement;
	startButton: HTMLAnchorElement;
};

type PreviewGroup = {
	name: 'theme' | 'player' | 'boardSize';
	key: 'theme' | 'player' | 'boardSize';
};

initSettingsPage();

/**
 * Wires up the settings page when the module loads.
 */
function initSettingsPage() {
	renderThemeOptions();
	applySavedSelections();
	initThemePreview();
	initGameBarPreview();
}

/**
 * Renders the available theme choices into the settings form.
 */
function renderThemeOptions() {
	const themeList = document.querySelector<HTMLUListElement>('#themeSettings ul');

	if (!themeList) {
		return;
	}

	themeList.innerHTML = THEME_CATALOG.map((theme) => {
		return `<li><label><input type="radio" name="theme" value="${theme.id}" /> ${theme.label} theme <img src="../assets/ui/setting_line.svg" alt="Setting line icon" /></label></li>`;
	}).join('');
}

/**
 * Restores the saved selections into the form controls.
 */
function applySavedSelections() {
	const savedSettings = loadGameSettings();

	setCheckedInput('theme', savedSettings.theme ?? DEFAULT_THEME_ID);
	setCheckedInput('player', savedSettings.player);
	setCheckedInput('boardSize', savedSettings.boardSize);
}

/**
 * Marks the input that matches the provided value.
 *
 * @param name - The radio group name
 * @param value - The value to select, if any
 */
function setCheckedInput(name: string, value?: string | number) {
	if (!value) {
		return;
	}

	const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${String(value)}"]`);

	if (input) {
		input.checked = true;
	}
}

/**
 * Reads the currently selected value for a radio group.
 *
 * @param name - The radio group name
 * @returns The selected value, or `undefined` when nothing is selected
 */
function getSelectedValue(name: string) {
	return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value;
}

/**
 * Resolves the display label for a theme id.
 *
 * @param theme - The theme id to look up
 * @returns The theme's label, or the id itself if unrecognized
 */
function getThemeLabel(theme: string) {
	return THEME_BY_ID[theme]?.label ?? theme;
}

/**
 * Resolves the display label for a player id.
 *
 * @param player - The player id to look up
 * @returns A readable label, or the original value if unrecognized
 */
function getPlayerLabel(player: string) {
	if (player === 'blue') {
		return 'Blue';
	}

	if (player === 'orange') {
		return 'Orange';
	}

	return player;
}

/**
 * Formats the board size for the preview bar.
 *
 * @param boardSize - The number of cards on the board
 * @returns The formatted label, e.g. `"24 Cards"`
 */
function getBoardSizeLabel(boardSize: number) {
	return `${boardSize} Cards`;
}

/**
 * Sets up the theme preview image and hover behavior.
 */
function initThemePreview() {
	const context = getThemePreviewContext();
	if (!context) {
		return;
	}

	updateThemePreview(context, getSelectedValue('theme'));
	bindThemePreviewEvents(context);
}

/**
 * Sets up the game bar preview and selection state.
 */
function initGameBarPreview() {
	const context = getGameBarPreviewContext();
	if (!context) {
		return;
	}

	bindStartButtonGuard(context.startButton);
	updateGameBarPreview(context, getSelectedSettings());
	syncStartButtonState(context);
	bindGameBarPreviewGroups(context);
}

/**
 * Collects the elements needed to update the theme preview.
 *
 * @returns The theme preview context, or `null` if required elements are missing
 */
function getThemePreviewContext(): ThemePreviewContext | null {
	const previewImage = document.getElementById('themePreviewImage') as HTMLImageElement | null;
	const themeInputs = document.querySelectorAll<HTMLInputElement>('input[name="theme"]');
	if (!previewImage || themeInputs.length === 0) {
		return null;
	}

	const defaultPreviewSource = THEME_BY_ID[DEFAULT_THEME_ID]?.previewUrl ?? previewImage.src;
	return { previewImage, defaultPreviewSource, themeInputs };
}

/**
 * Updates the preview image for the given theme.
 *
 * @param context - The theme preview context to update
 * @param theme - The theme id to preview, if any
 */
function updateThemePreview(context: ThemePreviewContext, theme?: string) {
	if (!theme) {
		context.previewImage.src = context.defaultPreviewSource;
		return;
	}

	const nextPreviewSource = THEME_BY_ID[theme]?.previewUrl;
	if (nextPreviewSource) {
		context.previewImage.src = nextPreviewSource;
	}
}

/**
 * Attaches hover and focus handlers to the theme inputs.
 *
 * @param context - The theme preview context to update on interaction
 */
function bindThemePreviewEvents(context: ThemePreviewContext) {
	context.themeInputs.forEach((input) => {
		bindThemePreviewLabelEvents(input.closest('label'), context, input.value);
		bindThemePreviewInputEvents(input, context);
	});
}

/**
 * Temporarily switches the theme preview while a label is hovered or focused.
 *
 * @param label - The label wrapping the theme input, if any
 * @param context - The theme preview context to update
 * @param inputValue - The theme id represented by the input
 */
function bindThemePreviewLabelEvents(label: HTMLLabelElement | null, context: ThemePreviewContext, inputValue: string) {
	const resetPreview = () => updateThemePreview(context, getSelectedValue('theme'));
	label?.addEventListener('mouseenter', () => updateThemePreview(context, inputValue));
	label?.addEventListener('mouseleave', resetPreview);
	label?.addEventListener('focusin', () => updateThemePreview(context, inputValue));
	label?.addEventListener('focusout', resetPreview);
}

/**
 * Keeps the preview in sync with keyboard focus and selection changes.
 *
 * @param input - The theme input to observe
 * @param context - The theme preview context to update
 */
function bindThemePreviewInputEvents(input: HTMLInputElement, context: ThemePreviewContext) {
	const resetPreview = () => updateThemePreview(context, getSelectedValue('theme'));
	input.addEventListener('focus', () => updateThemePreview(context, input.value));
	input.addEventListener('change', () => updateThemePreview(context, input.value));
	input.addEventListener('blur', resetPreview);
}

/**
 * Collects the elements needed to update the game bar preview.
 *
 * @returns The game bar preview context, or `null` if required elements are missing
 */
function getGameBarPreviewContext(): GameBarPreviewContext | null {
	const gameTheme = document.getElementById('game_theme');
	const player = document.getElementById('player');
	const boardSize = document.getElementById('board_size');
	const startButton = document.getElementById('startButton') as HTMLAnchorElement | null;
	if (!gameTheme || !player || !boardSize || !startButton) {
		return null;
	}

	return { gameTheme, player, boardSize, startButton };
}

/**
 * Reads the current game settings from the form.
 *
 * @returns The settings currently selected in the form
 */
function getSelectedSettings(): GameSettings {
	const selectedBoardSize = getSelectedValue('boardSize');
	return {
		theme: getSelectedValue('theme'),
		player: getSelectedValue('player'),
		boardSize: selectedBoardSize ? Number(selectedBoardSize) : undefined,
	};
}

/**
 * Updates the preview bar text with the selected settings.
 *
 * @param context - The game bar preview context to update
 * @param settings - The settings to display
 */
function updateGameBarPreview(context: GameBarPreviewContext, settings: GameSettings) {
	context.gameTheme.textContent = settings.theme ? getThemeLabel(settings.theme) : gameBarPlaceholders.theme;
	context.player.textContent = settings.player ? getPlayerLabel(settings.player) : gameBarPlaceholders.player;
	context.boardSize.textContent = settings.boardSize ? getBoardSizeLabel(settings.boardSize) : gameBarPlaceholders.boardSize;
}

/**
 * Binds all preview interactions for the settings groups.
 *
 * @param context - The game bar preview context to update on interaction
 */
function bindGameBarPreviewGroups(context: GameBarPreviewContext) {
	const groups: PreviewGroup[] = [
		{ name: 'theme', key: 'theme' },
		{ name: 'player', key: 'player' },
		{ name: 'boardSize', key: 'boardSize' },
	];

	groups.forEach((group) => bindGameBarGroup(context, group));
}

/**
 * Hooks the inputs that belong to one settings group.
 *
 * @param context - The game bar preview context to update on interaction
 * @param group - The settings group to bind
 */
function bindGameBarGroup(context: GameBarPreviewContext, group: PreviewGroup) {
	const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="${group.name}"]`);
	inputs.forEach((input) => bindGameBarInputEvents(context, group.key, input));
}

/**
 * Binds hover and change handlers for a single input.
 *
 * @param context - The game bar preview context to update on interaction
 * @param key - The settings key the input belongs to
 * @param input - The input to bind
 */
function bindGameBarInputEvents(context: GameBarPreviewContext, key: PreviewGroup['key'], input: HTMLInputElement) {
	bindGameBarLabelEvents(context, key, input, input.closest('label'));
	bindGameBarControlEvents(context, key, input);
}

/**
 * Shows a temporary preview while the user hovers over a group label.
 *
 * @param context - The game bar preview context to update
 * @param key - The settings key the input belongs to
 * @param input - The input whose value is previewed
 * @param label - The label wrapping the input, if any
 */
function bindGameBarLabelEvents(context: GameBarPreviewContext, key: PreviewGroup['key'], input: HTMLInputElement, label: HTMLLabelElement | null) {
	const previewSelection = () => updateGameBarPreview(context, createPreviewSettings(key, input.value));
	const resetSelection = () => updateGameBarPreview(context, getSelectedSettings());
	label?.addEventListener('mouseenter', previewSelection);
	label?.addEventListener('mouseleave', resetSelection);
	label?.addEventListener('focusin', previewSelection);
	label?.addEventListener('focusout', resetSelection);
}

/**
 * Keeps the preview and saved selection aligned while the input changes.
 *
 * @param context - The game bar preview context to update
 * @param key - The settings key the input belongs to
 * @param input - The input to bind
 */
function bindGameBarControlEvents(context: GameBarPreviewContext, key: PreviewGroup['key'], input: HTMLInputElement) {
	const previewSelection = () => updateGameBarPreview(context, createPreviewSettings(key, input.value));
	input.addEventListener('focus', previewSelection);
	input.addEventListener('change', () => applyGameBarSelection(context));
	input.addEventListener('blur', () => updateGameBarPreview(context, getSelectedSettings()));
}

/**
 * Builds a temporary settings object for previewing a single change.
 *
 * @param key - The settings key being previewed
 * @param value - The candidate value for that key
 * @returns A settings object with the previewed value applied
 */
function createPreviewSettings(key: PreviewGroup['key'], value: string): GameSettings {
	const previewSettings = getSelectedSettings();
	if (key === 'theme') {
		return { ...previewSettings, theme: value };
	}

	if (key === 'player') {
		return { ...previewSettings, player: value };
	}

	return { ...previewSettings, boardSize: Number(value) };
}

/**
 * Persists the current selection and refreshes the preview state.
 *
 * @param context - The game bar preview context to update
 */
function applyGameBarSelection(context: GameBarPreviewContext) {
	const currentSelection = getSelectedSettings();
	saveGameSettings(currentSelection);
	updateGameBarPreview(context, currentSelection);
	syncStartButtonState(context);
}

/**
 * Prevents the start button from navigating while it is disabled.
 *
 * @param startButton - The start button to guard
 */
function bindStartButtonGuard(startButton: HTMLAnchorElement) {
	startButton.addEventListener('click', (event) => {
		if (startButton.getAttribute('aria-disabled') === 'true') {
			event.preventDefault();
		}
	});
}

/**
 * Syncs the button state with the required form selections.
 *
 * @param context - The game bar preview context whose start button is updated
 */
function syncStartButtonState(context: GameBarPreviewContext) {
	const hasCompleteSettings = areRequiredSettingsSelected(getSelectedSettings());
	setStartButtonDisabledState(context.startButton, !hasCompleteSettings);
}

/**
 * Checks whether all required settings are present.
 *
 * @param settings - The settings to validate
 * @returns `true` when theme, player, and board size are all set
 */
function areRequiredSettingsSelected(settings: GameSettings) {
	return Boolean(settings.theme && settings.player && settings.boardSize);
}

/**
 * Updates the start button accessibility state.
 *
 * @param startButton - The button to update
 * @param isDisabled - Whether the button should be disabled
 */
function setStartButtonDisabledState(startButton: HTMLAnchorElement, isDisabled: boolean) {
	startButton.setAttribute('aria-disabled', String(isDisabled));
	startButton.tabIndex = isDisabled ? -1 : 0;
}