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

	if (gameResult) {
		window.gameOverScoreboard.setScores(gameResult.scores);

		window.setTimeout(() => {
			if (gameResult.winner === 'draw') {
				window.location.href = '/pages/draw.html';
				return;
			}

			window.location.href = '/pages/winner.html';
		}, 10000);
	}
}

function bindScoreboard(): ScoreboardBinding {
	const blueScoreElement = document.getElementById('blueScoreValue');
	const orangeScoreElement = document.getElementById('orangeScoreValue');

	const getScores = (): PlayerScore => ({
		blue: Number(blueScoreElement?.textContent ?? 0),
		orange: Number(orangeScoreElement?.textContent ?? 0),
	});

	const setScores = (nextScores: Partial<PlayerScore>) => {
		if (typeof nextScores.blue === 'number' && blueScoreElement) {
			blueScoreElement.textContent = String(nextScores.blue);
		}

		if (typeof nextScores.orange === 'number' && orangeScoreElement) {
			orangeScoreElement.textContent = String(nextScores.orange);
		}
	};

	return {
		setScores,
		getScores,
	};
}
