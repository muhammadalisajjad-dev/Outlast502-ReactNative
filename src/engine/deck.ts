import { Card, SUITS, RANKS, Suit, Rank } from '../types/card';

/**
 * Creates a standard 52-card deck without jokers.
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
      });
    }
  }
  return deck;
}

/**
 * Shuffles an array of cards using Fisher-Yates algorithm.
 * Accepts an optional custom PRNG function for deterministic testing.
 */
export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Determines whether a card qualifies as a neutral opening card.
 *
 * Rules Exclusion:
 * - 2: Imposes draw penalty
 * - Jack: Wild, demands suit
 * - Ace: A♠ imposes penalty; other Aces pass penalty
 * - 7 of Hearts: Instant win
 * - 8: Imposes skip on first player
 */
export function isNeutralOpeningCard(card: Card): boolean {
  if (card.rank === '2') return false;
  if (card.rank === 'J') return false;
  if (card.rank === 'A') return false;
  if (card.rank === '7' && card.suit === 'hearts') return false;
  if (card.rank === '8') return false;
  return true;
}

/**
 * Draws the opening card for a new round.
 * Any non-neutral card is placed at the bottom of the draw pile.
 * Returns { openingCard: Card, updatedDrawPile: Card[] }
 */
export function getValidOpeningCard(drawPile: Card[]): {
  openingCard: Card;
  updatedDrawPile: Card[];
} {
  const pile = [...drawPile];
  while (pile.length > 0) {
    const candidate = pile.shift()!;
    if (isNeutralOpeningCard(candidate)) {
      return {
        openingCard: candidate,
        updatedDrawPile: pile,
      };
    }
    // Non-neutral: place at the bottom of the draw pile
    pile.push(candidate);
  }
  throw new Error('No neutral card found in draw pile');
}

/**
 * Draws `count` cards from the draw pile, recycling the discard pile (except its top card)
 * if the draw pile runs out.
 */
export function drawCards(
  drawPile: Card[],
  discardPile: Card[],
  count: number,
  rng: () => number = Math.random
): {
  drawn: Card[];
  newDrawPile: Card[];
  newDiscardPile: Card[];
} {
  let currentDraw = [...drawPile];
  let currentDiscard = [...discardPile];
  const drawn: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (currentDraw.length === 0) {
      if (currentDiscard.length <= 1) {
        // No cards left to recycle
        break;
      }
      // Top card of discard pile stays
      const topDiscard = currentDiscard[currentDiscard.length - 1];
      const recyclable = currentDiscard.slice(0, currentDiscard.length - 1);
      currentDraw = shuffleDeck(recyclable, rng);
      currentDiscard = [topDiscard];
    }

    if (currentDraw.length > 0) {
      drawn.push(currentDraw.shift()!);
    }
  }

  return {
    drawn,
    newDrawPile: currentDraw,
    newDiscardPile: currentDiscard,
  };
}
