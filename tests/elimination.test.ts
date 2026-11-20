import { evaluateEliminationAndWinner } from '../src/engine/elimination';
import { Player } from '../src/types/game';

describe('Elimination & Match Completion Tests', () => {
  function makePlayer(id: string, name: string, cumulative: number, isEliminated: boolean = false): Player {
    return {
      id,
      name,
      isHuman: id === 'p1',
      hand: [],
      cumulativeScore: cumulative,
      lastRoundScore: 0,
      isEliminated,
      immuneThisRound: false,
      avatarSeed: 1,
    };
  }

  test('player reaching 502 or more is eliminated', () => {
    const players = [
      makePlayer('p1', 'Alice', 480),
      makePlayer('p2', 'Bob', 490),
    ];
    const roundScores = { p1: 10, p2: 25 }; // p1 -> 490, p2 -> 515 (eliminated)

    const result = evaluateEliminationAndWinner(players, roundScores, 'p1');
    expect(result.eliminatedThisRound).toEqual(['p2']);

    const bob = result.updatedPlayers.find(p => p.id === 'p2')!;
    expect(bob.isEliminated).toBe(true);
    expect(bob.cumulativeScore).toBe(515);

    // Only Alice remains -> Alice wins match
    expect(result.isMatchOver).toBe(true);
    expect(result.matchWinnerId).toBe('p1');
  });

  test('round winner is IMMUNE from elimination in this round even if >= 502', () => {
    // Scenario: Alice had 490 points, plays 7♥ to win, but her remaining cards score 25 points -> total 515
    const players = [
      makePlayer('p1', 'Alice', 490),
      makePlayer('p2', 'Bob', 200),
    ];
    const roundScores = { p1: 25, p2: 50 };

    const result = evaluateEliminationAndWinner(players, roundScores, 'p1'); // Alice is winner!
    expect(result.eliminatedThisRound).toEqual([]); // Nobody eliminated!

    const alice = result.updatedPlayers.find(p => p.id === 'p1')!;
    expect(alice.isEliminated).toBe(false);
    expect(alice.immuneThisRound).toBe(true);
    expect(alice.cumulativeScore).toBe(515);

    expect(result.isMatchOver).toBe(false);
  });

  test('multiple players can be eliminated simultaneously', () => {
    const players = [
      makePlayer('p1', 'Alice', 300),
      makePlayer('p2', 'Bob', 490),
      makePlayer('p3', 'Charlie', 495),
    ];
    const roundScores = { p1: 0, p2: 30, p3: 20 }; // Bob -> 520, Charlie -> 515

    const result = evaluateEliminationAndWinner(players, roundScores, 'p1');
    expect(result.eliminatedThisRound).toContain('p2');
    expect(result.eliminatedThisRound).toContain('p3');

    expect(result.isMatchOver).toBe(true);
    expect(result.matchWinnerId).toBe('p1');
  });

  test('simultaneous elimination tie-break: lowest cumulative total wins if all cross 502', () => {
    const players = [
      makePlayer('p1', 'Alice', 490),
      makePlayer('p2', 'Bob', 495),
    ];
    // Suppose both cross 502 in the same round, and neither is the round winner (or both crossed)
    // Alice gets 20 -> 510; Bob gets 30 -> 525
    const roundScores = { p1: 20, p2: 30 };

    const result = evaluateEliminationAndWinner(players, roundScores, 'other');
    expect(result.isMatchOver).toBe(true);
    // Alice has 510, Bob has 525 -> Alice wins with lowest total!
    expect(result.matchWinnerId).toBe('p1');
  });
});
