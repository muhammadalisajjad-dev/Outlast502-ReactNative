import { Card } from '../types/card';
import { PenaltyState } from '../types/game';

export const INITIAL_PENALTY_STATE: PenaltyState = {
  type: null,
  cardsOwed: 0,
  active: false,
};

/**
 * Calculates the new penalty state after a card is played.
 *
 * Rules:
 * - Rank '2':
 *   - Stacks: adds 2 to cards owed (2, 4, 6, 8 max from 4 twos).
 *   - Type is 'two'.
 * - Rank 'A' (specifically A♠ initiates):
 *   - If A♠ is played when no ace penalty is active: initiates 5-card penalty.
 *   - If any Ace (A♥, A♦, A♣, A♠) is played on a pending Ace penalty: passes 5 cards (never increases!).
 * - Rank '8':
 *   - Initiates or passes a skip. cardsOwed is 0.
 * - Any other card:
 *   - Clears penalty state (normal card play).
 */
export function calculateNextPenaltyState(
  playedCard: Card,
  currentPenalty: PenaltyState
): PenaltyState {
  // Playing a 2
  if (playedCard.rank === '2') {
    const previousOwed = currentPenalty.active && currentPenalty.type === 'two' ? currentPenalty.cardsOwed : 0;
    return {
      type: 'two',
      cardsOwed: previousOwed + 2,
      active: true,
    };
  }

  // Playing an Ace
  if (playedCard.rank === 'A') {
    if (currentPenalty.active && currentPenalty.type === 'ace') {
      // Passing the existing Ace penalty: stays exactly 5 cards
      return {
        type: 'ace',
        cardsOwed: 5,
        active: true,
      };
    }
    // Normal turn play of an Ace: only Ace of Spades triggers a new 5-card penalty!
    if (playedCard.suit === 'spades') {
      return {
        type: 'ace',
        cardsOwed: 5,
        active: true,
      };
    }
    // Other Aces played during normal turn have NO offensive penalty
    return INITIAL_PENALTY_STATE;
  }

  // Playing an 8
  if (playedCard.rank === '8') {
    return {
      type: 'skip',
      cardsOwed: 0,
      active: true,
    };
  }

  // Any other card played (e.g. Jack, 7, normal card)
  return INITIAL_PENALTY_STATE;
}
