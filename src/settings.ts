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

function initSettingsPage() {
	renderThemeOptions();
	applySavedSelections();
	initThemePreview();
	initGameBarPreview();
}

function renderThemeOptions() {
	const themeList = document.querySelector<HTMLUListElement>('#themeSettings ul');

	if (!themeList) {
		return;
	}

	themeList.innerHTML = THEME_CATALOG.map((theme) => {
		return `<li><label><input type="radio" name="theme" value="${theme.id}" /> ${theme.label} theme <img src="../assets/ui/setting_line.svg" alt="Setting line icon" /></label></li>`;
	}).join('');
}

function applySavedSelections() {
	const savedSettings = loadGameSettings();

	setCheckedInput('theme', savedSettings.theme ?? DEFAULT_THEME_ID);
	setCheckedInput('player', savedSettings.player);
	setCheckedInput('boardSize', savedSettings.boardSize);
}

function setCheckedInput(name: string, value?: string | number) {
	if (!value) {
		return;
	}

	const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${String(value)}"]`);

	if (input) {
		input.checked = true;
	}
}

function getSelectedValue(name: string) {
	return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value;
}

function getThemeLabel(theme: string) {
	return THEME_BY_ID[theme]?.label ?? theme;
}

function getPlayerLabel(player: string) {
	if (player === 'blue') {
		return 'Blue';
	}

	if (player === 'orange') {
		return 'Orange';
	}

	return player;
}

function getBoardSizeLabel(boardSize: number) {
	return `${boardSize} Cards`;
}

function initThemePreview() {
	const context = getThemePreviewContext();
	if (!context) {
		return;
	}

	updateThemePreview(context, getSelectedValue('theme'));
	bindThemePreviewEvents(context);
}

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

function getThemePreviewContext(): ThemePreviewContext | null {
	const previewImage = document.getElementById('themePreviewImage') as HTMLImageElement | null;
	const themeInputs = document.querySelectorAll<HTMLInputElement>('input[name="theme"]');
	if (!previewImage || themeInputs.length === 0) {
		return null;
	}

	const defaultPreviewSource = THEME_BY_ID[DEFAULT_THEME_ID]?.previewUrl ?? previewImage.src;
	return { previewImage, defaultPreviewSource, themeInputs };
}

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

function bindThemePreviewEvents(context: ThemePreviewContext) {
	context.themeInputs.forEach((input) => {
		bindThemePreviewLabelEvents(input.closest('label'), context, input.value);
		bindThemePreviewInputEvents(input, context);
	});
}

function bindThemePreviewLabelEvents(label: HTMLLabelElement | null, context: ThemePreviewContext, inputValue: string) {
	const resetPreview = () => updateThemePreview(context, getSelectedValue('theme'));
	label?.addEventListener('mouseenter', () => updateThemePreview(context, inputValue));
	label?.addEventListener('mouseleave', resetPreview);
	label?.addEventListener('focusin', () => updateThemePreview(context, inputValue));
	label?.addEventListener('focusout', resetPreview);
}

function bindThemePreviewInputEvents(input: HTMLInputElement, context: ThemePreviewContext) {
	const resetPreview = () => updateThemePreview(context, getSelectedValue('theme'));
	input.addEventListener('focus', () => updateThemePreview(context, input.value));
	input.addEventListener('change', () => updateThemePreview(context, input.value));
	input.addEventListener('blur', resetPreview);
}

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

function getSelectedSettings(): GameSettings {
	const selectedBoardSize = getSelectedValue('boardSize');
	return {
		theme: getSelectedValue('theme'),
		player: getSelectedValue('player'),
		boardSize: selectedBoardSize ? Number(selectedBoardSize) : undefined,
	};
}

function updateGameBarPreview(context: GameBarPreviewContext, settings: GameSettings) {
	context.gameTheme.textContent = settings.theme ? getThemeLabel(settings.theme) : gameBarPlaceholders.theme;
	context.player.textContent = settings.player ? getPlayerLabel(settings.player) : gameBarPlaceholders.player;
	context.boardSize.textContent = settings.boardSize ? getBoardSizeLabel(settings.boardSize) : gameBarPlaceholders.boardSize;
}

function bindGameBarPreviewGroups(context: GameBarPreviewContext) {
	const groups: PreviewGroup[] = [
		{ name: 'theme', key: 'theme' },
		{ name: 'player', key: 'player' },
		{ name: 'boardSize', key: 'boardSize' },
	];

	groups.forEach((group) => bindGameBarGroup(context, group));
}

function bindGameBarGroup(context: GameBarPreviewContext, group: PreviewGroup) {
	const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="${group.name}"]`);
	inputs.forEach((input) => bindGameBarInputEvents(context, group.key, input));
}

function bindGameBarInputEvents(context: GameBarPreviewContext, key: PreviewGroup['key'], input: HTMLInputElement) {
	bindGameBarLabelEvents(context, key, input, input.closest('label'));
	bindGameBarControlEvents(context, key, input);
}

function bindGameBarLabelEvents(context: GameBarPreviewContext, key: PreviewGroup['key'], input: HTMLInputElement, label: HTMLLabelElement | null) {
	const previewSelection = () => updateGameBarPreview(context, createPreviewSettings(key, input.value));
	const resetSelection = () => updateGameBarPreview(context, getSelectedSettings());
	label?.addEventListener('mouseenter', previewSelection);
	label?.addEventListener('mouseleave', resetSelection);
	label?.addEventListener('focusin', previewSelection);
	label?.addEventListener('focusout', resetSelection);
}

function bindGameBarControlEvents(context: GameBarPreviewContext, key: PreviewGroup['key'], input: HTMLInputElement) {
	const previewSelection = () => updateGameBarPreview(context, createPreviewSettings(key, input.value));
	input.addEventListener('focus', previewSelection);
	input.addEventListener('change', () => applyGameBarSelection(context));
	input.addEventListener('blur', () => updateGameBarPreview(context, getSelectedSettings()));
}

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

function applyGameBarSelection(context: GameBarPreviewContext) {
	const currentSelection = getSelectedSettings();
	saveGameSettings(currentSelection);
	updateGameBarPreview(context, currentSelection);
	syncStartButtonState(context);
}

function bindStartButtonGuard(startButton: HTMLAnchorElement) {
	startButton.addEventListener('click', (event) => {
		if (startButton.getAttribute('aria-disabled') === 'true') {
			event.preventDefault();
		}
	});
}

function syncStartButtonState(context: GameBarPreviewContext) {
	const hasCompleteSettings = areRequiredSettingsSelected(getSelectedSettings());
	setStartButtonDisabledState(context.startButton, !hasCompleteSettings);
}

function areRequiredSettingsSelected(settings: GameSettings) {
	return Boolean(settings.theme && settings.player && settings.boardSize);
}

function setStartButtonDisabledState(startButton: HTMLAnchorElement, isDisabled: boolean) {
	startButton.setAttribute('aria-disabled', String(isDisabled));
	startButton.tabIndex = isDisabled ? -1 : 0;
}