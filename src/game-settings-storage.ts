


export type GameSettings = {
	theme?: string;
	player?: string;
	boardSize?: number;
};

export type GameResult = {
	winner: 'blue' | 'orange' | 'draw';
	scores: {
		blue: number;
		orange: number;
	};
};

const STORAGE_KEY = 'memoryGameSettings';
const RESULT_STORAGE_KEY = 'memoryGameResult';

const legacyThemeNames: Record<string, string> = {
	IT_logos: 'codeVibes',
	'IT_logos.svg': 'codeVibes',
	gameing: 'gaming',
	'gameing.svg': 'gaming',
	DA_projects: 'daProjects',
	'DA_projects.svg': 'daProjects',
	food: 'foods',
	'foods.svg': 'foods',
};

function normalizeTheme(theme?: string) {
	if (!theme) {
		return theme;
	}

	return legacyThemeNames[theme] ?? theme;
}

export function loadGameSettings(): GameSettings {
	const parsed = readJsonFromStorage<GameSettings>(STORAGE_KEY);
	if (!parsed) {
		return {};
	}

	return {
		theme: normalizeTheme(parsed.theme),
		player: parsed.player,
		boardSize: parsed.boardSize,
	};
}

export function saveGameSettings(settings: GameSettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		console.log('Failed to save game settings to localStorage. This may happen in private mode or if storage quota is exceeded.');
	}
}

export function loadGameResult(): GameResult | null {
	const parsed = readJsonFromStorage<GameResult>(RESULT_STORAGE_KEY);
	if (!parsed?.scores) {
		return null;
	}

	return parsed;
}

export function saveGameResult(result: GameResult) {
	try {
		localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
	} catch {
		console.log('Failed to save game result to localStorage. This may happen in private mode or if storage quota is exceeded.');
	}
}

function readJsonFromStorage<T>(key: string): T | null {
	try {
		const rawValue = localStorage.getItem(key);
		if (!rawValue) {
			return null;
		}

		return JSON.parse(rawValue) as T;
	} catch {
		return null;
	}
}
