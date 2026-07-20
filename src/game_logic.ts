type ComparedCard = {
  id: number;
  faceUrl: string;
};

export type PlayerId = 'orange' | 'blue';

export class Player {
  id: PlayerId;
  playerScore: number;

  constructor(id: PlayerId) {
    this.id = id;
    this.playerScore = 0;
  }

  // Compatibility alias for "playerscore" naming.
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

  
  get CurrentPlayer() {
    return this.currentPlayer;
  }

  nextTurn() {
    this.currentPlayer = this.currentPlayer === this.orangePlayer ? this.bluePlayer : this.orangePlayer;
  }

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

  private tryAddFlippedCard(cardElement: HTMLButtonElement, cardId: number) {
    const faceUrl = this.getFaceUrlFromCard(cardElement);
    if (!faceUrl) {
      return false;
    }

    this.flippedCards.push({ id: cardId, faceUrl });
    return true;
  }

  private resolvePairWhenReady() {
    if (this.flippedCards.length === 2) {
      this.resolveCurrentPair();
    }
  }

  private increasePlayerScore() {
    if (this.foundPair) {
      this.currentPlayer.playerScore++;
    }
  }

  getWinner(): Player | null {
    if (this.orangePlayer.playerScore === this.bluePlayer.playerScore) {
      return null;
    }

    return this.orangePlayer.playerScore > this.bluePlayer.playerScore ? this.orangePlayer : this.bluePlayer;
  }

 

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

  private resolveMatchingPair(firstCard: ComparedCard, secondCard: ComparedCard) {
    this.foundPair = true;
    this.foundPairs.push([firstCard, secondCard]);
    this.increasePlayerScore();
    this.getCardElement(firstCard.id)?.classList.add('is-matched');
    this.getCardElement(secondCard.id)?.classList.add('is-matched');
    this.resetFlippedCards();
  }

  private resolveMismatchedPair(firstCard: ComparedCard, secondCard: ComparedCard) {
    this.foundPair = false;
    this.isResolving = true;
    window.setTimeout(() => {
      this.unflipCards(firstCard.id, secondCard.id);
      this.resetAfterMismatch();
    }, 900);
  }

  private unflipCards(firstCardId: number, secondCardId: number) {
    this.getCardElement(firstCardId)?.classList.remove('is-flipped');
    this.getCardElement(secondCardId)?.classList.remove('is-flipped');
  }

  private resetAfterMismatch() {
    this.resetFlippedCards();
    this.isResolving = false;
    this.nextTurn();
  }

  private resetFlippedCards() {
    this.flippedCards = [];
  }

  private getCardElement(cardId: number): HTMLButtonElement | null {
    return document.getElementById(`card_${cardId}`) as HTMLButtonElement | null;
  }

  private getFaceUrlFromCard(card: HTMLButtonElement): string | null {
    const datasetFaceUrl = card.dataset.faceUrl;
    if (datasetFaceUrl) {
      return datasetFaceUrl;
    }

    const cardFaceElement = card.querySelector('.card__face') as HTMLElement | null;
    const inlineStyle = cardFaceElement?.getAttribute('style') ?? null;
    return this.extractUrlFromInlineStyle(inlineStyle);
  }

  private extractUrlFromInlineStyle(inlineStyle: string | null) {
    if (!inlineStyle) {
      return null;
    }

    const extractedUrl = /url\(['"]?(.*?)['"]?\)/.exec(inlineStyle)?.[1] ?? null;
    return extractedUrl;
  }
}

export const turn = new Turn();

export function flipCard(cardId: number) {
  turn.flipCard(cardId);
}