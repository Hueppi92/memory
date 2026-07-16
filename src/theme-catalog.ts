export type ThemeDefinition = {
	id: string;
	label: string;
	previewUrl: string;
	cardFaceUrls: string[];
	cardBackUrl: string;
	backButtonLabel?: string;
	drawIconUrl?: string;
	winnerIconUrl?: string;
	winnerBlueIconUrl?: string;
	winnerOrangeIconUrl?: string;
	winnerBlueIconMaskUrl?: string;
	winnerOrangeIconMaskUrl?: string;
};

function buildThemeAssetUrl(themeId: string, fileName: string) {
	return `../assets/theme_files/${themeId}/${fileName}`;
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

const gamingFiles = [
	'front_ace.svg',
	'front_banana.svg',
	'front_controller.svg',
	'front_creeper.svg',
	'front_dice.svg',
	'front_gameboycolor.svg',
	'front_lvlup.svg',
	'front_maze.svg',
	'front_mushroom.svg',
	'front_pac.svg',
	'front_pacman.svg',
	'front_play.svg',
	'front_puzzle.svg',
	'front_snake.svg',
	'front_squidCircle.svg',
	'front_squidSquare.svg',
	'front_squidTriangle.svg',
	'front_starcoin.svg',
	'back.svg',
	'label_blue.svg',
	'label_orange.svg',
];

const daProjectsFiles = [
	'front_basket.svg',
	'front_bubble.svg',
	'front_contactBadge.svg',
	'front_cuisine.svg',
	'front_egg.svg',
	'front_join.svg',
	'front_kochwelt.svg',
	'front_noodleBowlEmpty.svg',
	'front_noodleBowlFull.svg',
	'front_pepeHat.svg',
	'front_playVideo.svg',
	'front_pokeball.svg',
	'front_sakuraFlower.svg',
	'front_shark.svg',
	'front_smiley.svg',
	'front_swapCoin.svg',
	'front_ticTacToe.svg',
	'front_videoFlix.svg',
	'back.svg',
	'label_blue.svg',
	'label_orange.svg',
];

const foodsFiles = [
	'front_brezn.svg',
	'front_burger.svg',
	'front_burrito.svg',
	'front_chocolateBar.svg',
	'front_donut.svg',
	'front_flan.svg',
	'front_hotDogStick.svg',
	'front_iceCone.svg',
	'front_iceCream.svg',
	'front_kfcBucket.svg',
	'front_lavacake.svg',
	'front_macarons.svg',
	'front_pizza.svg',
	'front_pommes.svg',
	'front_salad.svg',
	'front_sandwich.svg',
	'front_sushi.svg',
	'front_taco.svg',
	'back.svg',
	'label_blue.svg',
	'label_orange.svg',
];

export const THEME_CATALOG: ThemeDefinition[] = [
	{
		id: 'codeVibes',
		label: 'Code vibes',
		previewUrl: '../assets/theme_preview/codeVibes.svg',
		cardFaceUrls: collectFrontImageUrls('codeVibes', codeVibesFiles),
		cardBackUrl: buildThemeAssetUrl('codeVibes', 'back.svg'),
		backButtonLabel: 'Back to start',
		drawIconUrl: buildThemeAssetUrl('codeVibes', 'draw.svg'),
		winnerBlueIconMaskUrl: buildThemeAssetUrl('codeVibes', 'winner_mask.svg'),
		winnerOrangeIconMaskUrl: buildThemeAssetUrl('codeVibes', 'winner_mask.svg'),
	},
	{
		id: 'gaming',
		label: 'Gaming',
		previewUrl: '../assets/theme_preview/gaming.svg',
		cardFaceUrls: collectFrontImageUrls('gaming', gamingFiles),
		cardBackUrl: buildThemeAssetUrl('gaming', 'back.svg'),
		backButtonLabel: 'Home',
		drawIconUrl: buildThemeAssetUrl('gaming', 'draw.svg'),
		winnerIconUrl: buildThemeAssetUrl('gaming', 'trophy.svg'),
	},
	{
		id: 'daProjects',
		label: 'Da projects',
		previewUrl: '../assets/theme_preview/daProjects.svg',
		cardFaceUrls: collectFrontImageUrls('daProjects', daProjectsFiles),
		cardBackUrl: buildThemeAssetUrl('daProjects', 'back.svg'),
		backButtonLabel: 'Home',
		drawIconUrl: buildThemeAssetUrl('daProjects', 'draw.svg'),
		winnerBlueIconUrl: buildThemeAssetUrl('daProjects', 'winner_blue.svg'),
		winnerOrangeIconUrl: buildThemeAssetUrl('daProjects', 'winner_orange.svg'),
	},
	{
		id: 'foods',
		label: 'Foods',
		previewUrl: '../assets/theme_preview/foods.svg',
		cardFaceUrls: collectFrontImageUrls('foods', foodsFiles),
		cardBackUrl: buildThemeAssetUrl('foods', 'back.svg'),
		backButtonLabel: 'Home',
		drawIconUrl: buildThemeAssetUrl('foods', 'draw.svg'),
		winnerBlueIconUrl: buildThemeAssetUrl('foods', 'blue_winner.svg'),
		winnerOrangeIconUrl: buildThemeAssetUrl('foods', 'orange_winner.svg'),
	},
];

export const THEME_BY_ID = THEME_CATALOG.reduce<Record<string, ThemeDefinition>>((result, theme) => {
	result[theme.id] = theme;
	return result;
}, {});

export const DEFAULT_THEME_ID = THEME_BY_ID.codeVibes?.id ?? THEME_CATALOG[0]?.id ?? '';
