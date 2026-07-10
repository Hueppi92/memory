export type ThemeDefinition = {
	id: string;
	label: string;
	previewUrl: string;
	cardFaceUrls: string[];
	cardBackUrl: string;
};

function buildThemeAssetUrl(themeId: string, fileName: string) {
	return `./assets/theme_files/${themeId}/${fileName}`;
}

// General helper: collect all card front images (front_*) from a theme file list.
function collectFrontImageUrls(themeId: string, fileNames: string[]) {
	return fileNames
		.filter((fileName) => fileName.startsWith('front_'))
		.map((fileName) => buildThemeAssetUrl(themeId, fileName));
}

const codeVibesFiles = [
	'front_angular.svg',
	'front_boot.svg',
	'front_cmd.svg',
	'front_css.svg',
	'front_dj.svg',
	'front_firebase.svg',
	'front_git.svg',
	'front_gitHub.svg',
	'front_html.svg',
	'front_js.svg',
	'front_node.svg',
	'front_python.svg',
	'front_react.svg',
	'front_sass.svg',
	'front_sql.svg',
	'front_ts.svg',
	'front_vscode.svg',
	'front_vue.svg',
	'back.svg',
	'label_blue.svg',
	'label_orange.svg',
];

export const THEME_CATALOG: ThemeDefinition[] = [
	{
		id: 'codeVibes',
		label: 'Code vibes',
		previewUrl: './assets/theme_preview/codeVibes.svg',
		cardFaceUrls: collectFrontImageUrls('codeVibes', codeVibesFiles),
		cardBackUrl: buildThemeAssetUrl('codeVibes', 'back.svg'),
	},
	{
		id: 'gaming',
		label: 'Gaming',
		previewUrl: './assets/theme_preview/gaming.svg',
		cardFaceUrls: [buildThemeAssetUrl('gaming', 'back.svg')],
		cardBackUrl: buildThemeAssetUrl('gaming', 'back.svg'),
	},
	{
		id: 'daProjects',
		label: 'Da projects',
		previewUrl: './assets/theme_preview/daProjects.svg',
		cardFaceUrls: [buildThemeAssetUrl('daProjects', 'back.svg')],
		cardBackUrl: buildThemeAssetUrl('daProjects', 'back.svg'),
	},
	{
		id: 'foods',
		label: 'Foods',
		previewUrl: './assets/theme_preview/foods.svg',
		cardFaceUrls: [buildThemeAssetUrl('foods', 'back.svg')],
		cardBackUrl: buildThemeAssetUrl('foods', 'back.svg'),
	},
];

export const THEME_BY_ID = THEME_CATALOG.reduce<Record<string, ThemeDefinition>>((result, theme) => {
	result[theme.id] = theme;
	return result;
}, {});

export const DEFAULT_THEME_ID = THEME_BY_ID.codeVibes?.id ?? THEME_CATALOG[0]?.id ?? '';
