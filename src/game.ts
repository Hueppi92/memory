import '/src/scss/base/main.scss';
import '/src/scss/pages/game.scss';
import { loadGameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

initGamePage();

function initGamePage() {
    const selectedSettings = loadGameSettings();
    const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;
    const selectedPlayer = selectedSettings.player ?? 'blue';
    const fieldRef = document.getElementById('field');

    if (!fieldRef) {
        return;
    }

    // Keep selected settings accessible on the game page for styling/logic.
    document.body.dataset.theme = selectedTheme;
    document.body.dataset.player = selectedPlayer;
    document.body.dataset.boardSize = String(selectedSettings.boardSize ?? '');

    renderCurrentPlayerTag(selectedPlayer);

    renderCards(fieldRef, selectedSettings.boardSize ?? 16, selectedTheme);

    fieldRef.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
        if (card) {
            card.classList.toggle('is-flipped');
        }
    });
}

function createDeck(theme: string, fieldSize: number) {
    const imageFileNames = THEME_BY_ID[theme]?.cardFaceUrls ?? THEME_BY_ID[DEFAULT_THEME_ID]?.cardFaceUrls ?? [];

    if (imageFileNames.length === 0) {
        return [];
    }

    const pairCount = fieldSize / 2;
    const deck: string[] = [];

    for (let index = 0; index < pairCount; index++) {
        const cardFaceUrl = imageFileNames[index % imageFileNames.length];
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
    const cardBackUrl = THEME_BY_ID[theme]?.cardBackUrl ?? THEME_BY_ID[DEFAULT_THEME_ID]?.cardBackUrl;

    for (let i = 0; i < deck.length; i++) {
        const frontStyleAttribute = deck[i] ? ` style="background-image: url('${deck[i]}')"` : '';
        const backStyleAttribute = cardBackUrl ? ` style="background-image: url('${cardBackUrl}')"` : '';

        fieldRef.innerHTML += ` <button class="card" id="card_${i + 1}" aria-label="Card ${i + 1}">
            <div class="card__inner">
                <div class="card__face"${frontStyleAttribute}></div>
                <div class="card__face card__face--back"${backStyleAttribute}></div>
            </div>
        </button>`;
    }
}

function renderCurrentPlayerTag(player: string) {
    const currentPlayerTag = document.getElementById('currentPlayerTag');

    if (!currentPlayerTag) {
        return;
    }

    const normalizedPlayer = player === 'orange' ? 'orange' : 'blue';
    const playerLabel = normalizedPlayer === 'orange' ? 'Orange' : 'Blue';

    currentPlayerTag.innerHTML = `
        <span class="scoreBoardLabel scoreBoardLabel--${normalizedPlayer}" aria-hidden="true"></span>
        
    `;
}