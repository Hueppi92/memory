import '/src/scss/base/main.scss';
import '/src/scss/pages/game-over.scss';
import { loadGameResult, loadGameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID } from './theme-catalog';

type PlayerScore = {
	blue: number;
	orange: number;
};

type ScoreboardBinding = {
	setScores: (nextScores: Partial<PlayerScore>) => void;
	getScores: () => PlayerScore;
};

declare global {
	interface Window {
		gameOverScoreboard?: ScoreboardBinding;
	}
}

initGameOverPage();

/**
 * Bootstraps the result screen from the saved game result.
 */
function initGameOverPage(): void {
	const selectedSettings = loadGameSettings();
	const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;
	const gameResult = loadGameResult();

	document.body.dataset.theme = selectedTheme;
	window.gameOverScoreboard = bindScoreboard();
	applyResultToScoreboard(gameResult);
	scheduleResultRedirect(gameResult);
}

/**
 * Writes the saved result into the scoreboard when one exists.
 *
 * @param gameResult - The saved result to apply, if any
 */
function applyResultToScoreboard(gameResult: ReturnType<typeof loadGameResult>): void {
	if (!gameResult) {
		return;
	}
	window.gameOverScoreboard?.setScores(gameResult.scores);
}

/**
 * Schedules the redirect to the next result screen.
 *
 * @param gameResult - The saved result whose winner determines the redirect
 */
function scheduleResultRedirect(gameResult: ReturnType<typeof loadGameResult>): void {
	if (!gameResult) {
		return;
	}
	window.setTimeout(() => {
		navigateFromResult(gameResult.winner);
	}, 3000);
}

/**
 * Navigates to the winner or draw screen based on the stored outcome.
 *
 * @param winner - The stored game outcome
 */
function navigateFromResult(winner: 'blue' | 'orange' | 'draw'): void {
	if (winner === 'draw') {
		window.location.href = '/pages/draw.html';
		return;
	}
	window.location.href = '/pages/winner.html';
}

/**
 * Binds the scoreboard elements and exposes read/write helpers.
 *
 * @returns Bound `getScores`/`setScores` helpers for the scoreboard
 */
function bindScoreboard(): ScoreboardBinding {
	const blueScoreElement = document.getElementById('blueScoreValue');
	const orangeScoreElement = document.getElementById('orangeScoreValue');
	const getScores = (): PlayerScore => ({
		blue: Number(blueScoreElement?.textContent ?? 0),
		orange: Number(orangeScoreElement?.textContent ?? 0),
	});
	const setScores = (nextScores: Partial<PlayerScore>) => {
		setScoreValue(blueScoreElement, nextScores.blue);
		setScoreValue(orangeScoreElement, nextScores.orange);
	};
	return { setScores, getScores };
}

/**
 * Writes a score value into the given element when a score exists.
 *
 * @param element - The element to update
 * @param score - The score to write, if defined
 */
function setScoreValue(element: HTMLElement | null, score?: number): void {
	if (typeof score === 'number' && element) {
		element.textContent = String(score);
	}
}