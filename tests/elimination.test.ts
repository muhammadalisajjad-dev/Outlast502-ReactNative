import {
  ELIMINATION_THRESHOLD,
  evaluateEliminationAndWinner,
} from '../src/engine/elimination';
import {
  initMatch,
  initRound,
  executePlayCard,
  executeDrawCard,
  executeAcceptPenalty,
} from '../src/engine/gameEngine';
import { decideBotMove } from '../src/ai/botStrategy';
import { getPlayableCards } from '../src/engine/rules';
import { GameState, Player } from '../src/types/game';
import { Suit } from '../src/types/card';

/**
 * Match-completion audit.
 *
 * A two-seat match legitimately runs 5-17 rounds (median ~10), so an 11-round
 * match is not a stall. These tests pin the elimination semantics that decide
 * when a match actually ends, and prove the engine always terminates.
 */

function twoSeat(): Player[] {
  return initMatch(2, 'You').players;
}

function withScores(players: Player[], scores: [number, number]): Player[] {
  return players.map((p, i) => ({
    ...p,
    cumulativeScore: scores[i],
    lastRoundScore: 0,
    isEliminated: false,
    immuneThisRound: false,
  }));
}

describe('elimination threshold', () => {
  test('a non-winner crossing 502 is eliminated', () => {
    const players = withScores(twoSeat(), [490, 490]);
    const result = evaluateEliminationAndWinner(
      players,
      { player_0: 30, player_1: 30 },
      'player_0'
    );

    expect(ELIMINATION_THRESHOLD).toBe(502);
    expect(result.updatedPlayers[0].cumulativeScore).toBe(520);
    expect(result.updatedPlayers[0].isEliminated).toBe(false); // round winner
    expect(result.updatedPlayers[1].cumulativeScore).toBe(520);
    expect(result.updatedPlayers[1].isEliminated).toBe(true);
    expect(result.eliminatedThisRound).toEqual(['player_1']);
    expect(result.isMatchOver).toBe(true);
    expect(result.matchWinnerId).toBe('player_0');
  });

  test('a player just below the threshold survives', () => {
    const players = withScores(twoSeat(), [470, 470]);
    const result = evaluateEliminationAndWinner(
      players,
      { player_0: 30, player_1: 30 },
      'player_0'
    );

    expect(result.updatedPlayers[0].cumulativeScore).toBe(500);
    expect(result.updatedPlayers[0].isEliminated).toBe(false);
    expect(result.updatedPlayers[1].cumulativeScore).toBe(500);
    expect(result.updatedPlayers[1].isEliminated).toBe(false);
    expect(result.isMatchOver).toBe(false);
    expect(result.matchWinnerId).toBeNull();
  });
});

describe('winner immunity', () => {
  test('the round winner is immune even when crossing 502', () => {
    const players = withScores(twoSeat(), [480, 100]);
    const result = evaluateEliminationAndWinner(
      players,
      { player_0: 40, player_1: 5 },
      'player_0'
    );

    expect(result.updatedPlayers[0].cumulativeScore).toBe(520);
    expect(result.updatedPlayers[0].isEliminated).toBe(false);
    expect(result.updatedPlayers[0].immuneThisRound).toBe(true);
    expect(result.updatedPlayers[1].isEliminated).toBe(false);
    // Two players still active, so the match continues.
    expect(result.isMatchOver).toBe(false);
  });

  test('immunity is re-checked on the following round', () => {
    const players = withScores(twoSeat(), [520, 100]);
    const immune = players.map((p, i) =>
      i === 0 ? { ...p, immuneThisRound: true } : p
    );

    // initRound clears the one-round immunity flag.
    const restarted = initRound({
      ...initMatch(2, 'You'),
      players: immune,
      roundNumber: 4,
    });
    expect(restarted.players[0].immuneThisRound).toBe(false);

    // No longer the round winner, so 520 eliminates them.
    const result = evaluateEliminationAndWinner(
      restarted.players,
      { player_0: 0, player_1: 0 },
      'player_1'
    );
    expect(result.updatedPlayers[0].isEliminated).toBe(true);
    expect(result.updatedPlayers[0].immuneThisRound).toBe(false);
  });
});

describe('simultaneous eliminations and final winner', () => {
  test('when every active player crosses 502, the immune round winner takes the match', () => {
    const players = withScores(twoSeat(), [500, 490]);
    // Both cross 502 this round; player_0 wins the round.
    const result = evaluateEliminationAndWinner(
      players,
      { player_0: 30, player_1: 30 },
      'player_0'
    );

    // player_0: 530 and immune. player_1: 520 and eliminated.
    expect(result.updatedPlayers[0].cumulativeScore).toBe(530);
    expect(result.updatedPlayers[0].isEliminated).toBe(false);
    expect(result.updatedPlayers[1].cumulativeScore).toBe(520);
    expect(result.updatedPlayers[1].isEliminated).toBe(true);
    expect(result.isMatchOver).toBe(true);
    expect(result.matchWinnerId).toBe('player_0');
  });

  test('a three-seat match ends with the single surviving player', () => {
    const players = initMatch(3, 'You').players.map((p, i) => ({
      ...p,
      cumulativeScore: [520, 495, 600][i],
      isEliminated: i !== 1,
    }));

    const result = evaluateEliminationAndWinner(
      players,
      { player_0: 0, player_1: 0, player_2: 0 },
      'player_1'
    );

    expect(result.isMatchOver).toBe(true);
    expect(result.matchWinnerId).toBe('player_1');
  });

  test('there is no round cap: an 11-round match with both players below 502 continues', () => {
    const base = initMatch(2, 'You');
    const state: GameState = {
      ...base,
      roundNumber: 11,
      matchPhase: 'in_round',
      players: withScores(base.players, [200, 210]),
    };

    const result = evaluateEliminationAndWinner(
      state.players,
      { player_0: 0, player_1: 0 },
      'player_0'
    );

    expect(state.roundNumber).toBe(11);
    expect(result.isMatchOver).toBe(false);
    expect(result.matchWinnerId).toBeNull();
  });
});

describe('match termination through the real engine', () => {
  function pickJackSuit(state: GameState): Suit {
    const hand = state.players[state.activePlayerIndex].hand;
    const counts: Record<string, number> = {
      spades: 0,
      hearts: 0,
      diamonds: 0,
      clubs: 0,
    };
    hand.forEach(c => {
      if (c.rank !== 'J') counts[c.suit] += 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Suit;
  }

  function step(state: GameState): GameState {
    if (state.matchPhase === 'round_over') return initRound(state);

    const current = state.players[state.activePlayerIndex];

    if (current.isHuman) {
      if (state.pendingPenalty.active) {
        return executeAcceptPenalty(state, current.id);
      }
      const top = state.discardPile[state.discardPile.length - 1];
      const playable = top
        ? getPlayableCards(current.hand, top, state.declaredSuit, state.pendingPenalty)
        : [];
      if (playable.length > 0) {
        const card = playable[0];
        return executePlayCard(
          state,
          current.id,
          card.id,
          card.rank === 'J' ? pickJackSuit(state) : undefined
        );
      }
      return executeDrawCard(state, current.id);
    }

    const decision = decideBotMove(state, current);
    if (decision.type === 'PLAY_CARD') {
      return executePlayCard(state, current.id, decision.cardId, decision.declaredSuit);
    }
    if (decision.type === 'DRAW_CARD') {
      return executeDrawCard(state, current.id);
    }
    return executeAcceptPenalty(state, current.id);
  }

  test('every two-seat match terminates with exactly one winner', () => {
    const roundCounts: number[] = [];

    for (let i = 0; i < 30; i += 1) {
      let state = initMatch(2, 'You');
      let guard = 0;

      while (state.matchPhase !== 'match_over' && guard < 20000) {
        state = step(state);
        guard += 1;
      }

      expect(guard).toBeLessThan(20000);
      expect(state.matchPhase).toBe('match_over');
      expect(state.matchWinnerId).not.toBeNull();

      const survivors = state.players.filter(p => !p.isEliminated);
      expect(survivors).toHaveLength(1);
      expect(survivors[0].id).toBe(state.matchWinnerId);

      roundCounts.push(state.roundNumber);
    }

    // An 11-round match is ordinary, not an outlier.
    const max = Math.max(...roundCounts);
    expect(max).toBeGreaterThanOrEqual(11);
  });
});
