import {
  initMatch,
  executePlayCard,
  executeDrawCard,
  executeAcceptPenalty,
  initRound,
} from '../src/engine/gameEngine';
import { Card } from '../src/types/card';
import { GameState } from '../src/types/game';

describe('Game Engine State Transition Tests', () => {
  test('initMatch deals 7 cards to each player and starts on neutral card', () => {
    const state = initMatch(3, 'TestUser');
    expect(state.players).toHaveLength(3);
    expect(state.roundNumber).toBe(1);
    expect(state.matchPhase).toBe('in_round');

    for (const player of state.players) {
      expect(player.hand).toHaveLength(7);
      expect(player.cumulativeScore).toBe(0);
    }

    expect(state.discardPile).toHaveLength(1);
    const topCard = state.discardPile[0];
    // Must be neutral per published written rule!
    expect(topCard.rank).not.toBe('2');
    expect(topCard.rank).not.toBe('J');
    expect(topCard.rank).not.toBe('A');
    expect(!(topCard.rank === '7' && topCard.suit === 'hearts')).toBe(true);

    // Human player 0 starts round 1
    expect(state.activePlayerIndex).toBe(0);
  });

  test('normal card play removes card, updates discard, and advances turn clockwise', () => {
    let state = initMatch(3, 'TestUser');
    const topCard = state.discardPile[0];

    // Give player 0 a matching card
    const matchingCard: Card = { id: 'match_1', rank: topCard.rank, suit: 'hearts' };
    state.players[0].hand[0] = matchingCard;

    state = executePlayCard(state, 'player_0', 'match_1');
    expect(state.discardPile[state.discardPile.length - 1].id).toBe('match_1');
    expect(state.players[0].hand).toHaveLength(6);
    expect(state.activePlayerIndex).toBe(1); // Clockwise to player 1
  });

  test('drawing ends turn immediately (cannot play on same turn)', () => {
    let state = initMatch(3, 'TestUser');
    const initialHandSize = state.players[0].hand.length;

    state = executeDrawCard(state, 'player_0');
    expect(state.players[0].hand).toHaveLength(initialHandSize + 1);
    expect(state.activePlayerIndex).toBe(1); // Turn passed immediately
  });

  test('Jack play demands suit and applies to next player', () => {
    let state = initMatch(3, 'TestUser');
    const jack: Card = { id: 'jack_test', rank: 'J', suit: 'spades' };
    state.players[0].hand[0] = jack;

    state = executePlayCard(state, 'player_0', 'jack_test', 'diamonds');
    expect(state.declaredSuit).toBe('diamonds');
    expect(state.activePlayerIndex).toBe(1);
  });

  test('2-card penalty stacking and forced accept', () => {
    let state = initMatch(3, 'TestUser');
    state.discardPile = [{ id: 'top_c', rank: '5', suit: 'clubs' }];
    const two1: Card = { id: '2_1', rank: '2', suit: 'clubs' };
    const two2: Card = { id: '2_2', rank: '2', suit: 'diamonds' };

    state.players[0].hand[0] = two1;
    state.players[1].hand[0] = two2;

    // Player 0 plays 2
    state = executePlayCard(state, 'player_0', '2_1');
    expect(state.pendingPenalty.active).toBe(true);
    expect(state.pendingPenalty.type).toBe('two');
    expect(state.pendingPenalty.cardsOwed).toBe(2);
    expect(state.activePlayerIndex).toBe(1);

    // Player 1 stacks another 2
    state = executePlayCard(state, 'player_1', '2_2');
    expect(state.pendingPenalty.cardsOwed).toBe(4);
    expect(state.activePlayerIndex).toBe(2);

    // Player 2 has no 2 and accepts penalty
    const p2HandBefore = state.players[2].hand.length;
    state = executeAcceptPenalty(state, 'player_2');
    expect(state.players[2].hand).toHaveLength(p2HandBefore + 4);
    expect(state.pendingPenalty.active).toBe(false);
    expect(state.activePlayerIndex).toBe(0); // Advances clockwise to 0
  });

  test('SPECIAL EXCEPTION: Last card is a 2 -> next player forced to draw 2 before scoring without answering', () => {
    let state = initMatch(3, 'TestUser');
    // Set player 0 hand to single card: 2 of Spades
    const lastTwo: Card = { id: 'last_2', rank: '2', suit: 'spades' };
    state.players[0].hand = [lastTwo];
    state.discardPile = [{ id: 'top_s', rank: '5', suit: 'spades' }];

    const p1HandBefore = state.players[1].hand.length;

    state = executePlayCard(state, 'player_0', 'last_2');

    // Round should be OVER
    expect(state.matchPhase).toBe('round_over');
    expect(state.roundResults).toHaveLength(1);
    const result = state.roundResults[0];
    expect(result.winnerId).toBe('player_0');
    expect(result.winReason).toBe('empty_hand');

    // Player 1 was forced to draw 2 cards!
    expect(result.forcedPenaltyPlayerId).toBe('player_1');
    expect(result.forcedPenaltyCards).toBe(2);
    expect(state.players[1].hand).toHaveLength(p1HandBefore + 2);
  });

  test('SPECIAL EXCEPTION: Last card is Ace of Spades -> next player forced to draw 5 before scoring', () => {
    let state = initMatch(3, 'TestUser');
    const lastAceSpades: Card = { id: 'last_as', rank: 'A', suit: 'spades' };
    state.players[0].hand = [lastAceSpades];
    state.discardPile = [{ id: 'top_s', rank: '9', suit: 'spades' }];

    const p1HandBefore = state.players[1].hand.length;

    state = executePlayCard(state, 'player_0', 'last_as');

    expect(state.matchPhase).toBe('round_over');
    const result = state.roundResults[0];
    expect(result.winnerId).toBe('player_0');
    expect(result.forcedPenaltyPlayerId).toBe('player_1');
    expect(result.forcedPenaltyCards).toBe(5);
    expect(state.players[1].hand).toHaveLength(p1HandBefore + 5);
  });

  test('7 of Hearts played instantly wins the round and counts remaining hand', () => {
    let state = initMatch(3, 'TestUser');
    const sevenHearts: Card = { id: '7_h', rank: '7', suit: 'hearts' };
    const remainingCard: Card = { id: '3_d', rank: '3', suit: 'diamonds' }; // 5 pts

    state.players[0].hand = [sevenHearts, remainingCard];

    state = executePlayCard(state, 'player_0', '7_h');
    expect(state.matchPhase).toBe('round_over');

    const result = state.roundResults[0];
    expect(result.winnerId).toBe('player_0');
    expect(result.winReason).toBe('seven_of_hearts');
    expect(result.playerRoundScores['player_0']).toBe(5); // Remainder counted!
  });

  test('8 skip chain skips player and passes turn', () => {
    let state = initMatch(3, 'TestUser');
    const eight1: Card = { id: '8_1', rank: '8', suit: 'spades' };
    state.players[0].hand[0] = eight1;
    state.discardPile = [{ id: 'top', rank: '3', suit: 'spades' }];

    // Player 0 plays 8
    state = executePlayCard(state, 'player_0', '8_1');
    expect(state.pendingPenalty.type).toBe('skip');
    expect(state.activePlayerIndex).toBe(1);

    // Player 1 accepts skip
    const p1HandCount = state.players[1].hand.length;
    state = executeAcceptPenalty(state, 'player_1');
    expect(state.players[1].hand).toHaveLength(p1HandCount); // Drew 0 cards!
    expect(state.activePlayerIndex).toBe(2); // Passed to player 2
  });

  test('next round starting player is the previous round winner', () => {
    let state = initMatch(3, 'TestUser');
    // Player 1 wins round 1
    state.roundResults.push({
      roundNumber: 1,
      winnerId: 'player_1',
      winnerName: 'Marcus',
      winReason: 'empty_hand',
      playerRoundScores: { player_0: 20, player_1: 0, player_2: 30 },
      eliminatedPlayerIds: [],
    });
    state.matchPhase = 'round_over';

    const nextRoundState = initRound(state);
    expect(nextRoundState.roundNumber).toBe(2);
    // Player 1 was the previous winner, so player 1 starts!
    expect(nextRoundState.activePlayerIndex).toBe(1);
  });
});
