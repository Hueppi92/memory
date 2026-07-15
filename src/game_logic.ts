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
    if (this.isResolving) {
      return;
    }

    const cardElement = this.getCardElement(cardId);
    if (!cardElement || cardElement.classList.contains('is-matched')) {
      return;
    }

    if (this.flippedCards.some((card) => card.id === cardId)) {
      return;
    }

    cardElement.classList.add('is-flipped');

    const faceUrl = this.getFaceUrlFromCard(cardElement);
    if (!faceUrl) {
      return;
    }

    this.flippedCards.push({ id: cardId, faceUrl });

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
      this.foundPair = true;
      this.foundPairs.push([firstCard, secondCard]);
      this.increasePlayerScore();
      this.getCardElement(firstCard.id)?.classList.add('is-matched');
      this.getCardElement(secondCard.id)?.classList.add('is-matched');
      this.flippedCards = [];
      return;
    }

    this.foundPair = false;
    this.isResolving = true;

    window.setTimeout(() => {
      this.getCardElement(firstCard.id)?.classList.remove('is-flipped');
      this.getCardElement(secondCard.id)?.classList.remove('is-flipped');
      this.flippedCards = [];
      this.isResolving = false;
      this.nextTurn();
    }, 900);
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
    const inlineStyle = cardFaceElement?.getAttribute('style');
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