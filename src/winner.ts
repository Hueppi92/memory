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

/**
 * Bootstraps the winner screen from the saved result.
 */
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

/**
 * Updates the back link label for the current theme.
 *
 * @param themeId - The theme to use for the back link label
 */
function setWinnerBackLinkLabel(themeId: string) {
	const backLinkElement = document.getElementById('winnerBackLink');

	if (!backLinkElement) {
		return;
	}

	const selectedTheme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	backLinkElement.textContent = selectedTheme?.backButtonLabel ?? 'Back to start';
}

/**
 * Creates the binding used to read and write the winner text.
 *
 * @returns Bound `getWinner`/`setWinner` helpers for the winner element
 */
function bindWinnerText(): WinnerBinding {
	const winnerElement = document.getElementById('winner');
	const selectedTheme = document.body.dataset.theme ?? DEFAULT_THEME_ID;
	return {
		setWinner: (player: string) => applyWinnerSelection(winnerElement, selectedTheme, player),
		getWinner: () => winnerElement?.textContent ?? '',
	};
}

/**
 * Applies the theme-specific winner icon for the active player.
 *
 * @param themeId - The theme to source icon assets from
 * @param player - The winning player
 */
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

/**
 * Writes the selected winner into the DOM and updates theme visuals.
 *
 * @param winnerElement - The element to write the winner label into
 * @param themeId - The theme to use for the winner icon
 * @param player - The winning player, in raw/unnormalized form
 */
function applyWinnerSelection(winnerElement: HTMLElement | null, themeId: string, player: string) {
	if (!winnerElement) {
		return;
	}

	const normalizedPlayer = normalizePlayerId(player);
	document.body.dataset.winnerPlayer = normalizedPlayer;
	winnerElement.textContent = normalizeWinnerLabel(normalizedPlayer);
	setWinnerThemeIcon(themeId, normalizedPlayer);
}

/**
 * Normalizes arbitrary player input to a known player id.
 *
 * @param player - The raw player value to normalize
 * @returns `'orange'` when the input is `'orange'`, otherwise `'blue'`
 */
function normalizePlayerId(player: string): 'orange' | 'blue' {
	return player === 'orange' ? 'orange' : 'blue';
}

/**
 * Collects the best available winner icon URLs for a theme.
 *
 * @param theme - The theme to source icon assets from
 * @param player - The winning player
 * @returns The mask url (if any) and the best available image url
 */
function getWinnerIconSources(theme: (typeof THEME_BY_ID)[string] | undefined, player: 'orange' | 'blue') {
	const maskUrl = player === 'orange' ? theme?.winnerOrangeIconMaskUrl : theme?.winnerBlueIconMaskUrl;
	const imageUrl = player === 'orange' ? theme?.winnerOrangeIconUrl : theme?.winnerBlueIconUrl;
	const fallback = theme?.winnerIconUrl ?? theme?.previewUrl;
	return { maskUrl, imageUrl: imageUrl ?? fallback };
}

/**
 * Applies a mask-based winner icon to the page.
 *
 * @param maskUrl - The url of the mask image to apply
 */
function applyMaskIcon(maskUrl: string) {
	document.body.dataset.winnerIconMode = 'mask';
	document.body.style.setProperty('--theme-winner-icon-mask-image', `url('${maskUrl}')`);
	document.body.style.setProperty('--theme-winner-icon-image', 'none');
}

/**
 * Applies an image-based winner icon to the page.
 *
 * @param imageUrl - The url of the icon image to apply, if any
 */
function applyImageIcon(imageUrl?: string) {
	if (!imageUrl) {
		return;
	}

	document.body.dataset.winnerIconMode = 'image';
	document.body.style.setProperty('--theme-winner-icon-image', `url('${imageUrl}')`);
	document.body.style.setProperty('--theme-winner-icon-mask-image', 'none');
}

/**
 * Converts the player id into a readable label.
 *
 * @param player - The player id to convert
 * @returns A readable label, or the original value if unrecognized
 */
function normalizeWinnerLabel(player: string) {
	if (player === 'blue') {
		return 'Blue Player';
	}

	if (player === 'orange') {
		return 'Orange Player';
	}

	return player;
}