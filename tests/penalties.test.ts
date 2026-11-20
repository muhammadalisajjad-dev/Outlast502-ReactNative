import {
  calculateNextPenaltyState,
  INITIAL_PENALTY_STATE,
} from '../src/engine/penalties';
import { Card } from '../src/types/card';
import { PenaltyState } from '../src/types/game';

describe('Penalty Engine Tests', () => {
  test('playing a 2 initiates a 2-card penalty', () => {
    const card: Card = { id: '2c', rank: '2', suit: 'clubs' };
    const next = calculateNextPenaltyState(card, INITIAL_PENALTY_STATE);

    expect(next.active).toBe(true);
    expect(next.type).toBe('two');
    expect(next.cardsOwed).toBe(2);
  });

  test('playing another 2 stacks penalty (+2 each time)', () => {
    const card: Card = { id: '2h', rank: '2', suit: 'hearts' };
    const pendingTwo: PenaltyState = { active: true, type: 'two', cardsOwed: 2 };

    const next = calculateNextPenaltyState(card, pendingTwo);
    expect(next.cardsOwed).toBe(4);

    const nextThird = calculateNextPenaltyState(card, next);
    expect(nextThird.cardsOwed).toBe(6);

    const nextFourth = calculateNextPenaltyState(card, nextThird);
    expect(nextFourth.cardsOwed).toBe(8);
  });

  test('playing Ace of Spades initiates a 5-card penalty', () => {
    const aceSpades: Card = { id: 'as', rank: 'A', suit: 'spades' };
    const next = calculateNextPenaltyState(aceSpades, INITIAL_PENALTY_STATE);

    expect(next.active).toBe(true);
    expect(next.type).toBe('ace');
    expect(next.cardsOwed).toBe(5);
  });

  test('passing Ace of Spades penalty with any Ace keeps penalty at 5 (never increases)', () => {
    const aceDiamonds: Card = { id: 'ad', rank: 'A', suit: 'diamonds' };
    const pendingAce: PenaltyState = { active: true, type: 'ace', cardsOwed: 5 };

    const next = calculateNextPenaltyState(aceDiamonds, pendingAce);
    expect(next.active).toBe(true);
    expect(next.type).toBe('ace');
    expect(next.cardsOwed).toBe(5); // Remained 5!
  });

  test('playing other Aces on normal turns does NOT trigger penalty', () => {
    const aceHearts: Card = { id: 'ah', rank: 'A', suit: 'hearts' };
    const next = calculateNextPenaltyState(aceHearts, INITIAL_PENALTY_STATE);

    expect(next.active).toBe(false);
    expect(next.type).toBeNull();
    expect(next.cardsOwed).toBe(0);
  });

  test('playing an 8 initiates or passes a skip penalty', () => {
    const eight: Card = { id: '8s', rank: '8', suit: 'spades' };
    const next = calculateNextPenaltyState(eight, INITIAL_PENALTY_STATE);

    expect(next.active).toBe(true);
    expect(next.type).toBe('skip');
    expect(next.cardsOwed).toBe(0);

    // Countering with another 8 passes skip
    const nextCounter = calculateNextPenaltyState(eight, next);
    expect(nextCounter.active).toBe(true);
    expect(nextCounter.type).toBe('skip');
  });

  test('playing a non-special card clears penalty state', () => {
    const normalCard: Card = { id: '5h', rank: '5', suit: 'hearts' };
    const next = calculateNextPenaltyState(normalCard, INITIAL_PENALTY_STATE);

    expect(next.active).toBe(false);
    expect(next.type).toBeNull();
    expect(next.cardsOwed).toBe(0);
  });
});
