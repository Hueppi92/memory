/**
 * Persisted setup for a game session.
 */
export type GameSettings = {
	theme?: string;
	player?: string;
	boardSize?: number;
};

/**
 * Persisted outcome of a finished game.
 */
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

/**
 * Maps a legacy or current theme name to its current id.
 *
 * @param theme - The stored theme name, if any
 * @returns The current theme id, or the original value if unrecognized
 */
function normalizeTheme(theme?: string) {
	if (!theme) {
		return theme;
	}

	return legacyThemeNames[theme] ?? theme;
}

/**
 * Loads the saved game settings from local storage.
 *
 * @returns The stored settings, or an empty object when nothing is saved
 */
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

/**
 * Saves the current game settings to local storage.
 *
 * @param settings - The settings to persist
 */
export function saveGameSettings(settings: GameSettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		console.log('Failed to save game settings to localStorage. This may happen in private mode or if storage quota is exceeded.');
	}
}

/**
 * Loads the last recorded game result from local storage.
 *
 * @returns The stored result, or `null` when no valid result exists
 */
export function loadGameResult(): GameResult | null {
	const parsed = readJsonFromStorage<GameResult>(RESULT_STORAGE_KEY);
	if (!parsed?.scores) {
		return null;
	}

	return parsed;
}

/**
 * Saves the final game result to local storage.
 *
 * @param result - The result to persist
 */
export function saveGameResult(result: GameResult) {
	try {
		localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
	} catch {
		console.log('Failed to save game result to localStorage. This may happen in private mode or if storage quota is exceeded.');
	}
}

/**
 * Reads and parses a JSON value from local storage.
 *
 * @param key - The storage key to read
 * @returns The parsed value, or `null` when missing or invalid
 */
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