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

	const setWinner = (player: string) => {
		if (!winnerElement) {
			return;
		}

		const normalizedPlayer = player === 'orange' ? 'orange' : 'blue';
		document.body.dataset.winnerPlayer = normalizedPlayer;

		winnerElement.textContent = normalizeWinnerLabel(player);
		setWinnerThemeIcon(selectedTheme, player);
	};

	const getWinner = () => winnerElement?.textContent ?? '';

	return {
		setWinner,
		getWinner,
	};
}

function setWinnerThemeIcon(themeId: string, player: string) {
	const iconElement = document.getElementById('winnerThemeIcon') as HTMLElement | null;

	if (!iconElement) {
		return;
	}

	const normalizedPlayer = player === 'orange' ? 'orange' : 'blue';
	const theme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	const winnerThemeIconMask = normalizedPlayer === 'orange'
		? theme?.winnerOrangeIconMaskUrl
		: theme?.winnerBlueIconMaskUrl;

	const winnerThemeIcon = normalizedPlayer === 'orange'
		? theme?.winnerOrangeIconUrl
		: theme?.winnerBlueIconUrl;

	if (winnerThemeIconMask) {
		document.body.dataset.winnerIconMode = 'mask';
		document.body.style.setProperty('--theme-winner-icon-mask-image', `url('${winnerThemeIconMask}')`);
		document.body.style.setProperty('--theme-winner-icon-image', 'none');
		return;
	}

	if (winnerThemeIcon) {
		document.body.dataset.winnerIconMode = 'image';
		document.body.style.setProperty('--theme-winner-icon-image', `url('${winnerThemeIcon}')`);
		document.body.style.setProperty('--theme-winner-icon-mask-image', 'none');
		return;
	}

	if (theme?.winnerIconUrl) {
		document.body.dataset.winnerIconMode = 'image';
		document.body.style.setProperty('--theme-winner-icon-image', `url('${theme.winnerIconUrl}')`);
		document.body.style.setProperty('--theme-winner-icon-mask-image', 'none');
		return;
	}

	if (theme?.previewUrl) {
		document.body.dataset.winnerIconMode = 'image';
		document.body.style.setProperty('--theme-winner-icon-image', `url('${theme.previewUrl}')`);
		document.body.style.setProperty('--theme-winner-icon-mask-image', 'none');
	}
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
