import {
  initMatch,
  initRound,
  executePlayCard,
  executeDrawCard,
  executeAcceptPenalty,
} from '../src/engine/gameEngine';
import { decideBotMove } from '../src/ai/botStrategy';
import { getPlayableCards } from '../src/engine/rules';
import { Suit } from '../src/types/card';
import { buildMatchDocument } from '../src/services/firebase';
import { MatchRecord, PlayerHistoryScore } from '../src/types/history';
import { GameState } from '../src/types/game';

/**
 * Plays a complete match through the real engine, with the human seat using a
 * legal but passive strategy (always draw / accept penalty) and every bot seat
 * using the real bot strategy. This proves the full lifecycle terminates and
 * that the resulting MatchRecord satisfies the Firestore rules.
 */

function pickJackSuit(state: GameState): Suit {
  const hand = state.players[state.activePlayerIndex].hand;
  const counts: Record<string, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 };
  hand.forEach(c => {
    if (c.rank !== 'J') counts[c.suit] += 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Suit;
}

function step(state: GameState): GameState {
  if (state.matchPhase === 'round_over') {
    return initRound(state);
  }

  const current = state.players[state.activePlayerIndex];

  if (current.isHuman) {
    // Always accept a pending penalty (adds cards and score quickly), then
    // play the first legal card, otherwise draw. This terminates because the
    // human still sheds cards whenever no penalty is pending.
    if (state.pendingPenalty.active) {
      return executeAcceptPenalty(state, current.id);
    }

    const top = state.discardPile[state.discardPile.length - 1];
    const playable = top
      ? getPlayableCards(current.hand, top, state.declaredSuit, state.pendingPenalty)
      : [];

    if (playable.length > 0) {
      const card = playable[0];
      const suit = card.rank === 'J' ? pickJackSuit(state) : undefined;
      return executePlayCard(state, current.id, card.id, suit);
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

function playToMatchEnd(playerCount: number): GameState {
  let state = initMatch(playerCount, 'You');
  let guard = 0;

  while (state.matchPhase !== 'match_over' && guard < 20000) {
    state = step(state);
    guard += 1;
  }

  expect(guard).toBeLessThan(20000);
  if (process.env.MATCH_STATS) {
    console.log(
      `[match-stats] seats=${playerCount} steps=${guard} rounds=${state.roundNumber} scores=` +
        state.players.map(p => `${p.name}:${p.cumulativeScore}${p.isEliminated ? 'x' : ''}`).join(',')
    );
  }
  return state;
}

function toRecord(state: GameState): MatchRecord {
  const winner = state.players.find(p => p.id === state.matchWinnerId);
  const players: PlayerHistoryScore[] = state.players.map(p => ({
    playerId: p.id,
    name: p.name,
    isHuman: p.isHuman,
    finalScore: p.cumulativeScore,
    isEliminated: p.isEliminated,
    isWinner: p.id === state.matchWinnerId,
  }));

  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    totalRounds: state.roundNumber,
    playerCount: state.players.length,
    winnerName: winner ? winner.name : 'Unknown',
    players,
  };
}

describe('Full match lifecycle through the real engine', () => {
  test('a two-seat match plays to match_over with a single surviving winner', () => {
    const final = playToMatchEnd(2);

    expect(final.matchPhase).toBe('match_over');
    expect(final.matchWinnerId).not.toBeNull();

    const survivors = final.players.filter(p => !p.isEliminated);
    expect(survivors).toHaveLength(1);
    expect(survivors[0].id).toBe(final.matchWinnerId);

    // The eliminated seat must have crossed the 502 threshold.
    const eliminated = final.players.filter(p => p.isEliminated);
    expect(eliminated.length).toBeGreaterThanOrEqual(1);
    eliminated.forEach(p => expect(p.cumulativeScore).toBeGreaterThanOrEqual(502));

    // The match winner survives. They may legally finish at or above 502 when
    // they won the final round (winner immunity), per docs/RULES_SPEC.md.
    expect(survivors[0].cumulativeScore < 502 || survivors[0].immuneThisRound).toBe(true);

    // At least one completed round was scored.
    expect(final.roundResults.length).toBeGreaterThanOrEqual(1);
    expect(final.roundNumber).toBeGreaterThanOrEqual(2);
  });

  test('the completed match produces a record that satisfies the Firestore rules', () => {
    const final = playToMatchEnd(2);
    const record = toRecord(final);
    const doc = buildMatchDocument(record, 'test-uid', Date.now());

    expect(typeof doc.id).toBe('string');
    expect(doc.id).toBe(record.id);
    expect(typeof doc.timestamp).toBe('number');
    expect(Number.isInteger(doc.totalRounds)).toBe(true);
    expect(doc.totalRounds).toBeGreaterThanOrEqual(1);
    expect(doc.totalRounds).toBeLessThanOrEqual(1000);
    expect(Number.isInteger(doc.playerCount)).toBe(true);
    expect(doc.playerCount).toBe(2);
    expect(doc.players).toHaveLength(2);
    expect(doc.winnerName.length).toBeGreaterThan(0);
    expect(doc.winnerName.length).toBeLessThanOrEqual(64);
    expect(doc.userId).toBe('test-uid');
    expect(typeof doc.syncedAt).toBe('number');
  });

  test('every supported seat count can reach match_over', () => {
    for (let seats = 2; seats <= 6; seats += 1) {
      const final = playToMatchEnd(seats);
      expect(final.matchPhase).toBe('match_over');
      expect(final.players.filter(p => !p.isEliminated)).toHaveLength(1);
      expect(final.matchWinnerId).toBe(
        final.players.find(p => !p.isEliminated)!.id
      );
    }
  });
});
