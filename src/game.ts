import '/src/scss/base/main.scss';
import '/src/scss/pages/game.scss';
import { Card } from './card';
import { flipCard, turn } from './game_logic';
import { loadGameSettings, saveGameResult, type GameResult, type GameSettings } from './game-settings-storage';
import { DEFAULT_THEME_ID, THEME_BY_ID } from './theme-catalog';

type GamePageContext = {
    fieldRef: HTMLElement;
    selectedTheme: string;
    selectedPlayer: 'orange' | 'blue';
    boardSize: number;
    isRedirecting: boolean;
};

initGamePage();

function initGamePage() {
    const selectedSettings = loadGameSettings();
    const fieldRef = document.getElementById('field');
    if (!fieldRef) {
        return;
    }
    const context = createGamePageContext(selectedSettings, fieldRef);
    applyGameDataset(context, selectedSettings);
    initializeTurn(context.selectedPlayer);
    renderCards(context.fieldRef, context.boardSize, context.selectedTheme);
    setupExitConfirmPopup();
    bindCardClick(context);
}

function createGamePageContext(settings: GameSettings, fieldRef: HTMLElement): GamePageContext {
    return {
        fieldRef,
        selectedTheme: settings.theme ?? DEFAULT_THEME_ID,
        selectedPlayer: settings.player === 'orange' ? 'orange' : 'blue',
        boardSize: settings.boardSize ?? 16,
        isRedirecting: false,
    };
}

function applyGameDataset(context: GamePageContext, settings: GameSettings) {
    document.body.dataset.theme = context.selectedTheme;
    document.body.dataset.player = context.selectedPlayer;
    document.body.dataset.boardSize = String(settings.boardSize ?? '');
}

function initializeTurn(selectedPlayer: 'orange' | 'blue') {
    turn.currentPlayer = selectedPlayer === 'orange' ? turn.orangePlayer : turn.bluePlayer;
    syncTurnUi();
}

function bindCardClick(context: GamePageContext) {
    context.fieldRef.addEventListener('click', (event) => {
        const card = (event.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
        if (!card) {
            return;
        }
        handleCardClick(card, context);
    });
}

function handleCardClick(card: HTMLButtonElement, context: GamePageContext) {
    flipCard(getCardIdFromElement(card));
    syncTurnUi();
    maybeEndGame(context);
    window.setTimeout(() => {
        syncTurnUi();
        maybeEndGame(context);
    }, 950);
}

function maybeEndGame(context: GamePageContext) {
    if (context.isRedirecting || turn.foundPairs.length * 2 < context.boardSize) {
        return;
    }
    context.isRedirecting = true;
    saveGameResult(buildGameResult());
    window.location.href = '/pages/game-over.html';
}

function buildGameResult(): GameResult {
    const winner = turn.getWinner();
    const winnerId: GameResult['winner'] = winner ? winner.id : 'draw';
    return {
        winner: winnerId,
        scores: {
            blue: turn.bluePlayer.playerScore,
            orange: turn.orangePlayer.playerScore,
        },
    };
}

function setupExitConfirmPopup() {
    const popupElements = getExitPopupElements();
    if (!popupElements) {
        return;
    }
    bindExitPopupEvents(popupElements);
}

function getExitPopupElements() {
    const exitLink = document.querySelector('#exit a') as HTMLAnchorElement | null;
    const overlay = document.getElementById('exitConfirmOverlay');
    const cancelButton = document.getElementById('exitConfirmCancel') as HTMLButtonElement | null;
    const confirmButton = document.getElementById('exitConfirmConfirm') as HTMLButtonElement | null;
    if (!exitLink || !overlay || !cancelButton || !confirmButton) {
        return null;
    }
    return { exitLink, overlay, cancelButton, confirmButton };
}

function bindExitPopupEvents(elements: NonNullable<ReturnType<typeof getExitPopupElements>>) {
    const targetUrl = elements.exitLink.href;
    const closePopup = createClosePopup(elements.exitLink, elements.overlay);
    elements.exitLink.addEventListener('click', (event) => {
        event.preventDefault();
        openExitPopup(elements.overlay, elements.cancelButton);
    });
    elements.cancelButton.addEventListener('click', closePopup);
    elements.confirmButton.addEventListener('click', () => window.location.href = targetUrl);
    bindExitOverlayClose(elements.overlay, closePopup);
    bindEscapeClose(elements.overlay, closePopup);
}

function createClosePopup(exitLink: HTMLAnchorElement, overlay: HTMLElement) {
    return () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        exitLink.focus();
    };
}

function openExitPopup(overlay: HTMLElement, cancelButton: HTMLButtonElement) {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    cancelButton.focus();
}

function bindExitOverlayClose(overlay: HTMLElement, closePopup: () => void) {
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closePopup();
        }
    });
}

function bindEscapeClose(overlay: HTMLElement, closePopup: () => void) {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
            closePopup();
        }
    });
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
        id = addCardPair(deck, id, index, imageFileNames);
    }
    return shuffle(deck);
}

function addCardPair(deck: Card[], id: number, index: number, imageFileNames: string[]) {
    const pairId = index + 1;
    const faceUrl = imageFileNames[index % imageFileNames.length];
    deck.push(createCard(id, pairId, faceUrl));
    deck.push(createCard(id + 1, pairId, faceUrl));
    return id + 2;
}

function createCard(id: number, pairId: number, faceUrl: string): Card {
    return {
        id,
        pairId,
        faceUrl,
        isFlipped: false,
        isMatched: false,
    };
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
    const deck = createDeck(theme, fieldSize);
    const cardBackUrl = THEME_BY_ID[theme]?.cardBackUrl ?? THEME_BY_ID[DEFAULT_THEME_ID]?.cardBackUrl;
    fieldRef.innerHTML = deck.map((card, index) => {
        return renderCardMarkup(card, cardBackUrl, index + 1);
    }).join('');
}

function renderCardMarkup(card: Card, cardBackUrl: string | undefined, cardNumber: number) {
    const frontStyleAttribute = styleAttribute(card.faceUrl);
    const backStyleAttribute = styleAttribute(cardBackUrl);
    return ` <button class="card" id="card_${cardNumber}" data-face-url="${card.faceUrl}" aria-label="Card ${cardNumber}">
            <div class="card__inner">
                <div class="card__face"${frontStyleAttribute}></div>
                <div class="card__face card__face--back"${backStyleAttribute}></div>
            </div>
        </button>`;
}

function styleAttribute(imageUrl?: string) {
    if (!imageUrl) {
        return '';
    }
    return ` style="background-image: url('${imageUrl}')"`;
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

