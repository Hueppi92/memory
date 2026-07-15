import '/src/scss/base/main.scss';
import '/src/scss/pages/draw.scss';
import { loadGameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

initDrawPage();

function initDrawPage() {
	const selectedSettings = loadGameSettings();
	const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;

	document.body.dataset.theme = selectedTheme;
	setDrawThemeIcon(selectedTheme);
}

function setDrawThemeIcon(themeId: string) {
	const iconElement = document.getElementById('drawThemeIcon') as HTMLImageElement | null;

	if (!iconElement) {
		return;
	}

	const selectedTheme = THEME_BY_ID[themeId] ?? THEME_BY_ID[DEFAULT_THEME_ID];
	const drawIconUrl = selectedTheme?.drawIconUrl;

	if (drawIconUrl) {
		iconElement.src = drawIconUrl;
		return;
	}

	if (selectedTheme?.previewUrl) {
		iconElement.src = selectedTheme.previewUrl;
	}
}
