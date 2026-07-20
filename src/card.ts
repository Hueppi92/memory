/**
 * Describes a single card in the memory deck.
 */
export interface Card {
	id: number;
	pairId: number;
	faceUrl: string;
	isFlipped: boolean;
	isMatched: boolean;
}
