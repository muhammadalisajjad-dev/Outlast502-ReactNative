import { Player } from '../types/game';

/**
 * Returns the index of the next active (non-eliminated) player in clockwise order.
 */
export function getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number,
  steps: number = 1
): number {
  const total = players.length;
  let index = currentIndex;
  let stepsRemaining = steps;

  while (stepsRemaining > 0) {
    index = (index + 1) % total;
    if (!players[index].isEliminated) {
      stepsRemaining--;
    }
  }

  return index;
}

/**
 * Returns the active players list.
 */
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => !p.isEliminated);
}
