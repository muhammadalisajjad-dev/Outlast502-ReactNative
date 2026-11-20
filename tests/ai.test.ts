import { decideBotMove, chooseBestJackSuit } from '../src/ai/botStrategy';
import { Card } from '../src/types/card';
import { GameState, Player } from '../src/types/game';
import { INITIAL_PENALTY_STATE } from '../src/engine/penalties';

describe('Bot Strategy AI Tests', () => {
  function createTestState(
    topDiscard: Card,
    botHand: Card[],
    pendingPenalty = INITIAL_PENALTY_STATE
  ): { state: GameState; bot: Player } {
    const bot: Player = {
      id: 'bot_1',
      name: 'Marcus',
      isHuman: false,
      hand: botHand,
      cumulativeScore: 100,
      lastRoundScore: 0,
      isEliminated: false,
      immuneThisRound: false,
      avatarSeed: 2,
    };

    const state: GameState = {
      matchPhase: 'in_round',
      roundNumber: 1,
      players: [bot],
      activePlayerIndex: 0,
      drawPile: [],
      discardPile: [topDiscard],
      declaredSuit: null,
      pendingPenalty,
      roundResults: [],
      matchWinnerId: null,
      logs: [],
    };

    return { state, bot };
  }

  test('bot answers pending 2 with a 2 if available', () => {
    const topCard: Card = { id: 'top', rank: '2', suit: 'clubs' };
    const botHand: Card[] = [
      { id: '2_h', rank: '2', suit: 'hearts' },
      { id: '5_c', rank: '5', suit: 'clubs' },
    ];
    const { state, bot } = createTestState(topCard, botHand, {
      active: true,
      type: 'two',
      cardsOwed: 2,
    });

    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('PLAY_CARD');
    if (decision.type === 'PLAY_CARD') {
      expect(decision.cardId).toBe('2_h');
    }
  });

  test('bot accepts penalty when it has no counter 2', () => {
    const topCard: Card = { id: 'top', rank: '2', suit: 'clubs' };
    const botHand: Card[] = [
      { id: '5_c', rank: '5', suit: 'clubs' },
      { id: 'K_d', rank: 'K', suit: 'diamonds' },
    ];
    const { state, bot } = createTestState(topCard, botHand, {
      active: true,
      type: 'two',
      cardsOwed: 4,
    });

    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('ACCEPT_PENALTY');
  });

  test('bot answers pending Ace with another Ace', () => {
    const topCard: Card = { id: 'top', rank: 'A', suit: 'spades' };
    const botHand: Card[] = [
      { id: 'a_h', rank: 'A', suit: 'hearts' },
      { id: '9_s', rank: '9', suit: 'spades' },
    ];
    const { state, bot } = createTestState(topCard, botHand, {
      active: true,
      type: 'ace',
      cardsOwed: 5,
    });

    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('PLAY_CARD');
    if (decision.type === 'PLAY_CARD') {
      expect(decision.cardId).toBe('a_h');
    }
  });

  test('bot draws card when no playable cards exist', () => {
    const topCard: Card = { id: 'top', rank: '3', suit: 'clubs' };
    const botHand: Card[] = [
      { id: '5_h', rank: '5', suit: 'hearts' },
      { id: 'K_d', rank: 'K', suit: 'diamonds' },
    ];
    const { state, bot } = createTestState(topCard, botHand);

    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('DRAW_CARD');
  });

  test('bot playing Jack selects suit with the highest count in hand', () => {
    const hand: Card[] = [
      { id: 'j_c', rank: 'J', suit: 'clubs' },
      { id: '4_h', rank: '4', suit: 'hearts' },
      { id: '6_h', rank: '6', suit: 'hearts' },
      { id: '9_h', rank: '9', suit: 'hearts' },
      { id: '2_s', rank: '2', suit: 'spades' },
    ];

    const bestSuit = chooseBestJackSuit(hand, 'j_c');
    expect(bestSuit).toBe('hearts'); // 3 hearts
  });
});
