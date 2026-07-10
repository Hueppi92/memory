import '/src/scss/base/main.scss';
import '/src/scss/pages/game.scss';
import { loadGameSettings } from './game-settings-storage';

const THEME_FILES_BASE_PATH = 'theme_files/';
const DEFAULT_THEME = 'codeVibes';

const themeAssetFolders: Record<string, string> = {
    codeVibes: 'codeVibes',
    gaming: 'gaming',
    daProjects: 'DA_projects',
    foods: 'food',
};

const themeCardImageFileNames: Record<string, string[]> = {
    codeVibes: ['front.svg'],
    gaming: ['front.svg'],
    daProjects: ['front.svg'],
    foods: ['front.svg'],
};

initGamePage();

function initGamePage() {
    const selectedSettings = loadGameSettings();
    const fieldRef = document.getElementById('field');

    if (!fieldRef) {
        return;
    }

    // Keep selected settings accessible on the game page for styling/logic.
    document.body.dataset.theme = selectedSettings.theme ?? DEFAULT_THEME;
    document.body.dataset.player = selectedSettings.player ?? '';
    document.body.dataset.boardSize = String(selectedSettings.boardSize ?? '');

    renderCards(fieldRef, selectedSettings.boardSize ?? 16, selectedSettings.theme ?? DEFAULT_THEME);

    fieldRef.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
        if (card) {
            card.classList.toggle('is-flipped');
        }
    });
}

function buildCardFaceUrl(theme: string, fileName: string) {
    const folderName = themeAssetFolders[theme] ?? themeAssetFolders[DEFAULT_THEME];
    return `${THEME_FILES_BASE_PATH}${folderName}/${fileName}`;
}

function createDeck(theme: string, fieldSize: number) {
    const imageFileNames = themeCardImageFileNames[theme] ?? themeCardImageFileNames[DEFAULT_THEME];
    const pairCount = fieldSize / 2;
    const deck: string[] = [];

    for (let index = 0; index < pairCount; index++) {
        const fileName = imageFileNames[index % imageFileNames.length];
        const cardFaceUrl = buildCardFaceUrl(theme, fileName);

        deck.push(cardFaceUrl, cardFaceUrl);
    }

    return shuffle(deck);
}

function shuffle<T>(items: T[]) {
    const shuffledItems = [...items];

    for (let currentIndex = shuffledItems.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        const currentItem = shuffledItems[currentIndex];

        shuffledItems[currentIndex] = shuffledItems[randomIndex];
        shuffledItems[randomIndex] = currentItem;
    }

    return shuffledItems;
}

function renderCards(fieldRef: HTMLElement, fieldSize: number, theme: string) {
    fieldRef.innerHTML = '';
    const deck = createDeck(theme, fieldSize);

    for (let i = 0; i < deck.length; i++) {
        fieldRef.innerHTML += ` <button class="card" id="card_${i + 1}" aria-label="Card ${i + 1}">
            <div class="card__inner">
                <div class="card__face" style="--card-face: url('${deck[i]}')"></div>
                <div class="card__face card__face--back"></div>
            </div>
        </button>`;
    }
}