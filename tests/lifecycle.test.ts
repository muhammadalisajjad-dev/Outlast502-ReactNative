import {
  initMatch,
  executePlayCard,
  executeDrawCard,
  executeAcceptPenalty,
  initRound,
} from '../src/engine/gameEngine';
import { Card } from '../src/types/card';

describe('Game lifecycle integration tests', () => {
  test('Ace of Spades penalty passes at 5 and resolves after acceptance', () => {
    const state = initMatch(3, 'You');
    state.discardPile = [{ id: 'top', rank: '5', suit: 'spades' }];
    const aceSpades: Card = { id: 'as', rank: 'A', suit: 'spades' };
    const aceHearts: Card = { id: 'ah', rank: 'A', suit: 'hearts' };
    state.players[0].hand[0] = aceSpades;
    state.players[1].hand[0] = aceHearts;

    const afterAce = executePlayCard(state, 'player_0', 'as');
    expect(afterAce.pendingPenalty).toMatchObject({ active: true, type: 'ace', cardsOwed: 5 });
    expect(afterAce.activePlayerIndex).toBe(1);

    const afterPass = executePlayCard(afterAce, 'player_1', 'ah');
    expect(afterPass.pendingPenalty).toMatchObject({ active: true, type: 'ace', cardsOwed: 5 });
    expect(afterPass.activePlayerIndex).toBe(2);

    const before = afterPass.players[2].hand.length;
    const accepted = executeAcceptPenalty(afterPass, 'player_2');
    expect(accepted.players[2].hand).toHaveLength(before + 5);
    expect(accepted.pendingPenalty.active).toBe(false);
  });

  test('Eight skip passes with another eight and skips a player without drawing', () => {
    const state = initMatch(3, 'You');
    state.discardPile = [{ id: 'top', rank: '5', suit: 'clubs' }];
    const eight1: Card = { id: '8a', rank: '8', suit: 'clubs' };
    const eight2: Card = { id: '8b', rank: '8', suit: 'hearts' };
    state.players[0].hand[0] = eight1;
    state.players[1].hand[0] = eight2;

    const afterFirst = executePlayCard(state, 'player_0', '8a');
    expect(afterFirst.pendingPenalty).toMatchObject({ active: true, type: 'skip' });
    expect(afterFirst.activePlayerIndex).toBe(1);

    const afterCounter = executePlayCard(afterFirst, 'player_1', '8b');
    expect(afterCounter.pendingPenalty).toMatchObject({ active: true, type: 'skip' });
    expect(afterCounter.activePlayerIndex).toBe(2);

    const skippedHandBefore = afterCounter.players[2].hand.length;
    const accepted = executeAcceptPenalty(afterCounter, 'player_2');
    expect(accepted.players[2].hand).toHaveLength(skippedHandBefore);
    expect(accepted.activePlayerIndex).toBe(0);
  });

  test('Seven of hearts immediately ends the round', () => {
    const state = initMatch(3, 'You');
    state.discardPile = [{ id: 'top', rank: '5', suit: 'clubs' }];
    const sevenHearts: Card = { id: '7h', rank: '7', suit: 'hearts' };
    state.players[0].hand = [sevenHearts];

    const result = executePlayCard(state, 'player_0', '7h');
    expect(result.matchPhase).toBe('round_over');
    expect(result.roundResults).toHaveLength(1);
    expect(result.roundResults[0].winnerId).toBe('player_0');
    expect(result.roundResults[0].winReason).toBe('seven_of_hearts');
  });

  test('normal draw recycles the discard pile when the draw pile is empty', () => {
    const state = initMatch(3, 'You');
    state.drawPile = [];
    state.discardPile = [
      { id: 'top', rank: '9', suit: 'clubs' },
      { id: 'a', rank: '4', suit: 'clubs' },
      { id: 'b', rank: '6', suit: 'diamonds' },
    ];

    const result = executeDrawCard(state, 'player_0');
    expect(result.players[0].hand).toHaveLength(8);
    expect(result.discardPile).toHaveLength(1);
    expect(result.drawPile.length).toBeGreaterThan(0);
  });

  test('initRound starts a new round without resetting cumulative scores', () => {
    const state = initMatch(3, 'You');
    state.players[0].cumulativeScore = 120;
    state.players[1].cumulativeScore = 40;
    const next = initRound(state);
    expect(next.roundNumber).toBe(2);
    expect(next.matchPhase).toBe('in_round');
    expect(next.players[0].cumulativeScore).toBe(120);
    expect(next.players[1].cumulativeScore).toBe(40);
    expect(next.players[0].hand).toHaveLength(7);
  });
});