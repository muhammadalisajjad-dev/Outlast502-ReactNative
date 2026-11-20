import { isLegalPlay, getPlayableCards } from '../src/engine/rules';
import { Card } from '../src/types/card';
import { PenaltyState } from '../src/types/game';

describe('Rules & Move Legality Tests', () => {
  const topDiscard: Card = { id: 'top', rank: '9', suit: 'clubs' };
  const noPenalty: PenaltyState = { type: null, cardsOwed: 0, active: false };

  test('normal play matches by suit', () => {
    const matchingSuit: Card = { id: 'c1', rank: '4', suit: 'clubs' };
    expect(isLegalPlay(matchingSuit, topDiscard, null, noPenalty)).toBe(true);
  });

  test('normal play matches by rank', () => {
    const matchingRank: Card = { id: 'c2', rank: '9', suit: 'hearts' };
    expect(isLegalPlay(matchingRank, topDiscard, null, noPenalty)).toBe(true);
  });

  test('normal play rejects different suit and different rank', () => {
    const nonMatching: Card = { id: 'c3', rank: '5', suit: 'diamonds' };
    expect(isLegalPlay(nonMatching, topDiscard, null, noPenalty)).toBe(false);
  });

  test('Jack is wild and can be played on any normal card', () => {
    const jack: Card = { id: 'j', rank: 'J', suit: 'diamonds' };
    expect(isLegalPlay(jack, topDiscard, null, noPenalty)).toBe(true);
  });

  test('7 of Hearts is wild and can be played on any normal card', () => {
    const sevenHearts: Card = { id: '7h', rank: '7', suit: 'hearts' };
    expect(isLegalPlay(sevenHearts, topDiscard, null, noPenalty)).toBe(true);

    // Other 7s are NOT wild
    const sevenSpades: Card = { id: '7s', rank: '7', suit: 'spades' };
    expect(isLegalPlay(sevenSpades, topDiscard, null, noPenalty)).toBe(false);
  });

  test('declared suit from previous Jack is strictly enforced', () => {
    const declaredSuit = 'hearts';
    const heartCard: Card = { id: 'c4', rank: '3', suit: 'hearts' };
    const clubCard: Card = { id: 'c5', rank: '9', suit: 'clubs' }; // Matches topDiscard suit/rank, but violates declared suit!

    expect(isLegalPlay(heartCard, topDiscard, declaredSuit, noPenalty)).toBe(true);
    expect(isLegalPlay(clubCard, topDiscard, declaredSuit, noPenalty)).toBe(false);

    // Jack and 7♥ can still be played on declared suit
    const jack: Card = { id: 'j2', rank: 'J', suit: 'spades' };
    const sevenHearts: Card = { id: '7h2', rank: '7', suit: 'hearts' };
    expect(isLegalPlay(jack, topDiscard, declaredSuit, noPenalty)).toBe(true);
    expect(isLegalPlay(sevenHearts, topDiscard, declaredSuit, noPenalty)).toBe(true);
  });

  test('pending penalties take absolute precedence: Jack and 7♥ cannot answer penalty', () => {
    const twoPenalty: PenaltyState = { type: 'two', cardsOwed: 4, active: true };
    const jack: Card = { id: 'j', rank: 'J', suit: 'spades' };
    const sevenHearts: Card = { id: '7h', rank: '7', suit: 'hearts' };
    const twoClubs: Card = { id: '2c', rank: '2', suit: 'clubs' };
    const normalClubs: Card = { id: 'nc', rank: '9', suit: 'clubs' };

    expect(isLegalPlay(jack, topDiscard, null, twoPenalty)).toBe(false);
    expect(isLegalPlay(sevenHearts, topDiscard, null, twoPenalty)).toBe(false);
    expect(isLegalPlay(normalClubs, topDiscard, null, twoPenalty)).toBe(false);
    expect(isLegalPlay(twoClubs, topDiscard, null, twoPenalty)).toBe(true);
  });

  test('Ace penalty can only be answered by another Ace', () => {
    const acePenalty: PenaltyState = { type: 'ace', cardsOwed: 5, active: true };
    const aceDiamonds: Card = { id: 'ad', rank: 'A', suit: 'diamonds' };
    const kingClubs: Card = { id: 'kc', rank: 'K', suit: 'clubs' };
    const jack: Card = { id: 'j', rank: 'J', suit: 'clubs' };

    expect(isLegalPlay(aceDiamonds, topDiscard, null, acePenalty)).toBe(true);
    expect(isLegalPlay(kingClubs, topDiscard, null, acePenalty)).toBe(false);
    expect(isLegalPlay(jack, topDiscard, null, acePenalty)).toBe(false);
  });

  test('Skip penalty can only be answered by an 8', () => {
    const skipPenalty: PenaltyState = { type: 'skip', cardsOwed: 0, active: true };
    const eightHearts: Card = { id: '8h', rank: '8', suit: 'hearts' };
    const nineClubs: Card = { id: '9c', rank: '9', suit: 'clubs' };
    const jack: Card = { id: 'j', rank: 'J', suit: 'clubs' };

    expect(isLegalPlay(eightHearts, topDiscard, null, skipPenalty)).toBe(true);
    expect(isLegalPlay(nineClubs, topDiscard, null, skipPenalty)).toBe(false);
    expect(isLegalPlay(jack, topDiscard, null, skipPenalty)).toBe(false);
  });

  test('getPlayableCards filters hand correctly', () => {
    const hand: Card[] = [
      { id: '1', rank: '4', suit: 'clubs' }, // valid (suit)
      { id: '2', rank: '9', suit: 'spades' }, // valid (rank)
      { id: '3', rank: 'J', suit: 'hearts' }, // valid (Jack wild)
      { id: '4', rank: 'K', suit: 'diamonds' }, // invalid
    ];

    const playable = getPlayableCards(hand, topDiscard, null, noPenalty);
    expect(playable.map(c => c.id)).toEqual(['1', '2', '3']);
  });
});
