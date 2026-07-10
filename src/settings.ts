import '/src/scss/base/main.scss';
import '/src/scss/pages/settings.scss';
import { loadGameSettings, saveGameSettings, type GameSettings } from './game-settings-storage';

const THEME_PREVIEW_BASE_PATH = './assets/theme_preview/';

const themePreviewFileNames: Record<string, string> = {
	codeVibes: 'codeVibes.svg',
	gaming: 'gaming.svg',
	daProjects: 'DA_projects.svg',
	foods: 'foods.svg',
};

const themeLabels: Record<string, string> = {
	codeVibes: 'Code vibes',
	gaming: 'Gaming',
	daProjects: 'DA projects',
	foods: 'Foods',
};

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

initSettingsPage();

function initSettingsPage() {
	applySavedSelections();
	initThemePreview();
	initGameBarPreview();
}

function applySavedSelections() {
	const savedSettings = loadGameSettings();

	setCheckedInput('theme', savedSettings.theme);
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
	return themeLabels[theme] ?? theme;
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
	const previewImage = document.getElementById('themePreviewImage') as HTMLImageElement | null;
	const themeInputs = document.querySelectorAll<HTMLInputElement>('input[name="theme"]');

	if (!previewImage || themeInputs.length === 0) {
		return;
	}

	const defaultPreviewSource = previewImage.src;
	const getSelectedTheme = () => getSelectedValue('theme');

	const updatePreview = (theme?: string) => {
		if (!theme) {
			previewImage.src = defaultPreviewSource;
			return;
		}

		const nextFileName = themePreviewFileNames[theme];

		if (nextFileName) {
			previewImage.src = `${THEME_PREVIEW_BASE_PATH}${nextFileName}`;
		}
	};

	updatePreview(getSelectedTheme());

	themeInputs.forEach((input) => {
		const label = input.closest('label');

		label?.addEventListener('mouseenter', () => updatePreview(input.value));
		label?.addEventListener('mouseleave', () => updatePreview(getSelectedTheme()));
		label?.addEventListener('focusin', () => updatePreview(input.value));
		label?.addEventListener('focusout', () => updatePreview(getSelectedTheme()));

		input.addEventListener('focus', () => updatePreview(input.value));
		input.addEventListener('change', () => updatePreview(input.value));
		input.addEventListener('blur', () => updatePreview(getSelectedTheme()));
	});
}

function initGameBarPreview() {
	const gameTheme = document.getElementById('game_theme');
	const player = document.getElementById('player');
	const boardSize = document.getElementById('board_size');

	if (!gameTheme || !player || !boardSize) {
		return;
	}

	const selectedSettings = () => ({
		theme: getSelectedValue('theme'),
		player: getSelectedValue('player'),
		boardSize: getSelectedValue('boardSize') ? Number(getSelectedValue('boardSize')) : undefined,
	}) as GameSettings;

	const updateGameBar = (settings: GameSettings) => {
		gameTheme.textContent = settings.theme ? getThemeLabel(settings.theme) : gameBarPlaceholders.theme;
		player.textContent = settings.player ? getPlayerLabel(settings.player) : gameBarPlaceholders.player;
		boardSize.textContent = settings.boardSize ? getBoardSizeLabel(settings.boardSize) : gameBarPlaceholders.boardSize;
	};

	updateGameBar(selectedSettings());

	const groups = [
		{ name: 'theme', key: 'theme' },
		{ name: 'player', key: 'player' },
		{ name: 'boardSize', key: 'boardSize' },
	] as const;

	groups.forEach(({ name, key }) => {
		const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`);

		inputs.forEach((input) => {
			const label = input.closest('label');

			const previewSelection = () => {
				const currentSettings = selectedSettings();
				const previewSettings: GameSettings = {
					theme: currentSettings.theme,
					player: currentSettings.player,
					boardSize: currentSettings.boardSize,
				};

				if (key === 'theme') {
					previewSettings.theme = input.value;
				}

				if (key === 'player') {
					previewSettings.player = input.value;
				}

				if (key === 'boardSize') {
					previewSettings.boardSize = Number(input.value);
				}

				updateGameBar(previewSettings);
			};

			label?.addEventListener('mouseenter', previewSelection);
			label?.addEventListener('mouseleave', () => updateGameBar(selectedSettings()));
			label?.addEventListener('focusin', previewSelection);
			label?.addEventListener('focusout', () => updateGameBar(selectedSettings()));

			input.addEventListener('focus', previewSelection);
			input.addEventListener('change', () => {
				const currentSelection = selectedSettings();
				saveGameSettings(currentSelection);
				updateGameBar(currentSelection);
			});
			input.addEventListener('blur', () => updateGameBar(selectedSettings()));
		});
	});
}