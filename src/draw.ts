import '/src/scss/base/main.scss';
import '/src/scss/pages/draw.scss';
import { loadGameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

initDrawPage();

function initDrawPage() {
	const selectedSettings = loadGameSettings();
	const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;

	document.body.dataset.theme = selectedTheme;
	setDrawBackLinkLabel(selectedTheme);
	setDrawThemeIcon(selectedTheme);
}

function setDrawBackLinkLabel(themeId: string) {
	const backLinkElement = document.getElementById('drawBackLink');

	if (!backLinkElement) {
		return;
	}

	const selectedTheme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	backLinkElement.textContent = selectedTheme?.backButtonLabel ?? 'Back to start';
}

function setDrawThemeIcon(themeId: string) {
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

function getThemeById(themeId: string) {
	return THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
}
