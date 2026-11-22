import { initMatch } from '../src/engine/gameEngine';
import { decideBotMove } from '../src/ai/botStrategy';
import { botThinkDelay } from '../src/ai/botTiming';
import { GameState, Player } from '../src/types/game';
import { Card, Suit, Rank } from '../src/types/card';

const makeCard = (suit: Suit, rank: Rank): Card => ({ id: `${suit}_${rank}`, suit, rank });

function stateWithBotHand(hand: Card[]): { state: GameState; bot: Player } {
  const base = initMatch(2, 'You');
  const bot: Player = { ...base.players[1], hand };
  const state: GameState = {
    ...base,
    players: [base.players[0], bot],
    activePlayerIndex: 1,
    discardPile: [makeCard('spades', '5')],
    declaredSuit: null,
    pendingPenalty: { type: null, cardsOwed: 0, active: false },
  };
  return { state, bot };
}

describe('bot thinking time', () => {
  test('forced moves resolve quickly', () => {
    const { state, bot } = stateWithBotHand([makeCard('hearts', 'K')]);
    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('DRAW_CARD');
    expect(botThinkDelay(decision, state, bot)).toBe(300);
  });

  test('a single legal card is a foregone conclusion', () => {
    const { state, bot } = stateWithBotHand([
      makeCard('spades', '6'),
      makeCard('hearts', 'K'),
    ]);
    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('PLAY_CARD');
    expect(botThinkDelay(decision, state, bot)).toBe(340);
  });

  test('choosing between several cards takes the longest regular pause', () => {
    const { state, bot } = stateWithBotHand([
      makeCard('spades', '6'),
      makeCard('spades', '9'),
      makeCard('hearts', 'K'),
    ]);
    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('PLAY_CARD');
    expect(botThinkDelay(decision, state, bot)).toBe(520);
  });

  test('weighing an instant-win 7♥ is the only extended pause', () => {
    const { state, bot } = stateWithBotHand([makeCard('hearts', '7')]);
    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('PLAY_CARD');
    if (decision.type !== 'PLAY_CARD') throw new Error('expected play');
    expect(decision.cardId).toBe('hearts_7');
    expect(botThinkDelay(decision, state, bot)).toBe(620);
  });

  test('accepting a penalty is immediate', () => {
    const { state, bot } = stateWithBotHand([makeCard('hearts', 'K')]);
    const decision = decideBotMove(state, bot);
    expect(decision.type).toBe('DRAW_CARD');
    expect(botThinkDelay(decision, state, bot)).toBeLessThanOrEqual(300);
  });

  test('no pause is longer than the old fixed 900ms timer', () => {
    const hands: Card[][] = [
      [makeCard('hearts', 'K')],
      [makeCard('spades', '6')],
      [makeCard('spades', '6'), makeCard('spades', '9')],
      [makeCard('hearts', '7')],
    ];

    hands.forEach(hand => {
      const { state, bot } = stateWithBotHand(hand);
      const delay = botThinkDelay(decideBotMove(state, bot), state, bot);
      expect(delay).toBeLessThan(900);
      expect(delay).toBeGreaterThan(0);
    });
  });
});
