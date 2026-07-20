type ComparedCard = {
	id: number;
	faceUrl: string;
};

/**
 * Identifies one of the two players in a match.
 */
export type PlayerId = 'orange' | 'blue';

/**
 * Tracks the score for a single player.
 */
export class Player {
	id: PlayerId;
	playerScore: number;

	/**
	 * Creates a player with an initial score of zero.
	 *
	 * @param id - The player to create
	 */
	constructor(id: PlayerId) {
		this.id = id;
		this.playerScore = 0;
	}

	/**
	 * Compatibility alias for the legacy `playerscore` naming.
	 */
	get playerscore() {
		return this.playerScore;
	}

	set playerscore(value: number) {
		this.playerScore = value;
	}
}

export class Turn {
	readonly orangePlayer = new Player('orange');
	readonly bluePlayer = new Player('blue');
	currentPlayer: Player = this.orangePlayer;
	playerScore = 0;
	flippedCards: ComparedCard[] = [];
	foundPair = false;
	foundPairs: ComparedCard[][] = [];
	private isResolving = false;

	/**
	 * Returns the player whose turn is currently active.
	 */
	get CurrentPlayer() {
		return this.currentPlayer;
	}

	/**
	 * Switches the active player.
	 */
	nextTurn() {
		this.currentPlayer = this.currentPlayer === this.orangePlayer ? this.bluePlayer : this.orangePlayer;
	}

	/**
	 * Flips a card, resolves pairs, and advances the turn state when needed.
	 *
	 * @param cardId - The DOM id suffix of the card to flip
	 */
	flipCard(cardId: number) {
		if (!this.canFlipCard(cardId)) {
			return;
		}
		const cardElement = this.getCardElement(cardId);
		if (!cardElement) {
			return;
		}
		cardElement.classList.add('is-flipped');
		if (!this.tryAddFlippedCard(cardElement, cardId)) {
			return;
		}
		this.resolvePairWhenReady();
	}

	/**
	 * Checks whether the given card is eligible to be flipped.
	 *
	 * @param cardId - The DOM id suffix of the card to check
	 */
	private canFlipCard(cardId: number) {
		if (this.isResolving) {
			return false;
		}

		const cardElement = this.getCardElement(cardId);
		if (!cardElement || cardElement.classList.contains('is-matched')) {
			return false;
		}

		return !this.flippedCards.some((card) => card.id === cardId);
	}

	/**
	 * Records a flipped card if its face url can be resolved.
	 *
	 * @param cardElement - The flipped card's element
	 * @param cardId - The DOM id suffix of the card
	 * @returns `true` if the card was added to `flippedCards`
	 */
	private tryAddFlippedCard(cardElement: HTMLButtonElement, cardId: number) {
		const faceUrl = this.getFaceUrlFromCard(cardElement);
		if (!faceUrl) {
			return false;
		}

		this.flippedCards.push({ id: cardId, faceUrl });
		return true;
	}

	/**
	 * Resolves the current pair once two cards have been flipped.
	 */
	private resolvePairWhenReady() {
		if (this.flippedCards.length === 2) {
			this.resolveCurrentPair();
		}
	}

	/**
	 * Increments the current player's score when a pair was found.
	 */
	private increasePlayerScore() {
		if (this.foundPair) {
			this.currentPlayer.playerScore++;
		}
	}

	/**
	 * Returns the winning player, or `null` when the match is tied.
	 */
	getWinner(): Player | null {
		if (this.orangePlayer.playerScore === this.bluePlayer.playerScore) {
			return null;
		}

		return this.orangePlayer.playerScore > this.bluePlayer.playerScore ? this.orangePlayer : this.bluePlayer;
	}

	/**
	 * Compares the two flipped cards and routes to the matching or
	 * mismatched resolution path.
	 */
	private resolveCurrentPair() {
		const [firstCard, secondCard] = this.flippedCards;
		if (!firstCard || !secondCard) {
			return;
		}

		if (firstCard.faceUrl === secondCard.faceUrl) {
			this.resolveMatchingPair(firstCard, secondCard);
			return;
		}

		this.resolveMismatchedPair(firstCard, secondCard);
	}

	/**
	 * Marks a matching pair as found and updates the score and board.
	 *
	 * @param firstCard - The first card in the pair
	 * @param secondCard - The second card in the pair
	 */
	private resolveMatchingPair(firstCard: ComparedCard, secondCard: ComparedCard) {
		this.foundPair = true;
		this.foundPairs.push([firstCard, secondCard]);
		this.increasePlayerScore();
		this.getCardElement(firstCard.id)?.classList.add('is-matched');
		this.getCardElement(secondCard.id)?.classList.add('is-matched');
		this.resetFlippedCards();
	}

	/**
	 * Unflips a mismatched pair after a short delay and hands off the turn.
	 *
	 * @param firstCard - The first card in the pair
	 * @param secondCard - The second card in the pair
	 */
	private resolveMismatchedPair(firstCard: ComparedCard, secondCard: ComparedCard) {
		this.foundPair = false;
		this.isResolving = true;
		window.setTimeout(() => {
			this.unflipCards(firstCard.id, secondCard.id);
			this.resetAfterMismatch();
		}, 900);
	}

	/**
	 * Removes the flipped state from two cards.
	 *
	 * @param firstCardId - The DOM id suffix of the first card
	 * @param secondCardId - The DOM id suffix of the second card
	 */
	private unflipCards(firstCardId: number, secondCardId: number) {
		this.getCardElement(firstCardId)?.classList.remove('is-flipped');
		this.getCardElement(secondCardId)?.classList.remove('is-flipped');
	}

	/**
	 * Clears the flipped cards and advances to the next player.
	 */
	private resetAfterMismatch() {
		this.resetFlippedCards();
		this.isResolving = false;
		this.nextTurn();
	}

	/**
	 * Clears the currently flipped cards.
	 */
	private resetFlippedCards() {
		this.flippedCards = [];
	}

	/**
	 * Looks up a card's button element by its DOM id suffix.
	 *
	 * @param cardId - The DOM id suffix of the card
	 */
	private getCardElement(cardId: number): HTMLButtonElement | null {
		return document.getElementById(`card_${cardId}`) as HTMLButtonElement | null;
	}

	/**
	 * Resolves a card's face image url from its dataset or inline style.
	 *
	 * @param card - The card element to read
	 */
	private getFaceUrlFromCard(card: HTMLButtonElement): string | null {
		const datasetFaceUrl = card.dataset.faceUrl;
		if (datasetFaceUrl) {
			return datasetFaceUrl;
		}

		const cardFaceElement = card.querySelector('.card__face') as HTMLElement | null;
		const inlineStyle = cardFaceElement?.getAttribute('style') ?? null;
		return this.extractUrlFromInlineStyle(inlineStyle);
	}

	/**
	 * Extracts the url from a `background-image: url(...)` inline style.
	 *
	 * @param inlineStyle - The element's inline `style` attribute value
	 */
	private extractUrlFromInlineStyle(inlineStyle: string | null) {
		if (!inlineStyle) {
			return null;
		}

		const extractedUrl = /url\(['"]?(.*?)['"]?\)/.exec(inlineStyle)?.[1] ?? null;
		return extractedUrl;
	}
}

/**
 * Shared turn state for the active game session.
 */
export const turn = new Turn();

/**
 * Flips a card in the shared turn state.
 *
 * @param cardId - The DOM id suffix of the card to flip
 */
export function flipCard(cardId: number) {
	turn.flipCard(cardId);
}