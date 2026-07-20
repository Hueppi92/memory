import '/src/scss/base/main.scss';
import '/src/scss/pages/draw.scss';
import { loadGameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

initDrawPage();

/**
 * Initializes the draw page with the active theme.
 */
function initDrawPage(): void {
	const selectedSettings = loadGameSettings();
	const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;

	document.body.dataset.theme = selectedTheme;
	setDrawBackLinkLabel(selectedTheme);
	setDrawThemeIcon(selectedTheme);
}

/**
 * Updates the draw page back link text for the selected theme.
 *
 * @param themeId - The theme to use for the back link label
 */
function setDrawBackLinkLabel(themeId: string): void {
	const backLinkElement = document.getElementById('drawBackLink');

	if (!backLinkElement) {
		return;
	}

	const selectedTheme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	backLinkElement.textContent = selectedTheme?.backButtonLabel ?? 'Back to start';
}

/**
 * Applies the theme-specific icon to the draw page.
 *
 * @param themeId - The theme to use for the icon
 */
function setDrawThemeIcon(themeId: string): void {
	const iconElement = document.getElementById('drawThemeIcon') as HTMLImageElement | null;
	const selectedTheme = getThemeById(themeId);

	if (!iconElement) {
		return;
	}

	const iconUrl = selectedTheme?.drawIconUrl ?? selectedTheme?.previewUrl;
	if (iconUrl) {
		iconElement.src = iconUrl;
	}
}

/**
 * Resolves a theme by id, falling back to the default theme.
 *
 * @param themeId - The id to look up
 * @returns The matching theme, or the default theme if not found
 */
function getThemeById(themeId: string) {
	return THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
}