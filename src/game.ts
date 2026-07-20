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

/**
 * Bootstraps the game board, turn state, and exit dialog.
 */
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

/**
 * Normalizes the saved settings into a runtime game context.
 *
 * @param settings - The saved game settings
 * @param fieldRef - The board's field element
 * @returns The runtime context used to drive the game page
 */
function createGamePageContext(settings: GameSettings, fieldRef: HTMLElement): GamePageContext {
    return {
        fieldRef,
        selectedTheme: settings.theme ?? DEFAULT_THEME_ID,
        selectedPlayer: settings.player === 'orange' ? 'orange' : 'blue',
        boardSize: settings.boardSize ?? 16,
        isRedirecting: false,
    };
}

/**
 * Applies the selected settings to document metadata.
 *
 * @param context - The current game page context
 * @param settings - The saved game settings
 */
function applyGameDataset(context: GamePageContext, settings: GameSettings) {
    document.body.dataset.theme = context.selectedTheme;
    document.body.dataset.player = context.selectedPlayer;
    document.body.dataset.boardSize = String(settings.boardSize ?? '');
}

/**
 * Sets the active player before cards are rendered.
 *
 * @param selectedPlayer - The player who goes first
 */
function initializeTurn(selectedPlayer: 'orange' | 'blue') {
    turn.currentPlayer = selectedPlayer === 'orange' ? turn.orangePlayer : turn.bluePlayer;
    syncTurnUi();
}

/**
 * Handles card clicks on the game board.
 *
 * @param context - The current game page context
 */
function bindCardClick(context: GamePageContext) {
    context.fieldRef.addEventListener('click', (event) => {
        const card = (event.target as HTMLElement).closest('.card') as HTMLButtonElement | null;
        if (!card) {
            return;
        }
        handleCardClick(card, context);
    });
}

/**
 * Flips the clicked card and checks whether the match is finished.
 *
 * @param card - The clicked card element
 * @param context - The current game page context
 */
function handleCardClick(card: HTMLButtonElement, context: GamePageContext) {
    flipCard(getCardIdFromElement(card));
    syncTurnUi();
    maybeEndGame(context);
    window.setTimeout(() => {
        syncTurnUi();
        maybeEndGame(context);
    }, 950);
}

/**
 * Redirects to the result screens once all pairs are found.
 *
 * @param context - The current game page context
 */
function maybeEndGame(context: GamePageContext) {
    if (context.isRedirecting || turn.foundPairs.length * 2 < context.boardSize) {
        return;
    }
    context.isRedirecting = true;
    saveGameResult(buildGameResult());
    window.setTimeout(() => {
        window.location.href = '/pages/game-over.html';
    }, 2000);
}

/**
 * Builds the persisted game result from the current turn state.
 *
 * @returns The result to persist, with the winner and final scores
 */
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

/**
 * Sets up the exit confirmation popup when the DOM contains it.
 */
function setupExitConfirmPopup() {
    const popupElements = getExitPopupElements();
    if (!popupElements) {
        return;
    }
    bindExitPopupEvents(popupElements);
}

/**
 * Collects the popup elements needed for interaction.
 *
 * @returns The popup elements, or `null` if any are missing
 */
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

/**
 * Wires the exit confirmation popup actions.
 *
 * @param elements - The popup elements to bind
 */
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

/**
 * Creates a handler that closes the exit popup and restores focus.
 *
 * @param exitLink - The link to restore focus to
 * @param overlay - The popup overlay element
 * @returns A function that closes the popup
 */
function createClosePopup(exitLink: HTMLAnchorElement, overlay: HTMLElement) {
    return () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        exitLink.focus();
    };
}

/**
 * Opens the exit popup and focuses the cancel action.
 *
 * @param overlay - The popup overlay element
 * @param cancelButton - The button to focus once opened
 */
function openExitPopup(overlay: HTMLElement, cancelButton: HTMLButtonElement) {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    cancelButton.focus();
}

/**
 * Allows clicking the backdrop to close the popup.
 *
 * @param overlay - The popup overlay element
 * @param closePopup - The function to call to close the popup
 */
function bindExitOverlayClose(overlay: HTMLElement, closePopup: () => void) {
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closePopup();
        }
    });
}

/**
 * Closes the popup when Escape is pressed.
 *
 * @param overlay - The popup overlay element
 * @param closePopup - The function to call to close the popup
 */
function bindEscapeClose(overlay: HTMLElement, closePopup: () => void) {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
            closePopup();
        }
    });
}

/**
 * Updates the current-player indicator and scoreboard.
 */
function syncTurnUi() {
    renderCurrentPlayerTag(turn.currentPlayer.id);
    renderScores();
}

/**
 * Renders the current scores into the scoreboard.
 */
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

/**
 * Creates a shuffled deck for the selected theme and board size.
 *
 * @param theme - The theme id to source card faces from
 * @param fieldSize - The total number of cards on the board
 * @returns A shuffled deck of cards, or an empty array if the theme has no faces
 */
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

/**
 * Adds one matching pair of cards to the deck.
 *
 * @param deck - The deck to append the pair to
 * @param id - The next available card id
 * @param index - The pair's position in the deck
 * @param imageFileNames - The available card face urls for the theme
 * @returns The next available card id after adding the pair
 */
function addCardPair(deck: Card[], id: number, index: number, imageFileNames: string[]) {
    const pairId = index + 1;
    const faceUrl = imageFileNames[index % imageFileNames.length];
    deck.push(createCard(id, pairId, faceUrl));
    deck.push(createCard(id + 1, pairId, faceUrl));
    return id + 2;
}

/**
 * Creates a card model from its deck metadata.
 *
 * @param id - The card's unique id
 * @param pairId - The id shared by both cards in a matching pair
 * @param faceUrl - The card's face image url
 * @returns A new, unflipped and unmatched card
 */
function createCard(id: number, pairId: number, faceUrl: string): Card {
    return {
        id,
        pairId,
        faceUrl,
        isFlipped: false,
        isMatched: false,
    };
}

/**
 * Returns a shuffled copy of the provided array.
 *
 * @param items - The array to shuffle
 * @returns A new array with the same items in randomized order
 */
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

/**
 * Renders the full card grid into the game field.
 *
 * @param fieldRef - The board's field element
 * @param fieldSize - The total number of cards on the board
 * @param theme - The theme id to source card assets from
 */
function renderCards(fieldRef: HTMLElement, fieldSize: number, theme: string) {
    const deck = createDeck(theme, fieldSize);
    const cardBackUrl = THEME_BY_ID[theme]?.cardBackUrl ?? THEME_BY_ID[DEFAULT_THEME_ID]?.cardBackUrl;
    fieldRef.innerHTML = deck.map((card, index) => {
        return renderCardMarkup(card, cardBackUrl, index + 1);
    }).join('');
}

/**
 * Renders a single card button as HTML.
 *
 * @param card - The card to render
 * @param cardBackUrl - The theme's card back image url, if any
 * @param cardNumber - The card's 1-based position on the board
 * @returns The card's HTML markup
 */
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

/**
 * Returns an inline style attribute for a background image.
 *
 * @param imageUrl - The image url to apply, if any
 * @returns The `style` attribute string, or an empty string if no url is given
 */
function styleAttribute(imageUrl?: string) {
    if (!imageUrl) {
        return '';
    }
    return ` style="background-image: url('${imageUrl}')"`;
}

/**
 * Updates the visual current-player marker in the header.
 *
 * @param player - The current player's id
 */
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

/**
 * Extracts the numeric card id from the rendered DOM id.
 *
 * @param card - The card element to read
 * @returns The card's numeric id
 */
function getCardIdFromElement(card: HTMLButtonElement): number {
    return parseInt(card.id.replace('card_', ''), 10);
}