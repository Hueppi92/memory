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

function initGameOverPage() {
	const selectedSettings = loadGameSettings();
	const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;
	const gameResult = loadGameResult();

	document.body.dataset.theme = selectedTheme;
	window.gameOverScoreboard = bindScoreboard();
	applyResultToScoreboard(gameResult);
	scheduleResultRedirect(gameResult);
}

function applyResultToScoreboard(gameResult: ReturnType<typeof loadGameResult>) {
	if (!gameResult) {
		return;
	}

	window.gameOverScoreboard?.setScores(gameResult.scores);
}

function scheduleResultRedirect(gameResult: ReturnType<typeof loadGameResult>) {
	if (!gameResult) {
		return;
	}

	window.setTimeout(() => {
		navigateFromResult(gameResult.winner);
	}, 5000);
}


function navigateFromResult(winner: 'blue' | 'orange' | 'draw') {
	if (winner === 'draw') {
		window.location.href = '/pages/draw.html';
		return;
	}

	window.location.href = '/pages/winner.html';
}

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

function setScoreValue(element: HTMLElement | null, score?: number) {
	if (typeof score === 'number' && element) {
		element.textContent = String(score);
	}
}
