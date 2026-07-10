


export type GameSettings = {
	theme?: string;
	player?: string;
	boardSize?: number;
};

const STORAGE_KEY = 'memoryGameSettings';

const legacyThemeNames: Record<string, string> = {
	IT_logos: 'codeVibes',
	'IT_logos.svg': 'codeVibes',
	gameing: 'gaming',
	'gameing.svg': 'gaming',
	'DA_projects.svg': 'daProjects',
	'foods.svg': 'foods',
};

function normalizeTheme(theme?: string) {
	if (!theme) {
		return theme;
	}

	return legacyThemeNames[theme] ?? theme;
}

export function loadGameSettings(): GameSettings {
	try {
		const rawValue = localStorage.getItem(STORAGE_KEY);

		if (!rawValue) {
			return {};
		}

		const parsed = JSON.parse(rawValue) as GameSettings;
		return {
			theme: normalizeTheme(parsed.theme),
			player: parsed.player,
			boardSize: parsed.boardSize,
		};
	} catch {
		return {};
	}
}

export function saveGameSettings(settings: GameSettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// Ignore storage errors (private mode, quota, etc.).
	}
}
