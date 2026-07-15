import '/src/scss/base/main.scss';
import '/src/scss/pages/game.scss';
import { Card } from './card';
import { flipCard, turn } from './game_logic';
import { loadGameSettings, saveGameResult } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

initGamePage();

function initGamePage() {
    const selectedSettings = loadGameSettings();
    const selectedTheme = selectedSettings.theme ?? DEFAULT_THEME_ID;
    const selectedPlayer = selectedSettings.player === 'orange' ? 'orange' : 'blue';
    const boardSize = selectedSettings.boardSize ?? 16;
    const fieldRef = document.getElementById('field');
    let isRedirecting = false;

    if (!fieldRef) {
        return;
    }

    // Keep selected settings accessible on the game page for styling/logic.
    document.body.dataset.theme = selectedTheme;
    document.body.dataset.player = selectedPlayer;
    document.body.dataset.boardSize = String(selectedSettings.boardSize ?? '');

    turn.currentPlayer = selectedPlayer === 'orange' ? turn.orangePlayer : turn.bluePlayer;
    syncTurnUi();

    renderCards(fieldRef, boardSize, selectedTheme);

    fieldRef.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
        if (card) {
            flipCard(getCardIdFromElement(card));
            syncTurnUi();
            maybeEndGame(boardSize);

            // A mismatch changes player after the timeout in game logic.
            window.setTimeout(() => {
                syncTurnUi();
                maybeEndGame(boardSize);
            }, 950);
        }
    });

    function maybeEndGame(totalCards: number) {
        if (isRedirecting) {
            return;
        }

        const matchedCardCount = turn.foundPairs.length * 2;
        if (matchedCardCount < totalCards) {
            return;
        }

        isRedirecting = true;

        const winner = turn.getWinner();
        saveGameResult({
            winner: winner ? winner.id : 'draw',
            scores: {
                blue: turn.bluePlayer.playerScore,
                orange: turn.orangePlayer.playerScore,
            },
        });

        window.location.href = '/pages/game-over.html';
    }
}

function syncTurnUi() {
    renderCurrentPlayerTag(turn.currentPlayer.id);
    renderScores();
}

function renderScores() {
    const blueScoreValue = document.getElementById('blueScoreValue');
    const orangeScoreValue = document.getElementById('orangeScoreValue');

    if (blueScoreValue) {
        blueScoreValue.textContent = String(turn.bluePlayer.playerScore);
    }

    if (orangeScoreValue) {
        orangeScoreValue.textContent = String(turn.orangePlayer.playerScore);
    }
}

function createDeck(theme: string, fieldSize: number): Card[] {
    const imageFileNames = THEME_BY_ID[theme]?.cardFaceUrls ?? THEME_BY_ID[DEFAULT_THEME_ID]?.cardFaceUrls ?? [];

    if (imageFileNames.length === 0) {
        return [];
    }

    const pairCount = fieldSize / 2;
    const deck: Card[] = [];
    let id = 1;

    for (let index = 0; index < pairCount; index++) {
        const cardFaceUrl = imageFileNames[index % imageFileNames.length];
        deck.push(
            {
                id: id++,
                pairId: index + 1,
                faceUrl: cardFaceUrl,
                isFlipped: false,
                isMatched: false,
            },
            {
                id: id++,
                pairId: index + 1,
                faceUrl: cardFaceUrl,
                isFlipped: false,
                isMatched: false,
            }
        );
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
        const frontStyleAttribute = deck[i]?.faceUrl ? ` style="background-image: url('${deck[i].faceUrl}')"` : '';
        const backStyleAttribute = cardBackUrl ? ` style="background-image: url('${cardBackUrl}')"` : '';

        fieldRef.innerHTML += ` <button class="card" id="card_${i + 1}" data-face-url="${deck[i].faceUrl}" aria-label="Card ${i + 1}">
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

    currentPlayerTag.innerHTML = `
        <span class="currentPlayerIndicator currentPlayerIndicator--${normalizedPlayer}" aria-hidden="true"></span>
        
    `;
}

function getCardIdFromElement(card: HTMLButtonElement): number {
    return parseInt(card.id.replace('card_', ''), 10);
}

