import '/src/scss/base/main.scss';
import '/src/scss/pages/winner.scss';
import { loadGameResult, loadGameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

type WinnerBinding = {
	setWinner: (player: string) => void;
	getWinner: () => string;
};

declare global {
	interface Window {
		winnerView?: WinnerBinding;
	}
}

initWinnerPage();

function initWinnerPage() {
	const selectedSettings = loadGameSettings();
	const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;
	const result = loadGameResult();
	const winnerPlayer = result?.winner === 'orange' ? 'orange' : 'blue';

	document.body.dataset.theme = selectedTheme;
	setWinnerBackLinkLabel(selectedTheme);
	window.winnerView = bindWinnerText();
	window.winnerView.setWinner(winnerPlayer);
}

function setWinnerBackLinkLabel(themeId: string) {
	const backLinkElement = document.getElementById('winnerBackLink');

	if (!backLinkElement) {
		return;
	}

	const selectedTheme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	backLinkElement.textContent = selectedTheme?.backButtonLabel ?? 'Back to start';
}

function bindWinnerText(): WinnerBinding {
	const winnerElement = document.getElementById('winner');
	const selectedTheme = document.body.dataset.theme ?? DEFAULT_THEME_ID;
	return {
		setWinner: (player: string) => applyWinnerSelection(winnerElement, selectedTheme, player),
		getWinner: () => winnerElement?.textContent ?? '',
	};
}

function setWinnerThemeIcon(themeId: string, player: string) {
	const iconElement = document.getElementById('winnerThemeIcon') as HTMLElement | null;
	if (!iconElement) {
		return;
	}
	const theme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	const normalizedPlayer = normalizePlayerId(player);
	const sources = getWinnerIconSources(theme, normalizedPlayer);
	if (sources.maskUrl) {
		applyMaskIcon(sources.maskUrl);
		return;
	}
	applyImageIcon(sources.imageUrl);
}

function applyWinnerSelection(winnerElement: HTMLElement | null, themeId: string, player: string) {
	if (!winnerElement) {
		return;
	}

	const normalizedPlayer = normalizePlayerId(player);
	document.body.dataset.winnerPlayer = normalizedPlayer;
	winnerElement.textContent = normalizeWinnerLabel(normalizedPlayer);
	setWinnerThemeIcon(themeId, normalizedPlayer);
}

function normalizePlayerId(player: string): 'orange' | 'blue' {
	return player === 'orange' ? 'orange' : 'blue';
}

function getWinnerIconSources(theme: (typeof THEME_BY_ID)[string] | undefined, player: 'orange' | 'blue') {
	const maskUrl = player === 'orange' ? theme?.winnerOrangeIconMaskUrl : theme?.winnerBlueIconMaskUrl;
	const imageUrl = player === 'orange' ? theme?.winnerOrangeIconUrl : theme?.winnerBlueIconUrl;
	const fallback = theme?.winnerIconUrl ?? theme?.previewUrl;
	return { maskUrl, imageUrl: imageUrl ?? fallback };
}

function applyMaskIcon(maskUrl: string) {
	document.body.dataset.winnerIconMode = 'mask';
	document.body.style.setProperty('--theme-winner-icon-mask-image', `url('${maskUrl}')`);
	document.body.style.setProperty('--theme-winner-icon-image', 'none');
}

function applyImageIcon(imageUrl?: string) {
	if (!imageUrl) {
		return;
	}

	document.body.dataset.winnerIconMode = 'image';
	document.body.style.setProperty('--theme-winner-icon-image', `url('${imageUrl}')`);
	document.body.style.setProperty('--theme-winner-icon-mask-image', 'none');
}

function normalizeWinnerLabel(player: string) {
	if (player === 'blue') {
		return 'Blue Player';
	}

	if (player === 'orange') {
		return 'Orange Player';
	}

	return player;
}
