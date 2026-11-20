import {
  calculateCardPoints,
  calculateHandPoints,
  calculateRoundScores,
} from '../src/engine/scoring';
import { Card } from '../src/types/card';
import { Player } from '../src/types/game';

describe('Scoring Engine Tests', () => {
  test('exact point values match official 502 scoring table', () => {
    // 100 points
    expect(calculateCardPoints({ id: '1', rank: '7', suit: 'hearts' })).toBe(100);
    expect(calculateCardPoints({ id: '2', rank: 'A', suit: 'spades' })).toBe(100);

    // 30 points
    expect(calculateCardPoints({ id: '3', rank: '2', suit: 'hearts' })).toBe(30);
    expect(calculateCardPoints({ id: '4', rank: '2', suit: 'spades' })).toBe(30);
    expect(calculateCardPoints({ id: '5', rank: '8', suit: 'clubs' })).toBe(30);
    expect(calculateCardPoints({ id: '6', rank: 'J', suit: 'diamonds' })).toBe(30);

    // 20 points: A♥, A♦, A♣
    expect(calculateCardPoints({ id: '7', rank: 'A', suit: 'hearts' })).toBe(20);
    expect(calculateCardPoints({ id: '8', rank: 'A', suit: 'diamonds' })).toBe(20);
    expect(calculateCardPoints({ id: '9', rank: 'A', suit: 'clubs' })).toBe(20);

    // 10 points: 10, Q, K
    expect(calculateCardPoints({ id: '10', rank: '10', suit: 'spades' })).toBe(10);
    expect(calculateCardPoints({ id: '11', rank: 'Q', suit: 'hearts' })).toBe(10);
    expect(calculateCardPoints({ id: '12', rank: 'K', suit: 'clubs' })).toBe(10);

    // 5 points: 3, 4, 5, 6, 9, other 7s (7♠, 7♦, 7♣)
    expect(calculateCardPoints({ id: '13', rank: '3', suit: 'diamonds' })).toBe(5);
    expect(calculateCardPoints({ id: '14', rank: '4', suit: 'spades' })).toBe(5);
    expect(calculateCardPoints({ id: '15', rank: '5', suit: 'clubs' })).toBe(5);
    expect(calculateCardPoints({ id: '16', rank: '6', suit: 'hearts' })).toBe(5);
    expect(calculateCardPoints({ id: '17', rank: '9', suit: 'diamonds' })).toBe(5);
    expect(calculateCardPoints({ id: '18', rank: '7', suit: 'spades' })).toBe(5);
    expect(calculateCardPoints({ id: '19', rank: '7', suit: 'diamonds' })).toBe(5);
    expect(calculateCardPoints({ id: '20', rank: '7', suit: 'clubs' })).toBe(5);
  });

  test('calculateHandPoints matches official example (A♠ + J♦ + 4♣ = 135 pts)', () => {
    // Official example from rules page:
    // "Ace of Spades (100), Jack of Diamonds (30), 4 of Clubs (5) = 135 points"
    const hand: Card[] = [
      { id: '1', rank: 'A', suit: 'spades' },
      { id: '2', rank: 'J', suit: 'diamonds' },
      { id: '3', rank: '4', suit: 'clubs' },
    ];
    expect(calculateHandPoints(hand)).toBe(135);
  });

  test('empty hand round winner scores exactly 0 points', () => {
    const players: Player[] = [
      {
        id: 'p1',
        name: 'Alice',
        isHuman: true,
        hand: [], // Emptied hand!
        cumulativeScore: 0,
        lastRoundScore: 0,
        isEliminated: false,
        immuneThisRound: false,
        avatarSeed: 1,
      },
      {
        id: 'p2',
        name: 'Bob',
        isHuman: false,
        hand: [{ id: 'b1', rank: 'K', suit: 'spades' }], // 10 pts
        cumulativeScore: 0,
        lastRoundScore: 0,
        isEliminated: false,
        immuneThisRound: false,
        avatarSeed: 2,
      },
    ];

    const scores = calculateRoundScores(players, 'p1', 'empty_hand');
    expect(scores['p1']).toBe(0);
    expect(scores['p2']).toBe(10);
  });

  test('7 of Hearts round winner counts remaining cards in hand', () => {
    const players: Player[] = [
      {
        id: 'p1',
        name: 'Alice',
        isHuman: true,
        hand: [
          { id: 'a1', rank: '3', suit: 'hearts' }, // 5 pts
          { id: 'a2', rank: '4', suit: 'clubs' }, // 5 pts
        ], // Winner with 2 cards left!
        cumulativeScore: 0,
        lastRoundScore: 0,
        isEliminated: false,
        immuneThisRound: false,
        avatarSeed: 1,
      },
      {
        id: 'p2',
        name: 'Bob',
        isHuman: false,
        hand: [{ id: 'b1', rank: '2', suit: 'spades' }], // 30 pts
        cumulativeScore: 0,
        lastRoundScore: 0,
        isEliminated: false,
        immuneThisRound: false,
        avatarSeed: 2,
      },
    ];

    const scores = calculateRoundScores(players, 'p1', 'seven_of_hearts');
    expect(scores['p1']).toBe(10); // 5 + 5
    expect(scores['p2']).toBe(30);
  });
});
