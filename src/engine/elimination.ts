import { Player } from '../types/game';

export const ELIMINATION_THRESHOLD = 502;

export interface EliminationEvaluationResult {
  updatedPlayers: Player[];
  eliminatedThisRound: string[];
  isMatchOver: boolean;
  matchWinnerId: string | null;
}

/**
 * Evaluates elimination status and match outcome after round scores are tallied.
 *
 * Rules:
 * 1. Points are added to each player's cumulative score.
 * 2. Any player whose total reaches or exceeds 502 is eliminated.
 * 3. EXCEPTION: The round winner is IMMUNE from elimination in this round,
 *    even if a 7♥ win pushed their score to 502 or higher.
 *    (Their immunity is re-checked after subsequent rounds).
 * 4. Match completion:
 *    - If 1 active player remains: that player wins!
 *    - Tie-break: If ALL active players cross 502 in the same round,
 *      the player with the LOWEST cumulative score wins.
 */
export function evaluateEliminationAndWinner(
  players: Player[],
  roundScores: Record<string, number>,
  winnerId: string
): EliminationEvaluationResult {
  const eliminatedThisRound: string[] = [];

  const updatedPlayers = players.map(player => {
    if (player.isEliminated) {
      return player;
    }

    const roundScore = roundScores[player.id] || 0;
    const newCumulative = player.cumulativeScore + roundScore;
    const isWinner = player.id === winnerId;

    // Check elimination
    if (newCumulative >= ELIMINATION_THRESHOLD) {
      if (isWinner) {
        // Protected this round!
        return {
          ...player,
          cumulativeScore: newCumulative,
          lastRoundScore: roundScore,
          immuneThisRound: true,
          isEliminated: false,
        };
      } else {
        // Eliminated
        eliminatedThisRound.push(player.id);
        return {
          ...player,
          cumulativeScore: newCumulative,
          lastRoundScore: roundScore,
          immuneThisRound: false,
          isEliminated: true,
        };
      }
    }

    // Normal survivor
    return {
      ...player,
      cumulativeScore: newCumulative,
      lastRoundScore: roundScore,
      immuneThisRound: false,
      isEliminated: false,
    };
  });

  const survivors = updatedPlayers.filter(p => !p.isEliminated);

  // Match victory conditions
  if (survivors.length === 1) {
    return {
      updatedPlayers,
      eliminatedThisRound,
      isMatchOver: true,
      matchWinnerId: survivors[0].id,
    };
  }

  if (survivors.length === 0) {
    // All remaining players crossed 502 in this round!
    // Lowest total wins tie-break:
    const activeContenders = updatedPlayers.filter(p =>
      eliminatedThisRound.includes(p.id)
    );
    const sorted = [...activeContenders].sort(
      (a, b) => a.cumulativeScore - b.cumulativeScore
    );
    const tieWinnerId = sorted.length > 0 ? sorted[0].id : updatedPlayers[0].id;

    return {
      updatedPlayers,
      eliminatedThisRound,
      isMatchOver: true,
      matchWinnerId: tieWinnerId,
    };
  }

  // 2 or more players still active
  return {
    updatedPlayers,
    eliminatedThisRound,
    isMatchOver: false,
    matchWinnerId: null,
  };
}
