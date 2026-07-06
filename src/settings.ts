import '/src/scss/base/main.scss';
import '/src/scss/pages/settings.scss';

const themePreviewSources: Record<string, string> = {
	codeVibes: '/assets/theme_preview/IT_logos.svg',
	gaming: '/assets/theme_preview/gameing.svg',
	daProjects: '/assets/theme_preview/DA_projects.svg',
	foods: '/assets/theme_preview/foods.svg',
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
	initThemePreview();
	initGameBarPreview();
}

function getSelectedValue(name: string) {
	return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value;
}

function getThemeLabel(theme: string) {
	if (theme === 'codeVibes') {
		return 'Code vibes';
	}

	if (theme === 'gaming') {
		return 'Gaming';
	}

	if (theme === 'daProjects') {
		return 'DA projects';
	}

	if (theme === 'foods') {
		return 'Foods';
	}

	return theme;
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

function getBoardSizeLabel(boardSize: string) {
	if (boardSize === '16') {
		return '16 Cards';
	}

	if (boardSize === '24') {
		return '24 Cards';
	}

	if (boardSize === '36') {
		return '36 Cards';
	}

	return boardSize;
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

		const nextSource = themePreviewSources[theme];

		if (nextSource) {
			previewImage.src = nextSource;
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
		boardSize: getSelectedValue('boardSize'),
	});

	const updateGameBar = (settings: { theme?: string; player?: string; boardSize?: string }) => {
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
				const previewSettings = {
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
					previewSettings.boardSize = input.value;
				}

				updateGameBar(previewSettings);
			};

			label?.addEventListener('mouseenter', previewSelection);
			label?.addEventListener('mouseleave', () => updateGameBar(selectedSettings()));
			label?.addEventListener('focusin', previewSelection);
			label?.addEventListener('focusout', () => updateGameBar(selectedSettings()));

			input.addEventListener('focus', previewSelection);
			input.addEventListener('change', () => updateGameBar(selectedSettings()));
			input.addEventListener('blur', () => updateGameBar(selectedSettings()));
		});
	});
}