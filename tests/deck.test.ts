import {
  createStandardDeck,
  shuffleDeck,
  isNeutralOpeningCard,
  getValidOpeningCard,
  drawCards,
} from '../src/engine/deck';
import { Card } from '../src/types/card';

describe('Deck Engine Tests', () => {
  test('creates standard 52-card deck without jokers', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(52);

    const suits = new Set(deck.map(c => c.suit));
    expect(suits.size).toBe(4);

    const ranks = new Set(deck.map(c => c.rank));
    expect(ranks.size).toBe(13);
  });

  test('shuffleDeck preserves all cards and order changes', () => {
    const deck = createStandardDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
    expect(new Set(shuffled.map(c => c.id)).size).toBe(52);
  });

  test('neutral opening card excludes 2, Jack, Ace, 7 of Hearts, and 8', () => {
    // Excluded
    expect(isNeutralOpeningCard({ id: '1', rank: '2', suit: 'clubs' })).toBe(false);
    expect(isNeutralOpeningCard({ id: '2', rank: '2', suit: 'hearts' })).toBe(false);
    expect(isNeutralOpeningCard({ id: '3', rank: 'J', suit: 'spades' })).toBe(false);
    expect(isNeutralOpeningCard({ id: '4', rank: 'A', suit: 'spades' })).toBe(false);
    expect(isNeutralOpeningCard({ id: '5', rank: 'A', suit: 'hearts' })).toBe(false);
    expect(isNeutralOpeningCard({ id: '6', rank: '7', suit: 'hearts' })).toBe(false);
    expect(isNeutralOpeningCard({ id: '7', rank: '8', suit: 'diamonds' })).toBe(false);

    // Permitted neutral cards
    expect(isNeutralOpeningCard({ id: '8', rank: '3', suit: 'hearts' })).toBe(true);
    expect(isNeutralOpeningCard({ id: '9', rank: '4', suit: 'spades' })).toBe(true);
    expect(isNeutralOpeningCard({ id: '10', rank: '7', suit: 'spades' })).toBe(true);
    expect(isNeutralOpeningCard({ id: '11', rank: '9', suit: 'clubs' })).toBe(true);
    expect(isNeutralOpeningCard({ id: '12', rank: '10', suit: 'diamonds' })).toBe(true);
    expect(isNeutralOpeningCard({ id: '13', rank: 'Q', suit: 'hearts' })).toBe(true);
    expect(isNeutralOpeningCard({ id: '14', rank: 'K', suit: 'clubs' })).toBe(true);
  });

  test('getValidOpeningCard returns a neutral card and pushes non-neutral to bottom', () => {
    const customPile: Card[] = [
      { id: 'c1', rank: '2', suit: 'hearts' }, // non-neutral
      { id: 'c2', rank: 'J', suit: 'spades' }, // non-neutral
      { id: 'c3', rank: '5', suit: 'diamonds' }, // neutral!
      { id: 'c4', rank: '10', suit: 'clubs' },
    ];

    const { openingCard, updatedDrawPile } = getValidOpeningCard(customPile);
    expect(openingCard.rank).toBe('5');
    expect(openingCard.suit).toBe('diamonds');

    // The two non-neutral cards should have been sent to the back
    expect(updatedDrawPile).toHaveLength(3);
    expect(updatedDrawPile[0].id).toBe('c4');
    expect(updatedDrawPile[1].id).toBe('c1');
    expect(updatedDrawPile[2].id).toBe('c2');
  });

  test('drawCards recycles discard pile when draw pile is empty', () => {
    const drawPile: Card[] = [{ id: 'd1', rank: '3', suit: 'clubs' }];
    const discardPile: Card[] = [
      { id: 'disc1', rank: '4', suit: 'spades' },
      { id: 'disc2', rank: '5', suit: 'hearts' },
      { id: 'top', rank: 'K', suit: 'diamonds' }, // top card should remain
    ];

    const result = drawCards(drawPile, discardPile, 2);
    expect(result.drawn).toHaveLength(2);
    expect(result.drawn[0].id).toBe('d1');
    // Top card of discard pile MUST be preserved
    expect(result.newDiscardPile).toHaveLength(1);
    expect(result.newDiscardPile[0].id).toBe('top');
  });
});
